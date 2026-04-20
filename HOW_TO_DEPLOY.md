# Deploy to GitHub + Vercel

This guide takes the app from "running on my computer" to "live on the
internet at a shareable URL". Total time: **about 20 minutes**.

The plan:

1. Install Git (the tool that uploads your code to GitHub).
2. Create a **private** GitHub repository.
3. Push your code to it.
4. Connect Vercel to GitHub — it will auto-deploy your app.
5. Share the URL.

Every time you (or I) make a change later, you'll just run **two commands** and
Vercel will re-deploy automatically.

---

## Step 1 — Install Git for Windows (one time only)

1. Go to **https://git-scm.com/download/win**.
2. The download should start automatically — a file like
   `Git-2.44.0-64-bit.exe` will land in your Downloads folder.
3. Open the installer. For every screen, **just click Next** — the defaults
   are correct. The installer is long (about 12 screens) but it's all
   "Next, Next, Next, Install".
4. When it finishes, **close any Command Prompt windows** you have open —
   they need to be reopened to see the new install.

**Check it worked:**

- Open a new Command Prompt (Start menu → type "cmd" → Enter).
- Type: `git --version`
- You should see something like: `git version 2.44.0.windows.1`

If you get "git is not recognized", restart your computer and try again.

---

## Step 2 — Tell Git who you are (one time only)

Git stamps every upload with your name and email. Set it once.

In Command Prompt, type these two lines (replace with **your** GitHub
username and the email on your GitHub account):

```
git config --global user.name "Jerry Natarajan"
git config --global user.email "aravinthan.natarajan@gmail.com"
```

Nothing is printed — that's expected.

---

## Step 3 — Create a new private GitHub repository

1. Open **https://github.com/new** in your browser (log in if needed).
2. Fill in:
   - **Repository name:** `onboarding-portal` (or any name you like — keep it lowercase, no spaces)
   - **Description:** `DHS Identity Onboarding Portal — prototype` (optional)
   - **Visibility:** select **Private**
   - **Do NOT tick** "Add a README", "Add .gitignore", or "Choose a license". We already have these files locally, and adding them from GitHub will cause a conflict.
3. Click the green **Create repository** button.

You'll land on a page showing something like:

> Quick setup — if you've done this kind of thing before

Copy the **HTTPS URL** near the top of that page — it looks like:

```
https://github.com/<your-username>/onboarding-portal.git
```

Keep that tab open — you'll need the URL in the next step.

---

## Step 4 — Push your code to GitHub

Open a Command Prompt window, and navigate into the **onboarding-app**
folder (the one with `package.json` and `HOW_TO_RUN.md` inside it):

```
cd "C:\Users\aravi\OneDrive\Projects\User Onboarding Project\onboarding-app"
```

(Your path may be slightly different — use wherever your app folder actually
lives.)

Then run these commands, one at a time. After each one, wait for it to
finish before typing the next.

**4a. Turn the folder into a Git project:**

```
git init
```

Expected output: `Initialized empty Git repository in ...`

**4b. Rename the default branch to "main" (the modern standard):**

```
git branch -M main
```

No output if it worked.

**4c. Stage every file for upload:**

```
git add .
```

No output. (The `.gitignore` file tells Git to skip `node_modules` and
`dist`, so those won't be uploaded — that's correct.)

**4d. Create the first commit (a labelled snapshot):**

```
git commit -m "Initial commit — onboarding portal prototype"
```

You'll see a long list of files and a summary like
`42 files changed, 3500 insertions(+)`.

**4e. Connect your local folder to the GitHub repo** (use the URL from
Step 3):

```
git remote add origin https://github.com/<your-username>/onboarding-portal.git
```

Replace `<your-username>` with your actual GitHub username.

**4f. Upload the code:**

```
git push -u origin main
```

The first time you do this, a browser window will pop up asking you to
**sign in to GitHub**. Log in, click **Authorize Git Credential Manager**,
then close the browser window. Back in Command Prompt, you should see
something like:

```
Enumerating objects: 58, done.
...
To https://github.com/<your-username>/onboarding-portal.git
 * [new branch]      main -> main
```

**Check it worked:** Refresh the GitHub repo page in your browser — you
should now see all your source files listed there.

---

## Step 5 — Deploy to Vercel

1. Go to **https://vercel.com/signup**.
2. Click **"Continue with GitHub"** and authorize Vercel to see your repos.
3. On the Vercel dashboard, click **"Add New..."** (top right) → **"Project"**.
4. You'll see a list of your GitHub repos. Find **onboarding-portal** and
   click **Import**. (If you don't see it, click "Adjust GitHub App
   Permissions" and grant access to the repo.)
5. Vercel will show a configuration screen. **Leave everything as default** —
   it auto-detects Vite. Just check these fields look like:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `dist` (auto-filled)
6. Click the big **Deploy** button.

Vercel will now build and deploy your app. You'll see a progress log in real
time — it takes about **45–90 seconds**.

When it's done you'll see a big **"Congratulations!"** screen with a
screenshot of your app and a URL like:

```
https://onboarding-portal-abc123.vercel.app
```

Click the URL. Your app is live.

---

## Step 6 — Share the URL

Your app now has two URLs:

- **Preview URL** — changes with every deploy, e.g.
  `onboarding-portal-abc123.vercel.app`
- **Production URL** — permanent, e.g.
  `onboarding-portal.vercel.app`

Use the **Production URL** (on the Vercel dashboard → your project → Domains
tab) for sharing.

If you want a custom URL (e.g. `onboarding.yourdomain.com`), you can add it
under the Domains tab — but the free Vercel URL works fine for a demo.

---

## Updating the app later

Every time you (or I) change the code, pushing the change is now just
**two commands** from the `onboarding-app` folder:

```
git add .
git commit -m "Describe what changed"
git push
```

That's it. Vercel watches your GitHub repo — within a minute of your
push, the live site updates automatically.

---

## If something goes wrong

- **`git: command not found` after installing Git** — Restart Command Prompt,
  then restart your computer if needed.
- **`fatal: not a git repository`** — You're not inside the `onboarding-app`
  folder. Run the `cd` command from Step 4 again.
- **Push rejected / authentication failed** — Usually the GitHub login
  popup was closed too early. Run `git push` again and log in cleanly.
- **Vercel build fails** — Copy the red error text from the build log and
  send it to me, I'll fix it.
- **Site loads but navigation breaks ("page not found" on /hr/dashboard)** —
  I've added a `vercel.json` file to prevent this. If you still see it,
  tell me and I'll investigate.

---

## Privacy note

Because the repo is **private**, only you can see the code on GitHub.
Vercel needs access to deploy it, but the Vercel dashboard is also private
to you. The **deployed URL is public** by default — anyone with the link
can use the app. If you need the deployed site itself to require a
password, tell me and I'll show you how to turn on Vercel Password
Protection (a paid feature, but free-tier "preview protection" is often
enough).
