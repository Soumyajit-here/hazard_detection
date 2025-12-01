import os
import json
from datetime import datetime
from flask import Flask, request, send_file, render_template, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from utils.unified_detection import process_video_unified

# ------------------- Config -------------------
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
RESULTS_DIR = os.path.join(BASE_DIR, "static", "results")
DATA_DIR = os.path.join(BASE_DIR, "data")

for folder in [UPLOAD_DIR, RESULTS_DIR, DATA_DIR]:
    os.makedirs(folder, exist_ok=True)

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500 MB

CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:8080",
            "http://127.0.0.1:8081",
            "http://192.168.0.168:8081",
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
    }
})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ----------------- Helpers -------------------
def allowed_file(filename: str) -> bool:
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

def clear_folder(folder_path: str):
    """Clear all files in folder"""
    for f in os.listdir(folder_path):
        file_path = os.path.join(folder_path, f)
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"⚠️ Could not delete {file_path}: {e}")

def save_detection_metadata(filename: str, lat: float, lon: float, stats: dict):
    """Save detection metadata"""
    metadata_file = os.path.join(DATA_DIR, "detections.json")
    
    detection_data = {
        "filename": filename,
        "start_latitude": lat,
        "start_longitude": lon,
        "timestamp": datetime.utcnow().isoformat(),
        "statistics": stats
    }
    
    if os.path.exists(metadata_file):
        with open(metadata_file, 'r') as f:
            try:
                detections = json.load(f)
            except json.JSONDecodeError:
                detections = []
    else:
        detections = []
    
    detections.append(detection_data)
    
    with open(metadata_file, 'w') as f:
        json.dump(detections, f, indent=2)
    
    print(f"✅ Saved metadata")
    return detection_data

# ----------------- Routes --------------------
@app.route("/")
def index():
    return jsonify({
        "status": "online",
        "message": "Pothole Detection API",
        "endpoints": {
            "/detect": "POST - Upload video",
            "/detections": "GET - Get all detections",
            "/stats": "GET - Get statistics"
        }
    })

@app.route("/detect", methods=["POST", "OPTIONS"])
def detect_route():
    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    
    print("\n" + "="*60)
    print("🔍 NEW DETECTION REQUEST")
    print("="*60)
    print(f"Method: {request.method}")
    print(f"Content-Type: {request.content_type}")
    print(f"Content-Length: {request.content_length}")
    print(f"Files keys: {list(request.files.keys())}")
    print(f"Form keys: {list(request.form.keys())}")
    print(f"Origin: {request.headers.get('Origin', 'Not set')}")
    
    # Validate file exists
    if "video" not in request.files:
        print("❌ ERROR: No 'video' key in request.files")
        print(f"   Available keys: {list(request.files.keys())}")
        return jsonify({"error": "No video file. Use form key 'video'"}), 400

    file = request.files["video"]
    print(f"\n📹 FILE DETAILS:")
    print(f"   Object: {file}")
    print(f"   Filename: '{file.filename}'")
    print(f"   Content-Type: {file.content_type}")
    print(f"   Content-Length: {file.content_length}")

    if not file.filename or file.filename == "":
        print("❌ ERROR: Empty filename")
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        print(f"❌ ERROR: Unsupported file type")
        print(f"   Extension: {os.path.splitext(file.filename)[1]}")
        print(f"   Allowed: {ALLOWED_EXTENSIONS}")
        return jsonify({"error": f"Unsupported file type. Allowed: {ALLOWED_EXTENSIONS}"}), 400

    # Extract coordinates
    lat = request.form.get("lat")
    lon = request.form.get("lon")
    
    if not lat or not lon:
        print("⚠️  No coordinates provided")
        lat, lon = None, None
    else:
        try:
            lat = float(lat)
            lon = float(lon)
            print(f"📍 Coordinates: ({lat}, {lon})")
        except ValueError:
            print("⚠️  Invalid coordinate format")
            lat, lon = None, None

    # Save file
    filename = secure_filename(file.filename)
    upload_path = os.path.join(UPLOAD_DIR, filename)
    
    print(f"\n💾 SAVING FILE:")
    print(f"   Secure filename: {filename}")
    print(f"   Upload path: {upload_path}")
    
    # Clear old files
    print(f"🗑️  Clearing old files...")
    clear_folder(UPLOAD_DIR)
    clear_folder(RESULTS_DIR)

    # Save the uploaded file
    try:
        print(f"   Saving to disk...")
        file.save(upload_path)
        
        # Verify file was saved
        if not os.path.exists(upload_path):
            raise FileNotFoundError(f"File not found after save: {upload_path}")
        
        file_size = os.path.getsize(upload_path)
        print(f"✅ File saved successfully!")
        print(f"   Size on disk: {file_size / (1024*1024):.2f} MB")
        print(f"   Path exists: {os.path.exists(upload_path)}")
        print(f"   Is file: {os.path.isfile(upload_path)}")
        
    except Exception as e:
        print(f"❌ ERROR saving file: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to save file: {str(e)}"}), 500

    # Process video
    try:
        print(f"\n🚀 STARTING VIDEO PROCESSING")
        output_path = os.path.join(RESULTS_DIR, f"processed_{filename}")
        
        stats = process_video_unified(
            source_path=upload_path,
            output_path=output_path,
            start_lat=lat,
            start_lon=lon,
            end_lat=lat,
            end_lon=lon,
            conf=0.25,  # 🎯 High sensitivity for best detection
            use_gpu=True  # 🚀 GPU acceleration (10x faster, no accuracy loss)
        )
        
        print(f"\n✅ PROCESSING COMPLETE")
        print(f"   Potholes: {stats['total_potholes']}")
        print(f"   Time: {stats['processing_time']:.1f}s")
        print(f"   Speed: {stats['processing_fps']:.1f} fps")

        # Save metadata
        if lat is not None and lon is not None:
            save_detection_metadata(filename, lat, lon, stats)

        # Verify output exists
        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Output video not created: {output_path}")
        
        print(f"   Output size: {os.path.getsize(output_path) / (1024*1024):.2f} MB")
        print(f"\n📤 SENDING FILE TO CLIENT")
        
        return send_file(output_path, mimetype="video/mp4")

    except Exception as e:
        print(f"\n❌ ERROR DURING PROCESSING:")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/detections", methods=["GET"])
def get_detections():
    """Get all detection metadata"""
    metadata_file = os.path.join(DATA_DIR, "detections.json")
    
    if os.path.exists(metadata_file):
        with open(metadata_file, 'r') as f:
            try:
                detections = json.load(f)
                return jsonify(detections)
            except json.JSONDecodeError:
                return jsonify([])
    
    return jsonify([])

@app.route("/stats", methods=["GET"])
def get_overall_stats():
    """Get overall statistics"""
    metadata_file = os.path.join(DATA_DIR, "detections.json")
    
    if not os.path.exists(metadata_file):
        return jsonify({
            "total_videos": 0,
            "total_potholes": 0,
            "total_distance_km": 0
        })
    
    with open(metadata_file, 'r') as f:
        try:
            detections = json.load(f)
        except json.JSONDecodeError:
            detections = []
    
    total_potholes = sum(d.get("statistics", {}).get("total_potholes", 0) for d in detections)
    total_distance = sum(d.get("statistics", {}).get("distance_km", 0) for d in detections)
    
    return jsonify({
        "total_videos": len(detections),
        "total_potholes": total_potholes,
        "total_distance_km": round(total_distance, 2),
        "latest_detection": detections[-1] if detections else None
    })

# ----------------- Main ----------------------
if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 Pothole Detection API Starting")
    print("="*60)
    print(f"Upload dir: {UPLOAD_DIR}")
    print(f"Results dir: {RESULTS_DIR}")
    print(f"Data dir: {DATA_DIR}")
    print("="*60 + "\n")
    
    app.run(host="0.0.0.0", port=5000, debug=True)