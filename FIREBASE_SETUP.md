# Firebase Free Tier Setup Guide for OBHIJAAN

This project supports **Firebase Free (Spark Plan)** with 100% free limits for Auth, Cloud Firestore, and Storage.

---

### Step 1: Create a Free Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** (or **"Create a project"**).
3. Enter a project name (e.g., `obhijaan-dashboard`).
4. Google Analytics is optional (you can disable it for a faster setup).
5. Click **"Create project"**.

---

### Step 2: Register a Web App & Get Keys
1. On the project overview page, click the **Web icon `</>`** to add a web application.
2. Enter an app nickname (e.g. `obhijaan-web`).
3. Leave "Firebase Hosting" unchecked for now.
4. Click **"Register app"**.
5. Copy the configuration values inside `const firebaseConfig = { ... }`.

---

### Step 3: Enable Free Services in Firebase Console

#### 1. Authentication
- In the left sidebar, go to **Build** → **Authentication** → click **"Get started"**.
- Under the **"Sign-in method"** tab:
  - Click **Email/Password** → toggle **Enable** → click **Save**.
  - *(Optional)* Click **Google** → toggle **Enable**, select your support email → click **Save**.

#### 2. Cloud Firestore Database
- In the left sidebar, go to **Build** → **Firestore Database** → click **"Create database"**.
- Choose your nearest cloud location (e.g. `asia-southeast1` or `us-central1`).
- Select **Start in production mode** (or **Start in test mode** for 30 days of testing).
- Click **Next** → **Create**.
- *(Recommended Rule)* In the **Rules** tab, ensure authenticated users can read/write their own records:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### 3. Firebase Storage (for certificates, pitch decks, PDFs)
- In the left sidebar, go to **Build** → **Storage** → click **"Get started"**.
- Keep default security rules and choose your storage bucket location.
- Click **Done**.

---

### Step 4: Add Keys to OBHIJAAN

Create a `.env.local` file in `X:\ovijhann` (or edit existing `.env.example`):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

### Step 5: Verify Connection
1. Open the OBHIJAAN dashboard at [http://localhost:3000/settings](http://localhost:3000/settings).
2. The Firebase status badge will show **"Connected"** (in green).
3. If keys are omitted or missing, OBHIJAAN automatically runs in **Local-First / Offline mode** without error!
