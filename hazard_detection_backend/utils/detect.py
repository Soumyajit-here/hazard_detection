import os
from pathlib import Path
import logging
from ultralytics import YOLO

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join("model", "best.pt")
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model missing at {MODEL_PATH}. Place best.pt there.")

MODEL = YOLO(MODEL_PATH)


def stitch_frames_to_video(frames_dir: str, out_video_path: str, fps: int = 20):
    """Create a video from frame images (jpg/png) in frames_dir."""
    import cv2, glob

    images = sorted(glob.glob(os.path.join(frames_dir, "*.jpg")) + glob.glob(os.path.join(frames_dir, "*.png")))
    if not images:
        raise RuntimeError("No frames to stitch in: " + frames_dir)
    first = cv2.imread(images[0])
    h, w = first.shape[:2]
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(out_video_path, fourcc, fps, (w, h))
    for img in images:
        frame = cv2.imread(img)
        writer.write(frame)
    writer.release()
    return out_video_path


def detect_potholes_video(source_path: str, save_dir: str = "static/results", conf: float = 0.35):
    """
    Run YOLOv8 on a video. Returns the path to the processed video.
    Ultralytics will save outputs to save_dir/pothole_output.
    """
    os.makedirs(save_dir, exist_ok=True)
    logger.info("Detecting: %s", source_path)

    # Run detection (this saves outputs into save_dir/pothole_output/)
    results = MODEL.predict(
        source=source_path,
        save=True,
        project=save_dir,
        name="pothole_output",
        conf=conf,
        imgsz=640,
        device="cpu"
    )

    out_folder = os.path.join(save_dir, "pothole_output")
    if not os.path.exists(out_folder):
        raise RuntimeError("Expected output folder not found: " + out_folder)

    # Get all files sorted by modification time
    files = sorted([os.path.join(out_folder, f) for f in os.listdir(out_folder)],
                   key=lambda p: os.path.getmtime(p))
    if not files:
        raise RuntimeError("No output files produced by YOLO in " + out_folder)

    latest = files[-1]
    ext = Path(latest).suffix.lower()
    if ext in [".mp4", ".mov", ".avi", ".mkv", ".webm"]:
        return latest
    # if the latest is an image or many images, stitch
    if ext in [".jpg", ".png"] or any([f.endswith((".jpg", ".png")) for f in files]):
        stitched = os.path.join(out_folder, "stitched_output.mp4")
        return stitch_frames_to_video(out_folder, stitched, fps=20)
    # fallback: return latest path
    return latest
