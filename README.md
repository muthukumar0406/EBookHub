# Ebook Hub

A complete eBook platform with a .NET Web API backend and an Angular frontend.

## 🚀 Quick Start Guide

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Express or LocalDB)
- [Firebase account](https://console.firebase.google.com/)

---

### 🛠️ Configuration

1. **Firebase**: 
   - Get your Firebase Config object from the Firebase Console.
   - Update `ebook-hub-ui/src/environments/environment.ts`.
   - Download your **Service Account Key JSON** from Project Settings > Service Accounts.
   - Place the file as `serviceAccountKey.json` in the **root** of this project. (It is already ignored by git to keep it secure).

2. **Database**:
   - The API uses SQL Server. Update the connection string in `EbookHub.API/appsettings.json` if needed.
   - The database will be created automatically on the first run.

---

### 🏃 How to Run

#### Option 1: Docker (Easiest)
1. Ensure Docker Desktop is running.
2. Run in the root folder:
   ```bash
   docker-compose up --build
   ```
3. Access:
   - UI: [http://localhost:4200](http://localhost:4200)
   - API Swagger: [http://localhost:5000/swagger](http://localhost:5000/swagger)

#### Option 2: Local Development
1. **Backend**:
   ```bash
   cd EbookHub.API
   dotnet run
   ```
2. **Frontend**:
   ```bash
   cd ebook-hub-ui
   npm install
   npm start
   ```

---

### ⬆️ How to Push to GitHub

1. **Create a Repository** on GitHub (do not initialize with README/License).
2. **Initialize Git locally** (if not already done):
   ```bash
   git init
   ```
3. **Add all files**:
   ```bash
   git add .
   ```
4. **Commit**:
   ```bash
   git commit -m "Initial commit: Ebook Hub complete project"
   ```
5. **Link and Push**:
   ```bash
   # Replace with your actual repo URL
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

> [!CAUTION]
> **Check your .gitignore**: Ensure `serviceAccountKey.json` and `node_modules` are ignored before pushing! I have already pre-configured the `.gitignore` for you.

---

## 📂 Project Structure
- `EbookHub.API`: .NET 8 Web API
- `ebook-hub-ui`: Angular 19+ (Standalone setup)
- `docker-compose.yml`: Full stack orchestration
