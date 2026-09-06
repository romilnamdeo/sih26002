/**
 * RASTA-NER — English (en) Translation Locale
 * Default and fallback language
 */
export default {
  offlineTitle: "Offline Mode Active",
  offlineDesc: "Changes will sync automatically when reconnected.",
  dismiss: "Dismiss",
  refresh: "Refresh Data",
  refreshing: "Refreshing...",
  lastUpdated: "Last Updated",
  monsoonActive: "Monsoon Mode: risk sensitivity increased",

  // Navigation
  nav: {
    dashboard: "Dashboard",
    routePlanner: "Route Planner",
    interactiveMap: "Live Map",
    routeDetails: "Risk Intelligence",
    whatIfSimulation: "What-If Simulation",
    about: "About",
    demoSettings: "Simulation Controls",
    brandTitle: "RASTA-NER",
    brandSubtitle: "North Eastern Region of India",
    brandTagline: "AI-Based Smart Logistics & Accessibility Intelligence",
    systemStatus: "MONITORING ACTIVE",
    menu: "Menu",
    close: "Close"
  },

  // Common UI terms
  common: {
    refresh: "Refresh Data",
    refreshing: "Refreshing...",
    lastUpdated: "Last Updated",
    dismiss: "Dismiss",
    status: "Status",
    actions: "Actions",
    cancel: "Cancel",
    save: "Save",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    nominal: "NOMINAL",
    critical: "CRITICAL",
    high: "High",
    medium: "Medium",
    low: "Low",
    safe: "Safe",
    moderate: "Moderate",
    severe: "Severe",
    mild: "Mild",
    active: "Active",
    resolved: "Resolved",
    km: "km",
    min: "min",
    hrs: "h",
    inr: "₹",
    notAvailable: "N/A",
    yes: "Yes",
    no: "No",
    all: "All"
  },

  // Centralized Locations Dictionary
  locations: {
    guwahati: "Guwahati",
    umiam: "Umiam",
    mawphlang: "Mawphlang",
    mawkyrwat: "Mawkyrwat",
    nongstoin: "Nongstoin",
    shillong: "Shillong",
    itanagar: "Itanagar",
    jorabat: "Jorabat",
    dispur: "Dispur",
    kohima: "Kohima",
    imphal: "Imphal",
    aizawl: "Aizawl",
    agartala: "Agartala",
    gangtok: "Gangtok",
    dimapur: "Dimapur",
    silchar: "Silchar",
    tawang: "Tawang",
    tezpur: "Tezpur",
    dibrugarh: "Dibrugarh",
    jorhat: "Jorhat",
    nagaon: "Nagaon",
    passighat: "Passighat",
    ziro: "Ziro",
    churachandpur: "Churachandpur",
    lunglei: "Lunglei",
    champhai: "Champhai",
    mokokchung: "Mokokchung",
    tuensang: "Tuensang",
    namchi: "Namchi",
    gyalshing: "Gyalshing",
    udaipur: "Udaipur",
    dharmanagar: "Dharmanagar"
  },

  // Eight Northeastern States
  states: {
    all: "All States",
    allstates: "All States",
    assam: "Assam",
    arunachal: "Arunachal Pradesh",
    arunachalpradesh: "Arunachal Pradesh",
    manipur: "Manipur",
    meghalaya: "Meghalaya",
    mizoram: "Mizoram",
    nagaland: "Nagaland",
    sikkim: "Sikkim",
    tripura: "Tripura"
  },

  // Regional Filters
  filters: {
    title: "Regional Filters",
    region: "Region",
    state: "State",
    risk: "Risk",
    allNorthEast: "All North East",
    allStates: "All States",
    allRisks: "All Risks",
    low: "Low (0–30)",
    medium: "Medium (30–70)",
    high: "High (70–100)"
  },

  // Hazard Terminology
  hazards: {
    landslide: "Landslide / Slope Collapse",
    flood: "Flash Flood / Water Runoff",
    roadblock: "Debris Roadblock / Tree Fall",
    earthquake: "Earthquake / Seismic Activity",
    heavyrain: "Heavy Rainfall",
    storm: "Storm / High Winds",
    extremeweather: "Extreme Weather",
    accident: "Accident / Collision",
    debris: "Debris / Mud Accumulation",
    roaddamage: "Road Damage / Subsidence",
    trafficdisruption: "Traffic Disruption",
    terrainrisk: "Terrain Risk Warning"
  },

  // Hazard Severities
  severities: {
    mild: "Mild / Partial Shoulder Debris",
    moderate: "Moderate / Single Lane Blocked",
    severe: "Severe / Complete Route Blockage"
  },

  // Risk Levels & Scores
  riskLevels: {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
    risk: "Risk",
    riskscore: "Risk Score",
    riskScore: "Risk Score",
    riskdistribution: "Risk Distribution",
    accessibilityscore: "Accessibility Score",
    safety: "Safety",
    warning: "Warning",
    criticalalert: "Critical Alert",
    monitoring: "Monitoring",
    restricted: "Restricted",
    transitrestricted: "Transit Restricted"
  },

  // Vehicle Classes
  vehicles: {
    light: "Light Commercial Vehicle (LCV / Pickup)",
    heavy: "Heavy Multi-Axle Truck (>16 Ton)",
    lightcommercial: "Light Commercial Vehicle (LCV / Pickup)",
    heavytruck: "Heavy Multi-Axle Truck (>16 Ton)"
  },

  // Segments metadata
  segments: {
    title: "Monitored Segments",
    count: "Segments",
    distance: "Distance",
    riskScore: "Risk Score",
    gradeScore: "Grade Score",
    heavyExcluded: "Heavy Excluded",
    label: "{id}: {from} → {to}"
  },

  // Dynamic Alert Message Templates
  alertTemplates: {
    landslideSim: "CRITICAL ALERT: Simulated landslide on {segment}. Risk elevated to {risk}/100. Heavy debris on road shoulder. Transit restricted.",
    terrainWarning: "High erosion vulnerability and steep slope gradient reported on {segment}. Transit restricted for heavy vehicles.",
    runoffWarning: "Hydrological water runoff pooling observed near {location} sector. Speed advisory in effect.",
    scenarioSimulation: "Simulated {severity} {hazard} applied on {segment}. New Risk: {risk} ({level}).",
    routePassable: "Route remains safe and passable for transit.",
    rerouteRecommended: "Rerouting triggered due to elevated hazard risk."
  },

  // Route Planning Notes Templates
  routeNotes: {
    vehicleSpec: "Regional route computed for {vehicle} specifications.",
    safetyPriority: "Safety-weighted path: Speed restricted, hazard margin prioritized.",
    speedPriority: "Speed-weighted path: Minimum transit time prioritized.",
    sectorsCrossed: "Transit crosses {count} monitored regional route sectors.",
    gradeWarning: "WARNING: Selected route crosses segments flagged with steep grade restrictions."
  },

  // Dashboard Page
  dashboard: {
    bannerTitle: "North Eastern Region Logistics & Accessibility Overview",
    bannerSubtitle: "Regional intelligence for road accessibility, terrain vulnerability, weather impact, incidents, and logistics connectivity across the North Eastern Region of India.",
    accessibilityScore: "Regional Accessibility Score",
    accessibilityDesc: "Composite accessibility index across monitored routes in the North Eastern Region.",
    strategicIndicator: "Strategic Indicator",
    sampleNetwork: "Sample Monitored Network",
    prototypeData: "Prototype Data",
    corridorRisk: "Regional Risk Distribution",
    corridorRiskDesc: "Risk classification across monitored routes and segments in the North Eastern Region.",
    riskLow: "Low (0–30)",
    riskMed: "Med (30–70)",
    riskHigh: "High (70–100)",
    telemetry: "Regional Network Status",
    telemetryDesc: "Continuous telemetry across monitored arterial route networks in Northeast India.",
    totalSegments: "Monitored Segments",
    totalDistanceSub: "Sample monitored network",
    regionLabel: "Region",
    regionValue: "North East India",
    activeAlerts: "Active Alerts",
    activeAlertsSub: "Regional advisory channels",
    monitoredSegments: "Monitored Route Segments",
    monitoredSegmentsDesc: "Select a route segment to inspect accessibility, terrain, weather, risk, and incident intelligence.",
    keySectors: "Monitored Sectors",
    distance: "Distance",
    gradeScore: "Grade Score",
    heavyExcluded: "Heavy Excluded",
    recentAlerts: "Recent Regional Safety Alerts",
    prototypeAlert: "Prototype Alert",
    latestEvents: "Latest events",
    noAlerts: "All Monitored Segments Clear",
    noAlertsDesc: "No active hazard alerts recorded across the monitored regional network.",
    channel: "Channel",
    statusNominal: "System Status: NOMINAL",
    corridorPassable: "Network Passable",
    noSegmentsFound: "No monitored segments found for selected filter.",
    adjustFilterHint: "Adjust state or risk filter to view available regional segments."
  },

  // Route Planner Page
  planner: {
    bannerTitle: "Disaster-Aware Regional Route Planner",
    bannerSubtitle: "Configure vehicle specifications, regional transit nodes, and safety aversion parameters to calculate risk-adjusted freight traversal across the North Eastern Region.",
    parameters: "Route Parameters",
    corridorBadge: "Regional Corridor",
    originTerminal: "Origin Terminal",
    selectOrigin: "-- Select Origin --",
    destinationTerminal: "Destination Terminal",
    selectDestination: "-- Select Destination --",
    vehicleClass: "Vehicle Classification",
    lightVehicle: "Light Commercial Vehicle (LCV / Pickup)",
    heavyTruck: "Heavy Multi-Axle Truck (>16 Ton)",
    safetyWeight: "Safety vs. Speed Optimization",
    speedPriority: "Speed Priority",
    balancedPriority: "Balanced",
    safetyPriority: "Max Safety",
    calculateButton: "Calculate Safe Traversal Route",
    calculating: "Computing Safe Path...",
    traversalSummary: "Traversal Summary",
    summaryDesc: "Risk-adjusted regional path & accessibility metrics.",
    totalLength: "Total Length",
    estimatedEta: "Estimated ETA",
    dynamicFreightCost: "Dynamic Freight Cost",
    transitRiskLevel: "Transit Risk Level",
    accessibilityNotes: "Regional Accessibility & Hazard Advisory",
    viewFullAudit: "View Full Risk Audit & Telemetry",
    errorOriginDest: "Please select both Origin and Destination terminal nodes.",
    errorDistinct: "Origin and Destination must be distinct regional nodes.",
    errorFailed: "Route planning request failed.",
    distanceKm: "km",
    costEstimateNote: "Dynamic cost computed from distance and vehicle category.",
    segmentsExcludedWarning: "{count} segment(s) excluded — Not safe for {vehicle}"
  },

  // Interactive Map Page
  map: {
    title: "North Eastern Region — Live Accessibility & Risk Map",
    subtitle: "Interactive physical geometry, terrain vulnerability, and risk layers across the North Eastern Region.",
    riskLegend: "Risk Level Gradation",
    greenRisk: "Green — Low Risk (0–30)",
    yellowRisk: "Yellow — Medium Risk (30–70)",
    redRisk: "Red — High Risk (70–100)",
    gradeExclusion: "Grade-Excluded Path",
    gradeExclusionDesc: "Segments with steep gradeability thresholds are rendered with dashed styling.",
    gradeExcludedFor: "Dashed line — Not safe for",
    monsoonMode: "Monsoon Mode",
    monsoonSubtitle: "Precipitation risk emphasis",
    monsoonActiveNote: "Monsoon Mode: risk sensitivity increased",
    simulateLandslideBtn: "Simulate Hazard on Monitored Segment 4",
    simulateLandslideSub: "Calls POST /api/simulate-landslide/seg-4",
    currentRisk: "Current Risk",
    riskBreakdown: "Risk Breakdown",
    erosionScore: "Erosion",
    gradeabilityScore: "Gradeability",
    notSafeWarning: "Not safe for",
    terminal: "Terminal Node",
    latitude: "Latitude",
    longitude: "Longitude",
    movingVehicles: "Active Logistics Telemetry",
    activeGps: "Live GPS Telemetry",
    lengthLabel: "Length",
    updatedLabel: "Updated",
    simAlertTitle: "Regional Hazard Simulation Alert",
    suggestedAlternate: "Suggested Alternate"
  },

  // Route Details Page
  details: {
    bannerTitle: "Route Safety & Risk Intelligence Details",
    bannerSubtitle: "Detailed segment-by-segment risk index, terrain vulnerability, and physical restrictions.",
    auditHeader: "Regional Traversal Audit",
    noRouteTitle: "No Active Route Plan Selected",
    noRouteDesc: "No route has been planned yet. Please configure your origin and destination terminals in the Route Planner to compute risk traversal metrics.",
    planRouteBtn: "Plan a Route",
    adjustRouteBtn: "Adjust Route",
    livePolling: "Live Polling",
    routeSegmentsTitle: "Traversed Route Segments",
    segmentRiskIndex: "Segment Risk Index Comparison",
    transitWarnings: "Transit Warnings & Advisories",
    vehicleNotice: "Vehicle Specification Notice",
    heavyRestrictedNotice: "Heavy vehicles restricted on steep incline sectors.",
    allClearNotice: "All traversed sectors meet safety standards for configured vehicle class.",
    segmentName: "Segment",
    riskScore: "Risk Score",
    erosionVulnerability: "Erosion Vulnerability",
    gradeability: "Gradeability",
    operationalStatus: "Operational Status",
    etaLabel: "Estimated ETA",
    costLabel: "Dynamic Cost",
    riskIndexLabel: "Cumulative Risk Index",
    riskLevelLabel: "Overall Safety Level",
    monitoredSectors: "monitored sectors in sequence",
    noObstacles: "No specific obstacle notes reported for this corridor path."
  },

  // What-If Simulation Sandbox
  simulation: {
    bannerTitle: "What-If Regional Hazard Simulation Sandbox",
    bannerSubtitle: "Inject dynamic hazards (landslides, flash floods, and roadblocks) onto monitored route segments. The RASTA-NER predictive engine calculates immediate risk index spikes and evaluates whether freight rerouting is triggered.",
    parameters: "Hazard Parameters",
    inMemoryBadge: "Scenario Simulation",
    targetSegment: "Target Route Segment",
    hazardType: "Hazard Type",
    landslide: "Landslide / Slope Collapse",
    flood: "Flash Flood / Water Runoff",
    roadblock: "Debris Roadblock / Tree Fall",
    severity: "Hazard Severity",
    mild: "Mild / Partial Shoulder Debris",
    moderate: "Moderate / Single Lane Blocked",
    severe: "Severe / Complete Route Blockage",
    runSimulationBtn: "Run Scenario Analysis",
    runningSimulation: "Simulating Impact...",
    baselineAssessment: "Baseline Sector Telemetry",
    baselineRisk: "Baseline Risk",
    baselineErosion: "Erosion Index",
    baselineGrade: "Gradeability",
    baselineLength: "Length",
    impactAnalysis: "Simulation Impact & Recommendation",
    baselineVsSimulated: "Baseline vs. Simulated Risk Index",
    reroutingTriggered: "Rerouting Triggered",
    routeRemainsSafe: "Route Remains Passable",
    alternativePath: "Suggested Alternative Path",
    noAlt: "No alternate route available",
    simulationHistory: "Session Simulation Log",
    noHistory: "No simulation runs recorded yet.",
    executedAt: "Executed at",
    changeDelta: "Change",
    selectSegmentWarning: "Please select a road segment to simulate.",
    topographyComparison: "Regional Route Topology Simulation Preview"
  },

  // About Modal
  about: {
    title: "About RASTA-NER",
    subtitle: "AI-Based Smart Logistics & Accessibility Intelligence Platform for the North Eastern Region of India",
    description: "RASTA-NER is an AI-based smart logistics and accessibility intelligence platform designed to support safer and more efficient movement across the North Eastern Region of India. It assists freight operators, disaster management authorities, and logistics coordinators in navigating steep terrain, seasonal monsoons, and active landslide vulnerabilities.",
    capabilitiesTitle: "KEY CAPABILITIES",
    cap1: "Route accessibility assessment & topological telemetry",
    cap2: "Terrain and erosion vulnerability analysis",
    cap3: "Weather and seasonal monsoon impact assessment",
    cap4: "Disaster & hazard incident intelligence",
    cap5: "Dynamic risk scoring & heavy-vehicle gradeability filtering",
    cap6: "Safe freight route planning & ETA/cost estimation",
    cap7: "What-If hazard scenario simulation & rerouting triggers",
    cap8: "Regional logistics decision support across 8 North East states",
    realDataTitle: "REAL / OPEN GIS & TELEMETRY",
    realData1: "OpenStreetMap: Live satellite and road vector tiles with official cartographic attribution.",
    realData2: "Physical Geometry: Real geographic terminal coordinates and segment lengths for monitored North Eastern transit corridors.",
    realData3: "Backend AI & Routing Engine: Active routing calculation, dynamic ETA, gradeability indexing, and vehicle exclusion filters.",
    simDataTitle: "SIMULATED / SCENARIO INTELLIGENCE",
    simData1: "Hazard Injections: What-If simulations (landslides, flash floods, roadblocks) illustrate algorithmic rerouting.",
    simData2: "Monsoon Mode: Client-side sensitivity boosting demonstrates heightened risk awareness during rainy seasons.",
    simData3: "GPS Simulation: Demonstrative moving vehicle markers trace active regional routes.",
    footerNote: "RASTA-NER — Regional Intelligence Platform",
    understoodBtn: "Understood"
  },

  // Demo Settings Modal
  settings: {
    title: "Simulation & Demo Controls",
    subtitle: "Platform demonstration and simulation parameters",
    livePollingTitle: "Live Polling",
    livePollingDesc: "Automatically query backend APIs every 5 seconds for network updates.",
    gpsSimulationTitle: "GPS Simulation",
    gpsSimulationDesc: "Display animated vehicle markers traveling along active regional routes.",
    multilingualTitle: "Multilingual System",
    multilingualDesc: "Regional language selection across all 10 Northeast state languages.",
    offlineSyncTitle: "Offline Sync Demo",
    offlineSyncDesc: "Display a dismissible offline status banner demonstrating reconnection sync.",
    footerNote: "Updates React state immediately (no reload)",
    doneBtn: "Done"
  },

  // Incident & Alert types
  alerts: {
    "Terrain Risk Warning": "Terrain Risk Warning",
    "Flood Alert": "Flood Alert",
    "Landslide Incident": "Landslide Incident",
    "Simulated Landslide": "Simulated Landslide",
    "Road Closure": "Road Closure",
    "Debris Blockage": "Debris Blockage",
    "Heavy Rain Warning": "Heavy Rain Warning"
  }
};
