# MacroDash — Client

The frontend for MacroDash, built with Vite, React, TypeScript, TailwindCSS and shadcn/ui**.
The app communicates with a Django backend through a Vite dev-server proxy during development.

---

## 1) Prerequisites

- **Node.js**: use the version in `.nvmrc` (`22.19.0`)

    nvm use

- **Yarn** package manager installed

---

## 2) Install dependencies

    yarn install

---

## 3) Run the app (development)

    yarn dev

- App runs at: http://localhost:5173
- Requests to `/api/...` are transparently proxied to the Django dev server at `http://127.0.0.1:8000`.

---

## 4) Build for production

    yarn build

- Runs TypeScript build (`tsc -b`) and creates a production bundle in `dist/`.

---

## 5) Preview the production build

    yarn preview

- Serves `dist/` locally so you can sanity-check the production bundle.

---

## 6) Lint

    yarn lint

- Runs ESLint on the project.

---

## 7) How the Vite proxy works in dev mode

- When your React code calls `fetch("/api/xyz")`, the browser sends the request to the Vite dev server (`http://localhost:5173/api/xyz`).
- Vite forwards the request to `http://127.0.0.1:8000/api/xyz` and returns the response back to the browser.
- Because the browser only talks to `localhost:5173` during development, you avoid typical CORS pain.


## 8) Scripts (reference)

    {
      "scripts": {
        "dev": "vite",
        "build": "tsc -b && vite build",
        "lint": "eslint .",
        "preview": "vite preview"
      }
    }

---
