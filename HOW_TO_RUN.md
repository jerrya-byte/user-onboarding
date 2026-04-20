# How to run and test the Onboarding Portal

You don't need any coding experience. There are three one-time setup steps,
then a single command to start the app whenever you want to use it.

---

## Step 1 — Install Node.js (one time only)

Node.js is the engine that runs the app. You only need to do this once per
computer.

1. Go to **https://nodejs.org**
2. Click the big green button labelled **"LTS"** (Long Term Support).
3. Open the file that downloads and click through the installer
   (Next → Next → Install). Accept all the defaults.
4. When it finishes, **close any terminal/command prompt windows you have
   open** — they need to be reopened to see the new install.

To check it worked: open a new Command Prompt (Windows) or Terminal (Mac)
and type:

```
node --version
```

You should see something like `v20.11.0`. If you see "command not found",
the install didn't take — try restarting your computer.

---

## Step 2 — Open a terminal in the app folder

### On Windows

1. Open **File Explorer** and navigate to the folder you selected for this
   project (the "User Onboarding Project" folder).
2. Double-click into the **`onboarding-app`** folder so you're inside it.
3. Click in the address bar at the top of File Explorer (where the folder
   path is shown) — it will turn into editable text.
4. Type `cmd` and press **Enter**.
5. A black Command Prompt window opens, already pointing at the right
   folder. The line should end with `...\onboarding-app>`.

### On Mac

1. Open **Finder** and navigate to the "User Onboarding Project" folder.
2. Right-click the **`onboarding-app`** folder.
3. Choose **"New Terminal at Folder"** (you may need to enable this once
   under System Settings → Keyboard → Keyboard Shortcuts → Services).
4. A Terminal window opens, already pointing at the right folder.

---

## Step 3 — Start the app

In the terminal window from Step 2, type this and press **Enter**:

```
npm run dev
```

After a few seconds you'll see something like:

```
  VITE v7.1.12  ready in 412 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

That **`http://localhost:5173/`** line is the address of your running app.

---

## Step 4 — Open it in your browser

Open Chrome, Edge, Firefox, or Safari and go to:

**http://localhost:5173**

You should land on the **HR Onboarding Dashboard** with four sample
candidates already in the table. One of them (Michael Torres) is shown as
**Expired** — that's intentional, so you can test the reissue flow.

---

## Step 5 — Try the full flow

A 5-minute walkthrough that exercises every screen:

1. **Submit a new request** — Click the gold **+ New Request** button (top
   right). Fill in candidate details + manager details and click
   **Generate Magic Link**.

2. **Preview the magic link** — You'll bounce back to the dashboard with a
   green banner showing an invitation code (e.g. `OB-2026-A1B2`). Click
   **"Preview candidate link →"** in that banner.

3. **Verify identity (candidate side)** — The email and invitation code
   are pre-filled for the demo. Click **Verify Identity**.

4. **Fill the onboarding form** — Personal/employment info is greyed out
   (already known). Fill in the blank fields:
   - Date of Birth (any date)
   - Personal Mobile (e.g. `0412 345 678`)
   - Emergency Contact Name (any name)
   - Emergency Contact Phone (e.g. `0498 765 432`)
   - TFN — any 9 digits, e.g. `123 456 789`
   - Bank — any text, e.g. `062-000 12345678`
   
   Then click **Continue to Review**.

5. **Confirmation** — You'll see a reference number and next steps.

6. **Back to dashboard** — In the address bar of your browser, change the
   URL to `http://localhost:5173/hr/dashboard`. The candidate you just
   submitted now shows **Complete**.

7. **Test the expired/reissue path** — In the dashboard, find **Michael
   Torres** (status: Expired) and click the red **Reissue** button on his
   row. Choose a validity period and reason, then click **Reissue Magic
   Link**. His row flips back to "Link Sent".

8. **Test form validation** — Go back to `/candidate/form` and try
   clicking submit with fields blank, or with a TFN that's only 5 digits.
   You should see red error messages appear inline.

---

## Stopping the app

Click in the terminal window and press **Ctrl + C** (or **Cmd + C** on
Mac). Confirm with **Y** if prompted.

To start it again later, you only need Steps 2, 3, and 4 — Node.js stays
installed, and `npm install` doesn't need to be re-run.

---

## Resetting the demo data

If the demo data gets messy and you want a clean slate:

1. In the browser, open Developer Tools (press **F12** on Windows, or
   **Cmd+Option+I** on Mac).
2. Click the **Application** tab (Chrome/Edge) or **Storage** tab
   (Firefox).
3. On the left, expand **Local Storage** → click `http://localhost:5173`.
4. Right-click any of the keys starting with `onboarding.` and delete
   them (or click the "Clear all" icon).
5. Refresh the page. The four sample candidates will be re-seeded.

---

## If something goes wrong

- **`npm: command not found`** — Node.js isn't installed (or your terminal
  was opened before installing). Go back to Step 1.
- **`Cannot find module ...`** — In the terminal, run `npm install` once,
  then `npm run dev` again.
- **The browser shows "This site can't be reached"** — Check the terminal
  is still showing the "ready in ... ms" message. If it crashed, run
  `npm run dev` again.
- **A red error overlay appears in the browser** — Take a screenshot or
  copy the text and send it to me, I'll fix it.
