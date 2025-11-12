import cv2
import os

def blur_faces(input_path, output_path):
    # Load pretrained Haar Cascade for face detection
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    # Open input video
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise Exception(f"Cannot open video: {input_path}")

    # Get frame width/height and FPS
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Create output video writer
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (frame_width, frame_height))

    # Frame-by-frame processing
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        # Apply blur to each face
        for (x, y, w, h) in faces:
            roi = frame[y:y+h, x:x+w]
            blurred_roi = cv2.GaussianBlur(roi, (99, 99), 30)
            frame[y:y+h, x:x+w] = blurred_roi

        out.write(frame)

    cap.release()
    out.release()
    return output_path
