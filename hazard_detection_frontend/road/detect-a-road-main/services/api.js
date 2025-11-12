// src/services/api.js
const BACKEND_URL = "http://127.0.0.1:5000";

export async function uploadVideo(videoFile) {
  const formData = new FormData();
  formData.append("video", videoFile); // must match Flask key exactly

  try {
    const response = await fetch(`${BACKEND_URL}/detect`, {
      method: "POST",
      body: formData,
      headers: {
        // Don't manually set Content-Type; fetch handles it automatically
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Backend returned:", errText);
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    // ✅ Get the blob for video response
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("⚠️ Backend API error:", error);
    throw error;
  }
}
