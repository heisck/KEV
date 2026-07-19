#!/usr/bin/env python3
"""
Deploy KEV ML face verification service (buffalo_sc) directly to a Hugging Face Space (Docker SDK).

Usage:
  export HF_TOKEN="your_token_here"
  python3 scripts/deploy-ml-hf.py
"""
import os
import sys
from pathlib import Path

try:
    from huggingface_hub import HfApi, create_repo, upload_folder
except ImportError:
    print("[deploy-ml-hf] huggingface_hub not installed. Installing via pip...")
    os.system(f"{sys.executable} -m pip install --upgrade huggingface_hub")
    from huggingface_hub import HfApi, create_repo, upload_folder

def main():
    token = os.environ.get("HF_TOKEN") or (sys.argv[1] if len(sys.argv) > 1 else None)
    if not token or not token.startswith("hf_"):
        print("[deploy-ml-hf] Error: Valid HF_TOKEN not found. Please set HF_TOKEN env var.")
        sys.exit(1)

    api = HfApi(token=token)
    try:
        who = api.whoami()
        username = who.get("name") or who.get("fullname", "user")
        print(f"[deploy-ml-hf] Authenticated as Hugging Face user: {username}")
    except Exception as e:
        print(f"[deploy-ml-hf] Failed to authenticate with HF_TOKEN: {e}")
        sys.exit(1)

    repo_id = f"{username}/kev-ml"
    print(f"[deploy-ml-hf] Creating or verifying Docker Space: {repo_id}...")
    try:
        create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            exist_ok=True,
            token=token,
            private=False
        )
        print(f"[deploy-ml-hf] Space {repo_id} is ready.")
    except Exception as e:
        print(f"[deploy-ml-hf] Warning/Error creating repo: {e}")

    root_dir = Path(__file__).resolve().parent.parent
    ml_dir = root_dir / "ml"
    if not ml_dir.exists():
        print(f"[deploy-ml-hf] Error: ml directory not found at {ml_dir}")
        sys.exit(1)

    print(f"[deploy-ml-hf] Uploading {ml_dir} directory to Space {repo_id}...")
    try:
        url = upload_folder(
            folder_path=str(ml_dir),
            repo_id=repo_id,
            repo_type="space",
            token=token,
            commit_message="feat: update KEV ML face verification service (buffalo_sc with zero-latency pre-caching)",
            ignore_patterns=["__pycache__", "*.pyc", ".venv", "*.log", ".env*"]
        )
        print("\n" + "=" * 60)
        print(f"SUCCESS: Uploaded ML service to Hugging Face Space: {repo_id}")
        print(f"Space URL: https://huggingface.co/spaces/{repo_id}")
        print(f"Live API Base URL: https://{username}-kev-ml.hf.space")
        print("=" * 60)
    except Exception as e:
        print(f"[deploy-ml-hf] Failed to upload folder to Space: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
