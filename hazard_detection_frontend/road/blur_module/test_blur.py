import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from blur_module import blur_faces_and_plates

input_video = "uploads/test_road.mp4"
output_video = "processed/output_blurred.mp4"

blur_faces_and_plates(input_video, output_video)
print("✅ Done! Check processed/output_blurred.mp4")
