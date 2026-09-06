# AI-Based Smart Logistics and Accessibility Intelligence Platform (NER)

A working prototype for **SIH 26002: "AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)"**. 

This system connects to an existing local PostgreSQL database (`sih26002`) and provides a Node.js + Express API backend and a React (Vite) frontend with an interactive SVG topology map to display safest route recommendations, active incidents, rainfall warnings, and AI risk predictions.

---

## Workspace Structure

```
/workspace
  ├── backend/               # Express + pg API Server
  │    ├── routes/           # Routing modules (locations, roads, weather, incidents, safestRoute, etc.)
  │    ├── db.js             # PostgreSQL connection pool configuration
  │    ├── server.js         # Entry point for backend
  │    └── .env              # Environment file (password loaded here)
  ├── frontend/              # Vite + React UI Dashboard
  │    ├── src/
  │    │    ├── components/
  │    │    │    └── NetworkMap.jsx  # SVG geographic network visualizer
  │    │    ├── App.jsx      # Main layout, forms, and metric displays
  │    │    ├── index.css    # High-quality custom styles (glassmorphism)
  │    │    └── main.jsx
  │    └── package.json      # Frontend package configuration
  ├── .env.example           # Workspace reference configuration
  └── README.md              # Documentation
```

---

## 1. Prerequisites & Installation

### Step 1: Install Node.js
Ensure you have Node.js and npm installed. If you do not, you can install it on Windows using:
```bash
winget install OpenJS.NodeJS.LTS
```

### Step 2: Install Project Dependencies
Open your terminal and run the following commands to install packages:

**For Backend:**
```bash
cd backend
npm install
```

**For Frontend:**
```bash
cd ../frontend
npm install
```

---

## 2. Configuration (`.env`)

We connect to your existing PostgreSQL server. To avoid hardcoding, we utilize `dotenv`.
Make sure your password is set in `backend/.env` (already pre-configured locally with `Romil@25` based on your setup):

**File: `backend/.env`**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sih26002
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
PORT=5000
```

---

## 3. Starting the Services

### Start Backend
In a terminal, navigate to the `backend` folder and run:
```bash
cd backend
npm start
```
*The server will start on [http://localhost:5000](http://localhost:5000).*
*On launch, the backend automatically tests connectivity to the database and logs a success verification message.*

### Start Frontend
In another terminal, navigate to the `frontend` folder and run:
```bash
cd frontend
npm run dev
```
*Vite will compile and launch the React app on [http://localhost:5173](http://localhost:5173).*

---

## 4. API Endpoints

The backend provides several REST endpoints:

* **Health Status**: `GET /api/health` (checks Express server status & db connection)
* **Locations**: `GET /api/locations` (fetch all 10 cities and coordinates)
* **Roads**: `GET /api/roads` (fetch available routes)
* **Weather**: `GET /api/weather` (fetch active temperatures and rainfall readings)
* **Incidents**: `GET /api/incidents` (fetch reported landslides, roadblocks)
* **Alerts**: `GET /api/alerts` (fetch active warnings)
* **Safest Route Assessment**: `POST /api/safest-route`
  * *Request Body*: `{"originId": 1, "destinationId": 2, "shipmentId": 1}`
  * *Returns*: The recommended path of road links and coordinates, total distance, ETA, weather warning levels, active roadblock hazards, and district alerts.

---

## 5. Safest Route Assessment Logic

The platform calculates the safest path through the following process:
1. **Pathfinding**: Using the `roads` topology, the algorithm conducts a search from `originId` to `destinationId` to locate all connecting road links.
2. **Hazard Auditing**: For each candidate route, the backend fetches:
   * **Incidents**: Active roadblocks, landslides, or flooding along the road segments.
   * **Weather**: Rainfall amounts and active weather warnings (Red/Orange/Yellow warnings) at the coordinates.
   * **AI Forecasts**: Machine learning warnings for segments (e.g. landslide probability forecasts).
3. **Risk Calculations**: An aggregate hazard score out of 100 is computed:
   * **Base Risk**: 10
   * **Rainfall & Alerts**: +10 to +35 based on severity (Red/Orange warning, rainfall >150mm).
   * **Active Blockages**: +40 for Critical, +25 for High incidents.
   * **AI predictions**: Segment landslide forecast probability.
4. **Recommendation**: The route with the lowest computed risk score is recommended as the "Safest Route".
