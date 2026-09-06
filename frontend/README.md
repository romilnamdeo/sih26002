# RASTA-NER — AI-Based Smart Logistics & Accessibility Intelligence Frontend

**RASTA-NER: Regional AI-Based Smart Logistics and Accessibility Intelligence Platform for the North Eastern Region of India**

RASTA-NER is an AI-based logistics and accessibility intelligence platform designed to support safer and more efficient freight movement across the North Eastern Region of India. It evaluates topological road networks, active weather conditions, terrain and landslide vulnerabilities, and AI risk forecasts to determine passability index scores and safe route recommendations across all 8 North Eastern states (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura).

## Stack Details
- **Core:** React (Vite)
- **Routing:** `react-router-dom` (using `<HashRouter>` for persistent client-side routing)
- **Mapping:** `react-leaflet` + `Leaflet.js` with dark OpenStreetMap tiles
- **Charts:** `Recharts` for risk driver histograms and segment comparative bar charts
- **API Client:** `Axios`
- **Styling:** Tailwind CSS v3
- **Multilingual Support:** 10 Northeast languages supported (English, Hindi, Assamese, Nyishi, Manipuri, Khasi, Mizo, Nagamese, Nepali, Bengali)

---

## Page Hierarchy & Structure
The frontend provides a top navigation layout connecting 5 specialized views:

1. **Dashboard Overview (route `/`)**
   - Renders aggregate regional metrics, active safety alerts, regional filter bar, and an overall **Regional Accessibility Score** gauge (computed as `100 - average risk index`).
   - Displays a monitored route segment checklist where selecting any segment redirects to the map centered on that segment.

2. **Regional Route Planner (route `/plan`)**
   - Configures regional terminal endpoints for risk-informed routing.
   - Includes dropdowns for **Vehicle Class** (Light LCVs vs. Heavy Trucks) and a **Safety vs. Speed slider** (0 = speed priority, 1 = max safety).
   - Generates route metrics cards (Total Length, Estimated ETA, Dynamic Freight Cost) and warns of vehicle class slope gradient exclusions with an alert banner.

3. **Live Accessibility & Risk Map (route `/map`)**
   - Full-screen Leaflet mapping with regional GIS layers.
   - Highlights planned routes and marks steep gradient exclusions with dashed line vectors.
   - Popups on segment click show name, risk indices, and open a Recharts sub-score chart representing erosion and grade factors.
   - Features a client-side **Monsoon Mode** toggle (intensifying seasonal risk sensitivity) and a **Hazard Simulation** trigger button.

4. **Risk Intelligence Audit (route `/route-details`)**
   - Compiles prominent metric indicators (ETA, cost, cumulative risk index, overall safety level) from the latest calculated route.
   - Shows a table breakdown of segments and an interactive Recharts bar chart comparing hazard indices along the planned route.

5. **What-If Simulation Sandbox (route `/simulate`)**
   - Interactive testing sandbox where users can inject hazard profiles (landslide, flood, roadblock) of varying severities (mild, moderate, severe) onto target route segments.
   - Recalculates route flow and provides a before/after risk score card, a regional topology preview, and maintains an experimentation history log.

---

## Simulation & Demo Controls System
A gear-icon button is available on the top navigation bar of every page, enabling live toggle control of four configuration variables:
- **Enable Live Polling:** Query backend APIs every 5 seconds for network updates.
- **Enable GPS Simulation:** Animated vehicle telemetry markers traveling along active regional routes.
- **Multilingual System:** Regional language selection across all 10 Northeast state languages.
- **Offline Sync Demo:** Dismissible status banner demonstrating offline sync capabilities.

---

## Local Development & Setup

### Prerequisites
Make sure you have Node.js installed on your machine.

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the Vite development web server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your web browser.
