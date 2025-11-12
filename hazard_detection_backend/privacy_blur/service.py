import os
from .blur_faces import blur_faces
from .blur_plates import blur_number_plates

def apply_blur(input_path: str, output_dir: str = "static/results/blurred"):
    """
    Runs face blur then plate blur sequentially.
    Returns final blurred video path.
    """
    os.makedirs(output_dir, exist_ok=True)
    base = os.path.basename(input_path)
    name, ext = os.path.splitext(base)

    temp_face = os.path.join(output_dir, f"{name}_faceblur{ext}")
    final_out = os.path.join(output_dir, f"{name}_blurred{ext}")

    # Run face blur (returns temp_face)
    if not blur_faces(input_path, temp_face):
        raise RuntimeError("Face blur failed")

    # Run plate blur on face-blurred video (returns final_out)
    if not blur_number_plates(temp_face, final_out):
        raise RuntimeError("Plate blur failed")

    if not os.path.exists(final_out):
        raise RuntimeError("Blurred output not found: " + final_out)

    return final_out
