# Storage & Uptime Monitoring Dashboard

A premium, private, and zero-maintenance storage capacity and uptime monitoring dashboard. 

It is designed to run completely for free on **Cloudflare Pages (Free Tier)**. It uses serverless **Cloudflare Pages Functions** and **Cloudflare KV** to securely collect and store metrics broadcast by your servers (Linux, PiOS, UGOS, OMV, macOS, and Windows) using lightweight, native cron/Task Scheduler background pings.

---

## Technical Stack
* **Frontend:** Vanilla HTML/JS with **Vite** and **Tailwind CSS v4** (Zero-framework setup for absolute long-term stability and compatibility).
* **Backend:** Serverless Pages Functions (Cloudflare Workers).
* **Database:** Cloudflare KV (Key-Value) store.
* **Clients:** Native Bash script (`push.sh`) and PowerShell script (`push.ps1`).

---

## 1. Local Development Setup

To run and test the dashboard interface locally:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Local Dev Server:**
   ```bash
   npm run dev
   ```
   This will boot Vite and give you a local URL (e.g., `http://localhost:5173`) to view the dashboard interface in your browser.

3. **Production Compilation Build Check:**
   ```bash
   npm run build
   ```
   This bundles and compiles the dashboard assets into a static production folder (`/dist`).

---

## 2. Setting Up Cloudflare (Free Tier Hosting)

Once your code is pushed to GitHub, you will set up Cloudflare Pages:

1. **Create Pages Project:**
   * Go to the **Cloudflare Dashboard > Compute > Workers & Pages > Create** (or **Create application**).
   * Select the **Pages** tab and click **Connect to Git**.
   * Select your GitHub repository and link it.
   * Choose **Vite** as the framework preset (Build command: `npm run build`, Output directory: `dist`).

2. **Automatic Database Binding (Done!):**
   * We have created a `wrangler.toml` file in the root of your project directory with your exact database ID (`7fa42ae0bfaf47938990ad8194e5c61c`).
   * **You can skip all manual database bindings in the Cloudflare settings dashboard entirely!** Cloudflare Pages automatically detects the `wrangler.toml` file during the build process and connects your `DASHBOARD_KV` database instantly.

3. **Configure the Authentication Token Environment Variable (Done!):**
   * We have added the `API_SECRET_TOKEN` environment variable directly inside the `[vars]` block of your `wrangler.toml` file!
   * **You can skip manual environment variables in the Cloudflare settings dashboard entirely!** Cloudflare Pages automatically injects the token into your serverless functions on deploy.

---

## 3. Configuring and Scheduling Client Push Scripts

Each machine needs to be set up to ping your dashboard. Edit the variables at the top of the scripts first:
* Set `API_URL` to `https://<your-cloudflare-pages-domain>/api/push-metrics`
* Set `API_SECRET_TOKEN` to match your Cloudflare environment variable token.

### A. For Linux, OMV, PiOS, UGOS, and macOS (`push.sh`)
The script automatically detects OMV, UGOS, PiOS, or macOS. To configure specific machine types manually, edit `MACHINE_TYPE` at the top of `push.sh` (e.g. `MACHINE_TYPE="OMV"` or `MACHINE_TYPE="UGOS (DH2300)"`).

1. Make the script executable:
   ```bash
   chmod +x /path/to/scripts/push.sh
   ```
2. Schedule a cron job to run it every 10 minutes:
   ```bash
   crontab -e
   ```
   Add this line to the bottom:
   ```cron
   */10 * * * * /absolute/path/to/scripts/push.sh > /dev/null 2>&1
   ```

### B. For Windows (`push.ps1`)
The PowerShell script automatically gathers all local fixed drives (like `C:`, `D:`, etc.).

1. **Test the script manually** (Open PowerShell as administrator and run):
   ```powershell
   PowerShell.exe -ExecutionPolicy Bypass -File "C:\path\to\scripts\push.ps1"
   ```
2. **Schedule with Windows Task Scheduler:**
   * Open **Task Scheduler** and click **Create Basic Task**.
   * **Name:** `Dashboard Metrics Ping`
   * **Trigger:** Select **Daily** (we will configure frequency in the next step).
   * **Action:** Select **Start a Program**.
   * **Program/script:** `powershell.exe`
   * **Add arguments:** `-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "C:\path\to\scripts\push.ps1"`
   * **Configure frequency:** After creating, double-click the task, go to the **Triggers** tab, click **Edit**, check the box **Repeat task every:** and set it to `10 minutes` for a duration of `Indefinitely`.

---

## 4. Beginner's Git & GitHub Setup Guide

Since this is your first time using Git, here is your step-by-step roadmap to save your work, upload it to GitHub, and trigger your very first auto-deploy:

### Step 1: Tell Git who you are
Run these commands in your Mac terminal (replace with your name and GitHub email) so Git can sign your saves correctly:
```bash
git config --global user.name "Gary"
git config --global user.email "your-github-email@example.com"
```

### Step 2: Add your files to the staging area
This tells Git that you want to include all the files we created in your next "save state". The `.` means "everything in this directory":
```bash
git add .
```

### Step 3: Create your first commit (save state)
A commit is like saving your game. The `-m` is the description message of what you saved:
```bash
git commit -m "Initial commit: Set up Vite project, push clients, and API functions"
```

### Step 4: Rename the default branch to 'main'
This ensures the primary branch matches the standard name Cloudflare looks for:
```bash
git branch -M main
```

### Step 5: Connect local Git to your GitHub account
1. Go to [github.com](https://github.com/) and log in.
2. Click the green **New** button to create a new repository.
3. **Repository Name:** Enter `dashboard` (or any name you like).
4. **Visibility:** You can choose **Private** (recommended since it has your push script token inside).
5. **DO NOT** check any boxes for README, .gitignore, or license (keep it completely empty).
6. Click **Create repository**.
7. Copy the link under **"...or push an existing repository from the command line"**. It will look like this:
   ```bash
   git remote add origin https://github.com/your-username/dashboard.git
   ```
8. Paste and run that copied command in your Mac terminal.

### Step 6: Upload your code to GitHub!
This pushes your local saved code up to GitHub's servers:
```bash
git push -u origin main
```

> [!TIP]
> **Subsequent Saves in the future:**
> Whenever you make changes in the future, updating the site is as simple as running these three commands in your terminal, which will upload the code and **automatically trigger a new build on Cloudflare**:
> ```bash
> git add .
> git commit -m "Description of what I changed"
> git push
> ```
