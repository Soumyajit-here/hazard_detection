const API_BASE = "http://127.0.0.1:5000"; // Flask backend

const uploadVideo = async (videoFile, lat, lon) => {
  const formData = new FormData();
  formData.append("video", videoFile); // must match backend key
  if (lat && lon) {
    formData.append("lat", lat.toString());
    formData.append("lon", lon.toString());
  }

  const response = await fetch(`${API_BASE}/detect`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

  // backend should return video blob
  const blob = await response.blob();
  return blob;
};

export default { uploadVideo };
