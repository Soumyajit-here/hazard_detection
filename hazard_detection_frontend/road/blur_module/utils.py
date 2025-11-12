import os

def ensure_dir(folder):
    if not os.path.exists(folder):
        os.makedirs(folder)
