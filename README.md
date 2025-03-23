# GenAI-Genesis-2025

# Local Device Setup
## Prerequisites

Ensure you have Python installed on your system. You can check by running:

```bash
python3 --version
```

If Python is not installed, download and install it from [python.org](https://www.python.org/downloads/).



## Setup Instructions
### 1. Enable Developer Mode in Chrome

- Open Chrome and go to `chrome://extensions/`
- Enable **Developer mode** (toggle in the top-right corner)

### 2. Install Dependencies

Open a terminal in the project directory and run:

```bash
pip install flask flask-cors requests pytube youtube-transcript-api transformers torch
```

### 3. Run the Local Flask Server

Start the Flask backend by running:

```bash
python3 flask/server.py
```

### 4. Load the Extension in Chrome

- Go back to `chrome://extensions/`
- Click **Load Unpacked** in the top-left corner
- Select the project directory

### 5. Test the Extension

- Open **YouTube** in your browser
- The extension should now be enabled and functional!

## Troubleshooting

- If you encounter module errors, try running:
  ```bash
  pip install --upgrade pip
  ```
- Ensure your Flask server is running before testing the extension.



