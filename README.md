
My Custom Homepage (simple) - New Tab Extension
================================================

How to run (development):
1. Install dependencies:
   npm install
2. Start dev server:
   npm run dev
3. Open the shown URL (e.g. http://localhost:5173) to view locally.

How to build and load as Chrome new-tab extension:
1. Build the project:
   npm run build
2. The build output will be in the `dist/` folder. Vite copies files from `public/` to `dist/`.
3. Open Chrome -> chrome://extensions -> Load unpacked -> select the `dist/` folder.
4. Open a new tab to see the custom homepage.

Editing:
- Edit `src/data/members.js` to change the button links and icons.
- Add/remove background images in `src/assets/backgrounds/` then rebuild to include them.
- Replace icons in `src/assets/icons/` with your own images.
