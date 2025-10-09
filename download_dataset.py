import os
import subprocess
import requests

# Define the base URL for the downloads
base_url = "https://lfs.aminer.cn/misc/moocdata/data/mooccube2"

# Define the directories and files to create and download
file_list = [
    "entities/reply.json",
    "entities/video.json",
    "entities/comment.json",
    "entities/course.json",
    "entities/other.json",
    "entities/paper.json",
    "entities/problem.json",
    "entities/school.json",
    "entities/teacher.json",
    "entities/user.json",
    "entities/concept.json",
    "relations/course-school.txt",
    "relations/course-teacher.txt",
    "relations/user-comment.txt",
    "relations/video_id-ccid.txt",
    "relations/comment-reply.txt",
    "relations/concept-other.txt",
    "relations/course-comment.txt",
    "relations/concept-video.txt",
    "relations/exercise-problem.txt",
    "relations/user-reply.txt",
    "relations/concept-comment.txt",
    "relations/concept-paper.txt",
    "relations/concept-problem.txt",
    "relations/concept-reply.json",
    "relations/course-field.json",
    "relations/reply-reply.txt",
    "relations/user-problem.json",
    "relations/user-video.json",
    "relations/user-xiaomu.json",
    "prerequisites/psy.json",
    "prerequisites/cs.json",
    "prerequisites/math.json"
]

# Create directories if they don't exist
# This is equivalent to: [[ -d entities ]] || mkdir entities
# [[ -d relations ]] || mkdir relations
required_dirs = ["entities", "relations", "prerequisites"]
for dir_name in required_dirs:
    if not os.path.exists(dir_name):
        os.makedirs(dir_name)
        print(f"Created directory: {dir_name}")

# Download each file
for filename in file_list:
    full_url = f"{base_url}/{filename}"
    print(f"Downloading {filename} ...")
    
    # Use requests to handle the download
    try:
        response = requests.get(full_url, stream=True)
        response.raise_for_status() # Raise an exception for bad status codes
        
        # Write the content to the file
        with open(filename, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"Successfully downloaded {filename}")
    
    except requests.exceptions.RequestException as e:
        print(f"Error downloading {filename}: {e}")