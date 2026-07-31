# Next Class (web app)

A phone-friendly schedule assistant: shows your next class, counts down to it,
warns you when to leave, and flags overlapping classes. Works as an installable
app on iPhone and Android — no App Store needed.

## Try it locally first (on your laptop, just to check it works)
Open `index.html` directly in a browser, or run:
```
cd next-class-webapp
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

## Put it online so your phone (and friends' phones) can reach it
You need it hosted at a real URL — phones can't "load unpacked" like Chrome
extensions can. Easiest free options:

**GitHub Pages (recommended, free, simple)**
1. Create a free GitHub account if you don't have one.
2. Create a new repo, upload all files in this folder (keep the folder structure).
3. Go to Settings → Pages → set source to the `main` branch.
4. GitHub gives you a URL like `https://yourname.github.io/next-class/`.

**Netlify Drop (even faster, no account needed for a quick test)**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder in.
3. You get an instant live URL to share.

## Installing it on your phone

**iPhone (Safari):**
1. Open your hosted URL in Safari.
2. Tap the Share icon → "Add to Home Screen."
3. It now opens full-screen like a real app.

**Android (Chrome):**
1. Open your hosted URL in Chrome.
2. Tap the ⋮ menu → "Add to Home screen" (or you'll see an automatic install prompt).

## Before sharing the link with friends
- Open `app.js` and replace `COFFEE_URL` with your real Buy Me a Coffee link.
- Each person's schedule is stored only on their own phone (nothing synced
  between friends, no backend, no accounts) — private by default.

## Notes on notifications
Leave-by alerts use the browser's Notification API and only fire while the
app is open in a tab (this is a browser limitation, not something fixable
without a paid push-notification backend). For most people checking the app
in the morning, this is enough — but it's the one thing a native app would
do better.

## Ideas for v2
- True push notifications (needs a small backend, e.g. Firebase — can build
  this next if the free version gets traction)
- Shared "free time" view across a friend group
- Walking-time estimates between buildings
