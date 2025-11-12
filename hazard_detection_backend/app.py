import os
from flask import Flask, request, send_file, render_template, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from utils.detect import detect_potholes_video
from privacy_blur.service import apply_blur

# ------------------- Config -------------------
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
RESULTS_DIR = os.path.join(BASE_DIR, "static", "results")
BLUR_DIR = os.path.join(RESULTS_DIR, "blurred")

for folder in [UPLOAD_DIR, RESULTS_DIR, BLUR_DIR]:
    os.makedirs(folder, exist_ok=True)

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500 MB

# ✅ CORS setup for all dev hosts
CORS(app, resources={r"/*": {"origins": ["http://localhost:8081", "http://127.0.0.1:8081", "http://192.168.0.168:8081"]}})

# ----------------- Helpers -------------------
def allowed_file(filename: str) -> bool:
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

def clear_folder(folder_path: str):
    for f in os.listdir(folder_path):
        file_path = os.path.join(folder_path, f)
        if os.path.isfile(file_path):
            os.remove(file_path)

# ----------------- Routes --------------------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/detect", methods=["POST"])
def detect_route():
    print("🔍 DEBUG: Incoming POST /detect request")
    print("🔍 DEBUG: request.content_type =", request.content_type)
    print("🔍 DEBUG: request.files keys =", list(request.files.keys()))

    if "video" not in request.files:
        print("❌ ERROR: No file part received from frontend")
        return jsonify({"error": "No video file received. Use form key 'video'."}), 400

    file = request.files["video"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    filename = secure_filename(file.filename)
    upload_path = os.path.join(UPLOAD_DIR, filename)

    clear_folder(UPLOAD_DIR)
    clear_folder(RESULTS_DIR)
    clear_folder(BLUR_DIR)

    file.save(upload_path)
    print(f"✅ File saved at: {upload_path}")

    try:
        # Run detection and blur
        detected_path = detect_potholes_video(upload_path, save_dir=RESULTS_DIR, conf=0.35)
        print(f"✅ Detection done: {detected_path}")

        blurred_path = apply_blur(detected_path, output_dir=BLUR_DIR)
        print(f"✅ Blurring done: {blurred_path}")

        return send_file(blurred_path, mimetype="video/mp4")

    except Exception as e:
        print(f"❌ Error during processing: {e}")
        return jsonify({"error": str(e)}), 500

# ----------------- Main ----------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
