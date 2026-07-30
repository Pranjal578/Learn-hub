// ─────────────────────────────────────────────────────────────
//  File Upload Validator — LearnHub
//
//  Validates uploads BEFORE passing to Cloudinary:
//  1. MIME type must be in the strict allowlist
//  2. Magic bytes of the actual file content are verified
//     (prevents spoofing by renaming .exe → .jpg)
//  3. Per-route size limits enforced
//  4. Executable extensions hard-rejected
// ─────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

// ── Allowlists ────────────────────────────────────────────────
const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_VIDEO_MIMES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]);

const ALLOWED_MIMES = new Set([...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES]);

// Executable extensions that must NEVER be uploaded regardless of MIME
const BLOCKED_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.php', '.py', '.rb',
  '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd',
  '.exe', '.dll', '.so', '.bin', '.elf',
  '.html', '.htm', '.xml', '.svg',
  '.json', '.yaml', '.yml',
]);

// ── Magic byte signatures ─────────────────────────────────────
// Returns true if the buffer starts with any of the given hex prefixes
const matchesMagic = (buf, ...hexPrefixes) =>
  hexPrefixes.some((hex) => {
    const bytes = Buffer.from(hex, 'hex');
    return buf.slice(0, bytes.length).equals(bytes);
  });

const MAGIC_VALIDATORS = {
  'image/jpeg': (buf) => matchesMagic(buf, 'ffd8ff'),
  'image/png':  (buf) => matchesMagic(buf, '89504e47'),
  'image/webp': (buf) => matchesMagic(buf, '52494646') && buf.slice(8, 12).toString('ascii') === 'WEBP',
  'image/gif':  (buf) => matchesMagic(buf, '47494638'),
  'video/mp4':  (buf) =>
    // ftyp box at offset 4; many valid mp4 signatures
    buf.slice(4, 8).toString('ascii') === 'ftyp' ||
    matchesMagic(buf, '000000', '0000001c', '0000001a'),
  'video/webm': (buf) => matchesMagic(buf, '1a45dfa3'),
  'video/quicktime': (buf) =>
    buf.slice(4, 8).toString('ascii') === 'ftyp' ||
    buf.slice(4, 8).toString('ascii') === 'moov' ||
    buf.slice(4, 8).toString('ascii') === 'free',
  'video/x-msvideo': (buf) => matchesMagic(buf, '52494646') && buf.slice(8, 12).toString('ascii') === 'AVI ',
};

// ── Size limits ───────────────────────────────────────────────
const MAX_IMAGE_BYTES = (Number(process.env.UPLOAD_MAX_IMAGE_MB) || 10) * 1024 * 1024;
const MAX_VIDEO_BYTES = (Number(process.env.UPLOAD_MAX_VIDEO_MB) || 500) * 1024 * 1024;

// ── Core validator function ───────────────────────────────────
/**
 * Validate a single file object from express-fileupload.
 * Returns { valid: true } or { valid: false, reason: string }
 */
const validateFile = (file, allowedMimes = ALLOWED_MIMES) => {
  if (!file) return { valid: false, reason: 'No file provided' };

  // 1. Blocked extension check
  const ext = path.extname(file.name || '').toLowerCase();
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, reason: `File type '${ext}' is not permitted` };
  }

  // 2. MIME type allowlist
  const mime = (file.mimetype || '').toLowerCase();
  if (!allowedMimes.has(mime)) {
    return {
      valid: false,
      reason: `File MIME type '${mime}' is not allowed. Allowed: ${[...allowedMimes].join(', ')}`,
    };
  }

  // 3. Size limit
  const isVideo = ALLOWED_VIDEO_MIMES.has(mime);
  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > limit) {
    const limitMB = limit / 1024 / 1024;
    return { valid: false, reason: `File exceeds the maximum allowed size of ${limitMB} MB` };
  }

  // 4. Magic bytes — read first 16 bytes from temp file
  try {
    const filePath = file.tempFilePath || file.path;
    if (filePath && fs.existsSync(filePath)) {
      const fd = fs.openSync(filePath, 'r');
      const buf = Buffer.alloc(16);
      fs.readSync(fd, buf, 0, 16, 0);
      fs.closeSync(fd);

      const validator = MAGIC_VALIDATORS[mime];
      if (validator && !validator(buf)) {
        return {
          valid: false,
          reason: 'File content does not match its declared type. Upload rejected.',
        };
      }
    }
  } catch (e) {
    // Log but do not expose error detail; treat as invalid to be safe
    console.error('[fileValidator] Magic bytes check failed:', e.message);
    return { valid: false, reason: 'Could not verify file content. Upload rejected.' };
  }

  return { valid: true };
};

// ── Express middleware factories ──────────────────────────────

/** Validate a single file field (e.g. profile picture, thumbnail) */
const validateImageUpload = (fieldName) => (req, res, next) => {
  if (!req.files || !req.files[fieldName]) return next(); // optional upload
  const result = validateFile(req.files[fieldName], ALLOWED_IMAGE_MIMES);
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.reason });
  }
  next();
};

/** Validate a video upload field */
const validateVideoUpload = (fieldName) => (req, res, next) => {
  const file = req.files?.[fieldName];
  if (!file) return next(); // handled by controller
  const result = validateFile(file, ALLOWED_VIDEO_MIMES);
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.reason });
  }
  next();
};

/** Validate any file (image or video) against the full allowlist */
const validateAnyUpload = (fieldName) => (req, res, next) => {
  const file = req.files?.[fieldName];
  if (!file) return next();
  const result = validateFile(file, ALLOWED_MIMES);
  if (!result.valid) {
    return res.status(400).json({ success: false, message: result.reason });
  }
  next();
};

module.exports = {
  validateFile,
  validateImageUpload,
  validateVideoUpload,
  validateAnyUpload,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  ALLOWED_MIMES,
};
