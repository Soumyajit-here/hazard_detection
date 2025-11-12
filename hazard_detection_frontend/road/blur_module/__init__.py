from .blur_faces import blur_faces
from .blur_plates import blur_number_plates
import os

def blur_faces_and_plates(input_path, output_path="processed/output_blurred.mp4"):
    # make sure folders exist
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    processed_dir = os.path.join(base_dir, "processed")
    os.makedirs(processed_dir, exist_ok=True)

    temp_path = os.path.join(processed_dir, "temp_faces.mp4")
    output_path = os.path.join(base_dir, output_path)

    print(f"[INFO] Input: {input_path}")
    print(f"[INFO] Output: {output_path}")

    print("[INFO] Blurring faces...")
    blur_faces(input_path, temp_path)

    print("[INFO] Blurring number plates...")
    blur_number_plates(temp_path, output_path)

    # cleanup
    if os.path.exists(temp_path):
        os.remove(temp_path)

    if os.path.exists(output_path):
        print(f"[SUCCESS] Blurred video saved at: {output_path}")
    else:
        print("[ERROR] Output file not found — check blur functions.")

    return output_path
