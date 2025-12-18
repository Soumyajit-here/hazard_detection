# 🚧 Road Hazard Detection & Mapping

A real-time **road hazard detection and mapping system** that identifies potholes and road anomalies using computer vision and visualizes them on an interactive map to improve driver awareness and road safety.

This project was developed as part of a **team hackathon** and focuses on combining **AI-based detection**, **geospatial data**, and a **modern web interface**.

---

## 🧠 Problem Statement

Poor road conditions are a major contributor to:
- Vehicle damage
- Traffic congestion
- Road accidents

Manual reporting systems are slow and inconsistent. This project aims to provide an **automated, scalable, and visual solution** for detecting and tracking road hazards

---

## ✨ Key Features

- 📸 **YOLO-based road hazard detection** (e.g., potholes)
- 📍 **GPS geotagging** of detected hazards
- 🗺️ **Interactive map visualization** with clustering
- ✋ **Manual hazard reporting** via map clicks
- 🎯 **Severity-based styling** for better prioritization
- 🧭 Driver-facing hazard awareness overlay
- 🔒 **Privacy-aware blurring** of faces and license plates

---

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- ShadCN UI
- MapLibre GL

### Backend
- Python
- YOLO (Object Detection)
- REST APIs for detection ingestion and retrieval

---

## 🏗️ System Architecture

1. Road images or video frames are captured
2. YOLO model detects road hazards
3. Detected hazards are assigned severity levels
4. GPS coordinates are attached to each detection
5. Backend APIs store and expose hazard data
6. Frontend fetches and visualizes hazards on a live map

---

## 📁 Repository Structure



---

# 🚧 Hazard Detection System

**AI-Powered Road Hazard Detection with Privacy Blur**

This repository contains a **full-stack web application** with:

* **Backend**: Flask + YOLO (pothole detection & privacy blur)
* **Frontend**: React (video upload, detection UI, map)

---

## 📦 Requirements

Install these **before** running the app:

* **Python** `3.8 – 3.11`
* **Node.js** `18+`
* **pip**
* **npm**

Check installation:

```bash
python --version
node --version
npm --version
```

---

## 🚀 Quick Start (Recommended)

You need **two terminals**:

* Terminal 1 → Backend
* Terminal 2 → Frontend

---

## 🔧 Backend Setup (Flask + YOLO)

### 📍 Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd hazard_app
```

---

### 📍 Step 2: Enter Backend Folder

```bash
cd hazard_detection_backend
```

---

### 📍 Step 3: Create Virtual Environment (First Time Only)

```bash
python -m venv venv
```

---

### 📍 Step 4: Activate Virtual Environment

#### Windows (PowerShell)

```powershell
.\venv\Scripts\activate
```

#### macOS / Linux

```bash
source venv/bin/activate
```

You should see:

```
(venv)
```

---

### 📍 Step 5: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

---

### 📍 Step 6: Verify YOLO Model

Make sure this file exists:

```
hazard_detection_backend/model/best.pt
```

> ❗ The backend **will not run** without this file.

---

### ▶️ Step 7: Start Backend Server

```bash
python app.py
```

Expected output:

```
Running on http://127.0.0.1:5000
```

✅ Backend is now live.

---

## 🌐 Frontend Setup (React)

### 📍 Step 1: Open a New Terminal

Leave backend running.

---

### 📍 Step 2: Navigate to Frontend Folder

```bash
cd hazard_detection_frontend/road/detect-a-road-main
```

---

### 📍 Step 3: Install Frontend Dependencies (First Time Only)

```bash
npm install
```

---

### ▶️ Step 4: Start Frontend

```bash
npm start
```

Expected:

```
Local: http://localhost:3000
```

A browser window should open automatically.

---

## 🔗 Frontend ↔ Backend Integration

The frontend communicates with the backend at:

```
http://localhost:5000/detect
```

This is configured in:

```
src/services/api.js
```

```js
const BACKEND_URL = "http://localhost:5000";
```

> ⚠️ If backend runs on a different machine, update this URL.

---

## 🧠 How the App Works

1. User uploads a road video
2. Frontend sends video to backend
3. Backend:

   * Detects potholes (YOLOv8)
   * Blurs faces & number plates
   * Saves metadata (location + timestamp)
4. Processed video is returned
5. Frontend displays & allows download

---

## 🧪 Backend Test (Optional)

Open browser:

```
http://localhost:5000
```

If backend is running, no error should appear.

---

## 🛠 Common Issues

### ❌ Port Already in Use

Change backend port in `app.py`:

```python
app.run(host="0.0.0.0", port=5001)
```

Then update frontend:

```js
const BACKEND_URL = "http://localhost:5001";
```

---

### ❌ CORS Error

Already handled via `flask-cors` in backend.

---

## 🧹 Stopping the App

In each terminal:

```bash
CTRL + C
```

---

## 📌 Minimal MVP Mode (Fastest)

```bash
# Terminal 1
cd hazard_detection_backend
python app.py

# Terminal 2
cd hazard_detection_frontend/road/detect-a-road-main
npm start
```

---

## 🚀 Deployment Ready

This setup works for:

* Local development
* LAN testing
* Cloud deployment (with minor changes)

---





