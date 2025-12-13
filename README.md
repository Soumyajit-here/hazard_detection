# 🚧 Road Hazard Detection & Mapping

A real-time **road hazard detection and mapping system** that identifies potholes and road anomalies using computer vision and visualizes them on an interactive map to improve driver awareness and road safety.

This project was developed as part of a **team hackathon** and focuses on combining **AI-based detection**, **geospatial data**, and a **modern web interface**.

---

## 🧠 Problem Statement

Poor road conditions are a major contributor to:
- Vehicle damage
- Traffic congestion
- Road accidents

Manual reporting systems are slow and inconsistent. This project aims to provide an **automated, scalable, and visual solution** for detecting and tracking road hazards.

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

