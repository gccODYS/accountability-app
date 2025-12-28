# AI Journal App

An AI-powered journaling app built with React Native (Expo) and Python (FastAPI).

## Project Structure

```
accountability_app/
├── journal-app/          # React Native mobile app (Expo)
│   └── App.js           # Main intro screen
├── backend/             # Python FastAPI backend
│   ├── main.py         # API endpoints
│   └── requirements.txt # Python dependencies
```

## Running the App

### 1. Start the Python Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000

### 2. Start the React Native App

In a new terminal:

```bash
# Navigate to the app directory
cd journal-app

# Start the Expo development server
npx expo start
```

### 3. View the App

After running `npx expo start`, you'll see a QR code. You have three options:

**Option A: On Your Phone (Easiest)**
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code with your phone's camera
3. The app will open in Expo Go

**Option B: iOS Simulator**
- Press `i` in the terminal to open iOS simulator (requires Xcode on Mac)

**Option C: Android Emulator**
- Press `a` in the terminal to open Android emulator (requires Android Studio)

**Option D: Web Browser**
- Press `w` in the terminal to open in web browser

## Next Steps

The app currently has:
- ✅ Intro screen with "Get Started" button
- ✅ Python backend with basic API endpoints

Ready to add:
- Journal entry screen
- AI integration
- Data persistence
