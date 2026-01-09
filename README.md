# Ebook Hub 📚

A complete eBook platform featuring a **.NET 8 Web API** backend, **Angular 19+** frontend, and **SQL Server** database.

---

## 🔑 Admin Credentials
- **Username:** `Muthukumar`
- **Password:** `Admin@kumar`
- **User Login:** Use Google Sign-In (Firebase)

---

## 🚀 Quick Start Guide (Windows/Local)

### 🛠️ Configuration
1. **Firebase Setup**: 
   - Get your Firebase Config from the Console.
   - Update `ebook-hub-ui/src/environments/environment.ts`.
2. **Service Account Key**:
   - Download `serviceAccountKey.json` from Firebase.
   - Place it in the `EbookHub.API/` directory.

### 🏃 Running with Docker
```bash
docker-compose up --build
```
- **UI:** [http://localhost:4200](http://localhost:4200)
- **API:** [http://localhost:5000/api](http://localhost:5000/api)

---

## ⬆️ Step 1: Push to GitHub (Windows PowerShell)

1. Open PowerShell in the project root.
2. Create a new repo on GitHub.
3. Run these commands:
   ```powershell
   git init
   git add .
   git commit -m "Complete Ebook Hub with fixed Auth and UI"
   git branch -M main
   git remote add origin https://github.com/muthukumar0406/EbookHub.git  # Replace with your repo URL
   git push -u origin main
   ```

---

## 🌍 Step 2: Deploy to Ubuntu Server

1. **Connect to your server**:
   ```bash
   ssh root@160.187.68.165
   ```
2. **Install Docker** (if not already installed):
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   ```
3. **Clone the Repo**:
   ```bash
   git clone https://github.com/muthukumar0406/EbookHub.git
   cd EbookHub
   ```
4. **IMPORTANT: Upload Firebase Key**:
   Since `serviceAccountKey.json` is ignored by git, you must upload it to the server manually:
   ```bash
   # (Run this FROM YOUR LOCAL WINDOWS MACHINE)
   scp ./EbookHub.API/serviceAccountKey.json root@160.187.68.165:/root/EbookHub/EbookHub.API/
   ```
5. **Run the Project**:
   ```bash
   docker-compose up -d --build
   ```
6. **Access your site**:
   - Open browser: `http://160.187.68.165`

---

## 📂 Project Structure
- `EbookHub.API`: Backend API (.NET 8)
- `ebook-hub-ui`: Frontend UI (Angular 19+ with Nginx proxy)
- `docker-compose.yml`: Full stack orchestration (API + UI + SQL Server)

---

## ✅ Features Fixed
- [x] Admin Login with specific credentials.
- [x] Google Login with Firebase verified by backend.
- [x] JWT Token compatibility for both Admin and User roles.
- [x] Modernized Premium UI with Glassmorphism and Inter Font.
- [x] Author field added to Books across Database and UI.
- [x] Docker Nginx Proxy (UI on 80, API on 5000).
