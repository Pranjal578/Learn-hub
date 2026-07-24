// Utility to convert Data URIs into Blob URLs and open files reliably in browsers

export const getBlobUrlFromDataUri = (dataUri) => {
  try {
    const arr = dataUri.split(",");
    if (arr.length < 2) return dataUri;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
    const cleanBase64 = arr[1].trim().replace(/\s/g, "");
    const bstr = atob(cleanBase64);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error creating Blob URL from Data URI:", error);
    return dataUri;
  }
};

export const openFileResource = (url, fileName = "document.pdf") => {
  if (!url) return;

  if (url.startsWith("data:")) {
    const blobUrl = getBlobUrlFromDataUri(url);
    const win = window.open(blobUrl, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};
