# Rocking Z Acres

Farm management platform — Marketing, Fields, Operations, Equipment.

## Stack
- **Frontend**: React + Vite (JavaScript)
- **Routing**: React Router v6
- **Database**: Supabase (coming soon)
- **Deploy**: Vercel via GitHub

## Local Development

```bash
npm install
npm run dev
```
Opens at http://localhost:5173

## Adding Your Projection Tools

**Corn:**
1. Copy `remixed-51453148.tsx` → `src/pages/marketing/corn/CornProjectionEngine.tsx`
2. Open `src/pages/marketing/corn/Projection.jsx`
3. Uncomment the import line and replace the return

**Soybeans:**
1. Copy your soybean `.jsx` → `src/pages/marketing/soybeans/SoybeanProjectionEngine.jsx`
2. Open `src/pages/marketing/soybeans/Projection.jsx`
3. Uncomment the import line and replace the return

## Deploy to Vercel
1. Push to GitHub
2. Connect repo in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Done — auto-deploys on every `git push`

## Project Structure
```
src/
├── pages/
│   └── marketing/
│       ├── corn/
│       │   ├── Projection.jsx       ← your corn tool goes here
│       │   ├── HedgeTracker.jsx
│       │   └── ElevatorPrices.jsx
│       └── soybeans/
│           ├── Projection.jsx       ← your soybean tool goes here
│           ├── HedgeTracker.jsx
│           └── ElevatorPrices.jsx
├── App.jsx                          ← nav + routing
└── index.css                        ← global styles
```
