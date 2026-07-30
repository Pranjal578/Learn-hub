const express = require('express');
const app = express();

// packages
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const os = require('os');
require('dotenv').config();

// connection to DB and cloudinary
const { connectDB } = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');

// routes
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payments');
const courseRoutes = require('./routes/course');
const classroomRoutes = require('./routes/classroom');
const quizRoutes = require('./routes/quiz');
const certificateRoutes = require('./routes/certificate');

// security middleware
const { publicLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');


// ── Core middleware ───────────────────────────────────────────

// Parse JSON bodies (limit prevents large payload DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// CORS — restrict to the configured frontend origin
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or same-origin requests (no Origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// File uploads — store in OS temp dir; size limit configurable
const MAX_UPLOAD_BYTES =
  (Number(process.env.UPLOAD_MAX_VIDEO_MB) || 500) * 1024 * 1024;

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: os.tmpdir(),
    createParentPath: true,
    limits: { fileSize: MAX_UPLOAD_BYTES },
    abortOnLimit: true,           // Reject oversized uploads immediately
    responseOnLimit: JSON.stringify({
      success: false,
      message: `File exceeds the maximum allowed upload size of ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB`,
    }),
  })
);

// Global public rate limiter (applied before all routes)
app.use(publicLimiter);


// ── Connections ───────────────────────────────────────────────
connectDB();
cloudinaryConnect();


// ── Routes ────────────────────────────────────────────────────
app.use('/api/v1/auth',        userRoutes);
app.use('/api/v1/profile',     profileRoutes);
app.use('/api/v1/payment',     paymentRoutes);
app.use('/api/v1/course',      courseRoutes);
app.use('/api/v1/classroom',   classroomRoutes);
app.use('/api/v1/quiz',        quizRoutes);
app.use('/api/v1/certificate', certificateRoutes);


// ── Default / health route ────────────────────────────────────
const mongoose = require('mongoose');
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});


// ── Global error handler (must be last) ──────────────────────
app.use(errorHandler);


// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on PORT ${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
});