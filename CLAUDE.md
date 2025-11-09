# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MacroDash is a real-time economic dashboard application for tracking macroeconomic indicators, stock market data, and financial news. Built as a full-stack application with a React frontend and Django REST API backend.

**Project Structure:**
- `client/` - Production React frontend (Vite + React + TypeScript + TailwindCSS + shadcn/ui)
- `server/` - Django REST API backend with mock data endpoints
- `UI/` - Figma prototype/reference implementation (standalone React components)
- `data_import.ipynb` - Jupyter notebook for data processing/import scripts

## Development Commands

### Client (React Frontend)

Located in `client/` directory:

```bash
# Prerequisites: Use Node.js version specified in .nvmrc (22.19.0)
nvm use

# Install dependencies
yarn install

# Run development server (http://localhost:5173)
# API requests to /api/* are proxied to Django backend at http://127.0.0.1:8000
yarn dev

# Type-check and build for production
yarn build

# Preview production build
yarn preview

# Lint code
yarn lint
```

### Server (Django Backend)

Located in `server/` directory:

```bash
# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start development server (http://127.0.0.1:8000)
python manage.py runserver

# Test API endpoints (requires server to be running)
python test_endpoints.py
```

### UI Reference Implementation

Located in `UI/` directory (Figma prototype):

```bash
npm install
npm run dev
```

## Architecture

### Frontend Architecture (client/)

**Tech Stack:**
- Vite 7.x for build tooling and dev server
- React 19.x with TypeScript 5.8
- TailwindCSS 4.x for styling
- shadcn/ui for UI components (Radix UI primitives)
- TanStack Query for API state management
- Dark theme by default with theme provider

**Key Files:**
- `src/App.tsx` - Main application component with sidebar navigation and routing
- `src/components/app-sidebar.tsx` - Main navigation sidebar
- `src/components/app-header.tsx` - Top application header
- `src/components/dashboard-home.tsx` - Main dashboard view
- `src/components/ui/` - shadcn/ui component library
- `vite.config.ts` - Vite configuration with API proxy to Django backend

**Dev Server Proxy:**
During development, Vite proxies all `/api/*` requests from `http://localhost:5173` to the Django backend at `http://127.0.0.1:8000`. This avoids CORS issues during local development.

### Backend Architecture (server/)

**Tech Stack:**
- Django 4.2.7
- Django REST Framework 3.14.0
- django-cors-headers for CORS handling
- SQLite database (development)

**Project Structure:**
- `macrodash/` - Django project configuration
  - `settings.py` - Project settings with CORS and REST framework config
  - `urls.py` - Root URL configuration
- `api/` - Main API application
  - `views.py` - API endpoint implementations (all return mock JSON data)
  - `urls.py` - API URL routing
- `manage.py` - Django management script
- `test_endpoints.py` - Simple test script to verify all API endpoints

**API Endpoints:**

All endpoints currently return mock JSON data for prototyping:

- `GET /api/economic-data/` - Economic indicators (GDP, unemployment, inflation, etc.)
- `GET /api/stocks/` - Top stocks and market summary (S&P 500, Dow Jones, NASDAQ)
- `GET /api/stocks/{symbol}/` - Individual stock details with 30-day historical data
- `GET /api/news/{symbol}/` - Financial news articles for a specific stock
- `GET /api/dashboard/` - User dashboard configuration
- `POST /api/dashboard/` - Update dashboard configuration
- `GET /api/sentiment/{symbol}/` - LLM-powered sentiment analysis for a stock

**CORS Configuration:**
- `CORS_ALLOW_ALL_ORIGINS = True` in development
- Configured for `localhost:5137` and `127.0.0.1:5137`

### UI Reference Implementation (UI/)

This is a separate Figma-exported prototype that serves as a visual reference. It contains standalone React components showing the desired UI/UX:

**Key Components:**
- `DashboardHome.tsx` - Main dashboard layout
- `IndividualStockView.tsx` - Detailed stock view
- `CataloguePage.tsx` - Data catalog browser
- `SearchPage.tsx` - Search interface
- `ManageDisplaysPage.tsx` - Display management
- `SettingsPage.tsx` - User settings
- `SignInPage.tsx` - Authentication UI
- `MacroSidebar.tsx` - Reference sidebar implementation
- `components/ui/` - Full shadcn/ui component library

This UI folder represents the original Figma design and can be used as a reference when implementing features in the `client/` directory.

## Development Workflow

1. **Start Backend:** Run Django server first (`python manage.py runserver` in `server/`)
2. **Start Frontend:** Run Vite dev server (`yarn dev` in `client/`)
3. **Access Application:** Navigate to `http://localhost:5173`
4. **API Testing:** Use `test_endpoints.py` to verify backend endpoints

## Important Notes

- The backend currently uses **mock data only** - no real API integrations yet
- Database migrations should be run after any model changes
- The Vite proxy handles API routing during development, eliminating CORS issues
- The `UI/` folder is a reference implementation from Figma, not the production codebase
- Production frontend code lives in `client/`, which is actively developed
- Node version is pinned to 22.19.0 (see `client/.nvmrc`)
- Use `yarn` (not npm) for client dependencies

## Future Integration Points

Based on the API structure, the application is designed to integrate with:
- FRED API for economic data
- Yahoo Finance API for stock market data
- Financial news APIs (NewsAPI, Alpha Vantage, etc.)
- LLM APIs for sentiment analysis (OpenAI, Anthropic, etc.)
