import { useEffect, useState } from "react";
import { MdClose, MdOpenInNew, MdDownload } from "react-icons/md";
import { getBlobUrlFromDataUri, openFileResource } from "../../utils/fileViewer";

function FilePreviewModal({ url, title = "Document Preview", onClose }) {
  const [targetUrl, setTargetUrl] = useState("");
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    if (!url) return;

    let finalUrl = url;
    if (url.startsWith("data:")) {
      finalUrl = getBlobUrlFromDataUri(url);
    }
    setTargetUrl(finalUrl);

    if (url.startsWith("data:application/pdf") || url.toLowerCase().includes(".pdf")) {
      setIsPdf(true);
    } else if (url.startsWith("data:image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url)) {
      setIsImage(true);
    } else {
      setIsPdf(true);
    }
  }, [url]);

  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-richblack-700 bg-richblack-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-richblack-700 px-6 py-4">
          <div>
            <h3 className="font-semibold text-richblack-5">{title}</h3>
            <p className="text-xs text-richblack-400">PDF / Material Preview</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openFileResource(url, title.toLowerCase().endsWith('.pdf') ? title : `${title}.pdf`)}
              className="flex items-center gap-1.5 rounded-lg border border-richblack-600 bg-richblack-700 px-3 py-1.5 text-xs font-medium text-richblack-100 hover:bg-richblack-600 hover:text-white transition-all"
            >
              <MdOpenInNew size={16} /> Open in New Tab
            </button>
            <a
              href={targetUrl}
              download={title.toLowerCase().endsWith('.pdf') ? title : `${title}.pdf`}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-richblack-900 hover:bg-yellow-25 transition-all"
            >
              <MdDownload size={16} /> Download
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-richblack-300 hover:bg-richblack-700 hover:text-richblack-5"
            >
              <MdClose size={22} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-richblack-900 p-2 overflow-auto flex items-center justify-center">
          {isImage ? (
            <img
              src={targetUrl}
              alt="Preview"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          ) : isPdf ? (
            <object
              data={targetUrl}
              type="application/pdf"
              className="h-full w-full rounded-lg border-0 bg-white"
            >
              <embed src={targetUrl} type="application/pdf" className="h-full w-full rounded-lg" />
              <div className="text-center p-6 text-richblack-300">
                <p className="mb-4">Inline PDF preview is not supported on your browser.</p>
                <button
                  onClick={() => openFileResource(url, title)}
                  className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900"
                >
                  Download / View PDF
                </button>
              </div>
            </object>
          ) : (
            <div className="text-center p-6 text-richblack-300">
              <p className="mb-4">Unable to display preview directly inside browser.</p>
              <button
                onClick={() => openFileResource(url, title)}
                className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900"
              >
                Open File Externally
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilePreviewModal;
