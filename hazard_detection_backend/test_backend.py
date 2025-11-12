import requests

url = "http://127.0.0.1:5000/detect"
files = {"video": open("video2.mp4", "rb")}  # replace with your video
data = {"lat": "23.4567", "lon": "88.1234"}

response = requests.post(url, files=files, data=data)
print(response.status_code)
print(response.text)
