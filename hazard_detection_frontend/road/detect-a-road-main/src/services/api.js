// src/services/api.js

// ✅ Use environment variable or fallback to localhost
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

/**
 * Uploads video with coordinates to backend for pothole detection
 * @param {FormData} formData - FormData containing 'video', 'lat', 'lon'
 * @returns {Promise<Blob>} - Blob of the processed video
 */
export async function uploadVideo(formData) {
  try {
    console.log("📤 Uploading video to:", `${BACKEND_URL}/detect`);
    
    const response = await fetch(`${BACKEND_URL}/detect`, {
      method: "POST",
      body: formData,
      // Don't set Content-Type - browser sets it with boundary for multipart/form-data
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("❌ Backend error response:", errText);
      
      // Try to parse JSON error, fallback to text
      let errorMessage;
      try {
        const errorJson = JSON.parse(errText);
        errorMessage = errorJson.error || response.statusText;
      } catch {
        errorMessage = errText || response.statusText;
      }
      
      throw new Error(`Upload failed: ${errorMessage}`);
    }

    // ✅ Return the blob directly for processed video
    const blob = await response.blob();
    console.log("✅ Received processed video blob:", blob.size, "bytes");
    
    return blob;
  } catch (error) {
    console.error("⚠️ Backend API error:", error);
    throw error;
  }
}

/**
 * Health check to verify backend is running
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("❌ Backend health check failed:", error);
    return false;
  }
}

// Export as default object for compatibility with existing imports
export default {
  uploadVideo,
  checkBackendHealth,
};