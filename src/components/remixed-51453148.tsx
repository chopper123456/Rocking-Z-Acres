import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Cell, Legend, Area, Scatter } from "recharts";

// ========================================
// CORRECTED HISTORICAL DATA (USDA NASS Final)
// ========================================
const NATIONAL_HISTORY = [
  { year: 2014, planted: 90.6, harvested: 83.1, yield: 171.0, production: 14216, harvestRatio: 91.7 },
  { year: 2015, planted: 88.0, harvested: 80.7, yield: 168.4, production: 13602, harvestRatio: 91.7 },
  { year: 2016, planted: 94.0, harvested: 86.7, yield: 174.6, production: 15148, harvestRatio: 92.2 },
  { year: 2017, planted: 90.2, harvested: 82.7, yield: 176.6, production: 14604, harvestRatio: 91.7 },
  { year: 2018, planted: 89.1, harvested: 81.3, yield: 176.4, production: 14340, harvestRatio: 91.2 },
  { year: 2019, planted: 89.7, harvested: 81.3, yield: 167.5, production: 13617, harvestRatio: 90.6 },
  { year: 2020, planted: 90.8, harvested: 82.3, yield: 172.0, production: 14111, harvestRatio: 90.6 },
  { year: 2021, planted: 93.4, harvested: 85.4, yield: 177.0, production: 15115, harvestRatio: 91.4 },
  { year: 2022, planted: 88.6, harvested: 79.2, yield: 173.3, production: 13730, harvestRatio: 89.4 },
  { year: 2023, planted: 94.6, harvested: 86.5, yield: 177.3, production: 15342, harvestRatio: 91.4 },
  { year: 2024, planted: 90.7, harvested: 82.5, yield: 179.3, production: 14790, harvestRatio: 91.0 },
  { year: 2025, planted: 98.8, harvested: 91.3, yield: 186.5, production: 17021, harvestRatio: 92.3 },
];

// Published 2026/27 Projections from industry
const INDUSTRY_PROJECTIONS = [
  { source: "USDA Baseline", planted: 95.0, yield: 181.0, harvRatio: 91.1, production: 15.65, color: "#3b82f6", note: "Dec '25 early release, weather-adjusted trend" },
  { source: "Advance Trading", planted: 94.5, yield: 184.0, harvRatio: 91.5, production: 15.91, color: "#8b5cf6", note: "Dec '25 balance sheet; uses higher yield" },
  { source: "Irwin (U of I)", planted: 95.5, yield: 185.0, harvRatio: 91.1, production: 16.09, color: "#06b6d4", note: "Feb '26 Pro Farmer; bridge pmts tilt to corn" },
  { source: "Texas A&M", planted: 95.0, yield: 183.0, harvRatio: 91.1, production: 15.84, color: "#14b8a6", note: "Feb '26 outlook; trendline yield" },
  { source: "FAPRI/Brown", planted: 95.0, yield: 183.0, harvRatio: 91.1, production: 15.84, color: "#f97316", note: "FAPRI baseline; OBBBA supports corn acres" },
  { source: "NCGA Outlook", planted: 95.0, yield: 186.5, harvRatio: 91.1, production: 16.14, color: "#eab308", note: "Q1 '26; if 2025 yields repeated" },
];

const STATE_DATA = [
  { state: "Iowa", abbr: "IA", planted2024: 12.8, planted2025: 13.9, yield2024: 207, yield2025: 214, trendYield: 198, costPerAcre: 950, rotation: 0.48, harvRatio: 97.0 },
  { state: "Illinois", abbr: "IL", planted2024: 10.5, planted2025: 11.9, yield2024: 214, yield2025: 222, trendYield: 200, costPerAcre: 920, rotation: 0.50, harvRatio: 98.2 },
  { state: "Nebraska", abbr: "NE", planted2024: 9.8, planted2025: 10.9, yield2024: 194, yield2025: 198, trendYield: 188, costPerAcre: 880, rotation: 0.35, harvRatio: 93.5 },
  { state: "Minnesota", abbr: "MN", planted2024: 7.9, planted2025: 8.7, yield2024: 196, yield2025: 204, trendYield: 186, costPerAcre: 870, rotation: 0.52, harvRatio: 94.5 },
  { state: "Indiana", abbr: "IN", planted2024: 5.0, planted2025: 5.8, yield2024: 199, yield2025: 207, trendYield: 185, costPerAcre: 890, rotation: 0.55, harvRatio: 96.5 },
  { state: "S. Dakota", abbr: "SD", planted2024: 5.8, planted2025: 7.0, yield2024: 165, yield2025: 174, trendYield: 161, costPerAcre: 790, rotation: 0.45, harvRatio: 88.0 },
  { state: "Ohio", abbr: "OH", planted2024: 3.2, planted2025: 3.8, yield2024: 197, yield2025: 202, trendYield: 182, costPerAcre: 860, rotation: 0.56, harvRatio: 95.0 },
  { state: "Kansas", abbr: "KS", planted2024: 5.2, planted2025: 6.5, yield2024: 144, yield2025: 151, trendYield: 140, costPerAcre: 750, rotation: 0.30, harvRatio: 79.0 },
  { state: "Wisconsin", abbr: "WI", planted2024: 3.7, planted2025: 4.2, yield2024: 186, yield2025: 192, trendYield: 176, costPerAcre: 850, rotation: 0.48, harvRatio: 90.0 },
  { state: "Missouri", abbr: "MO", planted2024: 3.0, planted2025: 3.5, yield2024: 165, yield2025: 172, trendYield: 158, costPerAcre: 780, rotation: 0.42, harvRatio: 86.0 },
  { state: "N. Dakota", abbr: "ND", planted2024: 3.3, planted2025: 4.0, yield2024: 148, yield2025: 155, trendYield: 145, costPerAcre: 720, rotation: 0.40, harvRatio: 89.0 },
  { state: "Michigan", abbr: "MI", planted2024: 2.1, planted2025: 2.5, yield2024: 179, yield2025: 184, trendYield: 170, costPerAcre: 830, rotation: 0.50, harvRatio: 92.0 },
];

// ========================================
// DEMAND DEEP-DIVE DATA (from research reports)
// ========================================
const EXPORT_RESEARCH = {
  current2526: { wasde: 3.300, janWasde: 3.200, prior2425: 2.858, prior2324: 2.255 },
  weeklyPace: { cumSales: 1.367, pctTarget: 71, fiveYrAvg: 63, yoyPct: 31 },
  destinations: [
    { name: "Mexico", vol: "17-20 MMT", pct: "~40%", trend: "Stable-high", risk: "USMCA review 2026; GMO restrictions leverage" },
    { name: "Japan", vol: "12-13 MMT", pct: "~19%", trend: "Stable", risk: "Very low; already booking 26/27 new-crop" },
    { name: "Colombia", vol: "6-7 MMT", pct: "~11%", trend: "Growing", risk: "Low; strong logistics advantage via Gulf" },
    { name: "S. Korea", vol: "3-5 MMT", pct: "~5%", trend: "Price-dep.", risk: "Moderate; switches between US/SA origin" },
    { name: "EU/Spain", vol: "3-5 MMT", pct: "~4%", trend: "Variable", risk: "High; depends on EU domestic crop & Ukraine" },
    { name: "China", vol: "0-2 MMT", pct: "~0%", trend: "Absent", risk: "No corn commitment in Nov '25 deal; wildcard" },
  ],
  competitors: [
    { name: "Brazil", prod: "138.9 MMT (CONAB)", exports: "46.5 MMT", note: "Safrinha down 3.5%; domestic ethanol consuming 30 MMT; exportable surplus shrinking" },
 { name: "Argentina", prod: "53.0 MMT", exports: "37.0 MMT", note: "Export tax cut 12% -- 9.5%; more competitive" },
    { name: "Ukraine", prod: "29.0 MMT", exports: "22.0 MMT", note: "Jul-Dec exports 5.9 MMT, slowest in 7 years" },
  ],
  fobPrices: { usGulf: 220, brazil: 223, argentina: 214, ukraine: 224, dxy: 97.1, dxyChg: -9.2 },
  scenarios: [
    { name: "Bear", exports: 2.50, prob: 15, color: "#ef4444", drivers: "Trade war; strong $; large Brazil safrinha" },
    { name: "Low", exports: 2.80, prob: 20, color: "#f59e0b", drivers: "Normal competition; Brazil recovery; $ stabilizes" },
    { name: "Base", exports: 3.15, prob: 35, color: "#64748b", drivers: "Trend production; weak $; truce holds" },
    { name: "High", exports: 3.40, prob: 20, color: "#84cc16", drivers: "Weak $; Brazil shortfall; modest China buying" },
    { name: "Bull", exports: 3.60, prob: 10, color: "#22c55e", drivers: "Perfect storm: very weak $ + Brazil miss + China" },
  ],
  expectedVal: 3.08,
};

const ETHANOL_RESEARCH = {
  current2526: { wasdeUse: 5.600, prior2425: 5.436, prior2324: 5.489 },
  historicalUse: [
    { year: "20/21", use: 5.033 }, { year: "21/22", use: 5.326 }, { year: "22/23", use: 5.174 },
    { year: "23/24", use: 5.489 }, { year: "24/25", use: 5.436 }, { year: "25/26", use: 5.600 },
  ],
  keyDrivers: [
    { factor: "E15 Year-Round", status: "Pending", impact: "+200-400M bu if passed", detail: "Nationwide Consumer & Fuel Retailer Choice Act stalled Jan '26; Congress created task force instead. NCGA 'disgusted'. EPA emergency waivers continue annually." },
 { factor: "RFS Volumes", status: "Proposed", impact: "+50-100M bu", detail: "EPA proposed 2026-27 RVOs; robust volumes if finalized. Small refinery exemptions (SREs) key risk -- 2018-19 SREs destroyed 500M+ gallons demand." },
    { factor: "45Z Clean Fuel Credit", status: "Extended via OBBBA", impact: "Supports margins", detail: "OBBBA harmonized ILUC emissions to zero for corn ethanol. R&D expensing reinstated. 45Q enhanced for CCS at ethanol plants." },
 { factor: "SAF Tax Credit", status: "Extended", impact: "+50-150M bu long-term", detail: "Ethanol-to-SAF pathway extended in OBBBA. Nascent but growing -> 2026-27 impact minimal, 2028+ significant." },
    { factor: "Gasoline Demand", status: "Declining", impact: "-50-100M bu/yr trend", detail: "EIA projects gasoline consumption declining ~1%/yr from EVs, efficiency. At 10.5% blend, ethanol falls from 14.2B gal (2025) to 13.1B gal (2035) = -400M bu." },
    { factor: "Ethanol Exports", status: "Stable", impact: "Neutral", detail: "US exports ~1.5B gal/yr; limited expansion potential. Brazil, India growing domestic supply." },
  ],
  scenarios: [
    { name: "Bear (SREs + no E15)", use: 5.25, prob: 10, color: "#ef4444" },
    { name: "Status Quo", use: 5.45, prob: 30, color: "#f59e0b" },
    { name: "Base (moderate RVOs)", use: 5.55, prob: 35, color: "#64748b" },
    { name: "E15 Passes + strong RVOs", use: 5.70, prob: 20, color: "#84cc16" },
    { name: "Bull (E15 + SAF ramp)", use: 5.85, prob: 5, color: "#22c55e" },
  ],
  expectedVal: 5.49,
};

const FEED_RESEARCH = {
  current2526: { wasdeFeed: 6.200, prior2425: 5.782, prior2324: 5.786 },
  historicalUse: [
    { year: "20/21", use: 5.596 }, { year: "21/22", use: 5.711 }, { year: "22/23", use: 5.552 },
    { year: "23/24", use: 5.786 }, { year: "24/25", use: 5.782 }, { year: "25/26", use: 6.200 },
  ],
  components: [
 { name: "Livestock Feed (actual)", pct: "~65-70%", detail: "Cattle, hogs, poultry, dairy. Driven by animal units on feed -- ration inclusion rate -- days on feed." },
    { name: "Residual (statistical)", pct: "~30-35%", detail: "Catch-all for measurement error, on-farm use, waste. RISES with production (more corn = higher unmeasured disappearance)." },
  ],
  livestockOutlook: [
    { sector: "Cattle/Beef", outlook: "Herd rebuild underway; inventories rising from 2024 cyclical low. Beef production forecast lower in 2026 on tight supplies, but more calves on feed = more corn. Imports restricted from Mexico." },
    { sector: "Hogs/Pork", outlook: "Production rising on increased litter rates. Pork production forecast higher in 2026. Steady corn demand." },
    { sector: "Poultry/Broiler", outlook: "Production increasing on favorable returns. HPAI risk persists for turkeys/layers. Broiler production rising 2-3%." },
    { sector: "Dairy", outlook: "Milk production at record levels. Herd stable with higher per-cow output. Steady feed demand." },
  ],
  residualNote: "CRITICAL: The 'residual' component is NOT actual feed. It's a statistical plug = Total Supply - (Exports + FSI + Ethanol + Ending Stocks). When production surges (as in 2025's 17B), residual balloons. For 2026/27, if production drops to ~15.5B, feed & residual should decline proportionally. USDA initial 25/26 projection was 5.9B; actual 6.2B after Jan Grain Stocks showed larger Q1 disappearance.",
  priceEffect: "Lower corn prices ($4.00-4.20/bu) increase inclusion rates in rations. Every $0.50/bu decline in corn = ~100-200M bu more feed use as livestock producers substitute corn for alternative feeds.",
  scenarios: [
    { name: "Low production year", use: 5.50, prob: 15, color: "#ef4444", note: "~14.5B prod; residual compressed" },
    { name: "Below-trend prod", use: 5.70, prob: 20, color: "#f59e0b", note: "~15.0B prod; normal feed" },
    { name: "Base (trend)", use: 5.90, prob: 35, color: "#64748b", note: "~15.5B prod; herd rebuild + normal residual" },
    { name: "Above-trend", use: 6.10, prob: 20, color: "#84cc16", note: "~16.0B prod; larger residual" },
    { name: "High (bumper crop)", use: 6.30, prob: 10, color: "#22c55e", note: "~16.5B+; 2025-like residual surge" },
  ],
  expectedVal: 5.88,
};

const WEATHER_SCENARIOS = [
  { name: "Ideal (2025-like)", prob: 0.10, yieldAdj: +5.5, color: "#22c55e" },
  { name: "Favorable", prob: 0.25, yieldAdj: +2.5, color: "#84cc16" },
  { name: "Normal/Trend", prob: 0.35, yieldAdj: 0, color: "#64748b" },
  { name: "Moderate Stress", prob: 0.20, yieldAdj: -6.0, color: "#f59e0b" },
  { name: "Severe Drought", prob: 0.10, yieldAdj: -18.0, color: "#ef4444" },
];

// ========================================
// ACREAGE DECISION DATA (Corn vs Soybean)
// ========================================
const ACREAGE_DECISION_HIST = [
  { year: 2013, cP: 95.4, sP: 76.5, cProj: 5.65, cHarv: 4.39, sProj: 12.87, sHarv: 12.87, cY: 158.1, sY: 44.0, cCost: null, sCost: null, cIns: null, sIns: null },
  { year: 2014, cP: 90.6, sP: 83.3, cProj: 4.62, cHarv: 3.49, sProj: 11.36, sHarv: 9.65,  cY: 171.0, sY: 47.5, cCost: null, sCost: null, cIns: null, sIns: null },
  { year: 2015, cP: 88.0, sP: 82.7, cProj: 4.15, cHarv: 3.83, sProj: 9.73,  sHarv: 8.80,  cY: 168.4, sY: 48.0, cCost: null, sCost: null, cIns: null, sIns: null },
  { year: 2016, cP: 94.0, sP: 83.5, cProj: 3.86, cHarv: 3.49, sProj: 8.85,  sHarv: 9.75,  cY: 174.6, sY: 51.9, cCost: null, sCost: null, cIns: null, sIns: null },
  { year: 2017, cP: 90.2, sP: 90.2, cProj: 3.96, cHarv: 3.49, sProj: 10.19, sHarv: 9.75,  cY: 176.6, sY: 49.3, cCost: null, sCost: null, cIns: null, sIns: null },
  { year: 2018, cP: 89.1, sP: 89.2, cProj: 3.96, cHarv: 3.68, sProj: 10.16, sHarv: 8.60,  cY: 176.4, sY: 50.6, cCost: null, sCost: null, cIns: null, sIns: null },
  { year: 2019, cP: 89.7, sP: 76.1, cProj: 4.00, cHarv: 3.88, sProj: 9.54,  sHarv: 9.25,  cY: 167.5, sY: 47.4, cCost: 804, sCost: 614, cIns: 23, sIns: 14 },
  { year: 2020, cP: 90.7, sP: 83.4, cProj: 3.88, cHarv: 4.03, sProj: 9.17,  sHarv: 10.55, cY: 171.4, sY: 51.0, cCost: 780, sCost: 595, cIns: 19, sIns: 11 },
  { year: 2021, cP: 93.4, sP: 87.2, cProj: 4.58, cHarv: 5.37, sProj: 11.87, sHarv: 12.30, cY: 177.0, sY: 51.7, cCost: 820, sCost: 601, cIns: 26, sIns: 15 },
  { year: 2022, cP: 88.6, sP: 87.5, cProj: 5.90, cHarv: 6.82, sProj: 14.33, sHarv: 13.78, cY: 173.3, sY: 49.6, cCost: 979, sCost: 687, cIns: 40, sIns: 24 },
  { year: 2023, cP: 94.6, sP: 83.6, cProj: 5.91, cHarv: 4.88, sProj: 13.76, sHarv: 12.84, cY: 177.3, sY: 50.6, cCost: 1020, sCost: 710, cIns: 36, sIns: 22 },
  { year: 2024, cP: 90.7, sP: 87.1, cProj: 4.66, cHarv: 4.16, sProj: 11.55, sHarv: 10.16, cY: 183.1, sY: 50.7, cCost: 958, sCost: 680, cIns: 27, sIns: 16 },
  { year: 2025, cP: 98.8, sP: 81.2, cProj: 4.70, cHarv: 4.22, sProj: 10.54, sHarv: 10.36, cY: 186.5, sY: 53.0, cCost: 878, sCost: 658, cIns: 22, sIns: 13 },
  { year: 2026, cP: 94.5, sP: 85.0, cProj: 4.32, cHarv: null, sProj: 10.52, sHarv: null, cY: 183, sY: 52.5, cCost: 912, sCost: 679, cIns: 17, sIns: 9, est: true },
];

const ACREAGE_DATA = ACREAGE_DECISION_HIST.map(d => {
  const ratio = d.sProj / d.cProj;
  const total = d.cP + d.sP;
  const cShare = d.cP / total * 100;
  const cRP85 = Math.round(d.cProj * d.cY * 0.85);
  const sRP85 = Math.round(d.sProj * d.sY * 0.85);
  const cRev = Math.round(d.cProj * d.cY);
  const sRev = Math.round(d.sProj * d.sY);
  const cMargin = d.cCost ? cRev - d.cCost : null;
  const sMargin = d.sCost ? sRev - d.sCost : null;
  return { ...d, ratio: Math.round(ratio * 1000) / 1000, total: Math.round(total * 10) / 10, cShare: Math.round(cShare * 10) / 10, cRP85, sRP85, cRev, sRev, cMargin, sMargin, marginAdv: cMargin !== null && sMargin !== null ? cMargin - sMargin : null };
});

const acreageEst = ACREAGE_DATA[ACREAGE_DATA.length - 1];

// ========================================
export default function CornProjectionEngine() {
  // Acreage
  const [soyCornRatio, setSoyCornRatio] = useState(2.42);
  const [financialStressFactor, setFinancialStressFactor] = useState(0.5);
  const [fertilizerCostChange, setFertilizerCostChange] = useState(-5);
  const [rotationPressure, setRotationPressure] = useState(0.6);
  const [bridgePaymentEffect, setBridgePaymentEffect] = useState(1.5); // M acres kept in corn due to $44/ac
  // Harvested ratio
  const [harvestRatioOverride, setHarvestRatioOverride] = useState(91.1); // 25-yr avg
  // Yield
  const [weatherScenarioIdx, setWeatherScenarioIdx] = useState(2);
  const [trendGrowthRate, setTrendGrowthRate] = useState(2.0);
  const [plantingProgressAdj, setPlantingProgressAdj] = useState(0);
  const [ensoAdj, setEnsoAdj] = useState(-0.5);
  // Demand
  const [exportEstimate, setExportEstimate] = useState(3.15);
  const [ethanolEstimate, setEthanolEstimate] = useState(5.50);
  const [feedEstimate, setFeedEstimate] = useState(5.90);

  const [activeTab, setActiveTab] = useState("acreage");
  const [acreageSubTab, setAcreageSubTab] = useState("model"); // "model" | "acres" | "ratio" | "insurance" | "budgets" | "scatter" | "acreageTable"
  const [expandedDemand, setExpandedDemand] = useState(null); // "exports" | "ethanol" | "feed" | null

  // ====== ACREAGE MODEL ======
  const acreageModel = useMemo(() => {
    const ratioBase = 112.5 - (soyCornRatio * 7.2);
    const stressAdj = -financialStressFactor * 2.8;
    const fertAdj = fertilizerCostChange * 0.04;
    const rotAdj = -rotationPressure * 3.5;
    const bridgeAdj = bridgePaymentEffect;
    const totalPlanted = Math.max(88, Math.min(100, ratioBase + stressAdj + fertAdj + rotAdj + bridgeAdj));
    
    // CORRECTED: Use actual harvest ratio, not simple abandon rate
    const harvested = totalPlanted * (harvestRatioOverride / 100);

    const stateProjections = STATE_DATA.map(s => {
      const acreSwing2025 = s.planted2025 - s.planted2024;
      const reversion = -acreSwing2025 * rotationPressure * s.rotation;
      const stateStress = -financialStressFactor * s.costPerAcre / 1000 * 0.8;
      const bridgeKeep = bridgePaymentEffect * (s.planted2025 / 98.8);
      const proj = Math.max(s.planted2024 * 0.88, s.planted2025 + reversion + stateStress + bridgeKeep);
      const stateHarvested = proj * (s.harvRatio / 100);
      return { ...s, projected2026: +proj.toFixed(2), change: +(proj - s.planted2025).toFixed(2), harvested2026: +stateHarvested.toFixed(2) };
    });

    return { totalPlanted: +totalPlanted.toFixed(1), harvested: +harvested.toFixed(1), stateProjections, ratioBase: +ratioBase.toFixed(1), stressAdj: +stressAdj.toFixed(1), fertAdj: +fertAdj.toFixed(1), rotAdj: +rotAdj.toFixed(1), bridgeAdj: +bridgeAdj.toFixed(1) };
  }, [soyCornRatio, financialStressFactor, fertilizerCostChange, rotationPressure, bridgePaymentEffect, harvestRatioOverride]);

  // ====== YIELD MODEL ======
  const yieldModel = useMemo(() => {
    const ws = WEATHER_SCENARIOS[weatherScenarioIdx];
    const baseTrend = 181 + trendGrowthRate;
    const stochasticAdj = -0.5;
    const projectedYield = baseTrend + ws.yieldAdj + plantingProgressAdj + ensoAdj + stochasticAdj;
    const expectedYield = WEATHER_SCENARIOS.reduce((sum, sc) =>
      sum + (baseTrend + sc.yieldAdj + plantingProgressAdj + ensoAdj + stochasticAdj) * sc.prob, 0);
    const yieldDistribution = WEATHER_SCENARIOS.map(sc => ({
      name: sc.name,
      yield: +(baseTrend + sc.yieldAdj + plantingProgressAdj + ensoAdj + stochasticAdj).toFixed(1),
      probability: sc.prob * 100,
      color: sc.color,
      production: +((baseTrend + sc.yieldAdj + plantingProgressAdj + ensoAdj + stochasticAdj) * acreageModel.harvested / 1000).toFixed(2),
    }));
    return { baseTrend: +baseTrend.toFixed(1), selectedYield: +projectedYield.toFixed(1), expectedYield: +expectedYield.toFixed(1), weatherAdj: ws.yieldAdj, scenario: ws, yieldDistribution };
  }, [weatherScenarioIdx, trendGrowthRate, plantingProgressAdj, ensoAdj, acreageModel.harvested]);

  // ====== BALANCE SHEET ======
  const balanceSheet = useMemo(() => {
    const beginStocks = 2.127;
    const production = +(yieldModel.selectedYield * acreageModel.harvested / 1000).toFixed(3);
    const imports = 0.025;
    const totalSupply = +(beginStocks + production + imports).toFixed(3);
    const fsi = 1.42;
    const totalDomestic = +(feedEstimate + ethanolEstimate + fsi).toFixed(3);
    const totalUse = +(totalDomestic + exportEstimate).toFixed(3);
    const endingStocks = +(totalSupply - totalUse).toFixed(3);
    const stocksToUse = totalUse > 0 ? +((endingStocks / totalUse) * 100).toFixed(1) : 0;
    let priceEst;
    if (stocksToUse > 16) priceEst = 3.60;
    else if (stocksToUse > 14) priceEst = 3.90;
    else if (stocksToUse > 12) priceEst = 4.20;
    else if (stocksToUse > 10) priceEst = 4.55;
    else if (stocksToUse > 8) priceEst = 5.10;
    else priceEst = 5.80;
    const expProduction = +(yieldModel.expectedYield * acreageModel.harvested / 1000).toFixed(3);
    const expEnding = +(beginStocks + expProduction + imports - totalUse).toFixed(3);
    const expSU = totalUse > 0 ? +((expEnding / totalUse) * 100).toFixed(1) : 0;
    return { beginStocks, production, imports, totalSupply, feedEstimate, ethanolEstimate, fsi, totalDomestic, exportEstimate, totalUse, endingStocks, stocksToUse, priceEst, expProduction, expEnding, expSU };
  }, [acreageModel, yieldModel, exportEstimate, ethanolEstimate, feedEstimate]);

  const historyWithProjection = useMemo(() => {
    const hist = NATIONAL_HISTORY.map(h => ({ year: h.year, planted: h.planted, harvested: h.harvested, yield: h.yield, production: +(h.production / 1000).toFixed(2), harvestRatio: h.harvestRatio, type: "actual" }));
    hist.push({ year: 2026, planted: acreageModel.totalPlanted, harvested: acreageModel.harvested, yield: yieldModel.selectedYield, production: balanceSheet.production, harvestRatio: harvestRatioOverride, type: "projected" });
    return hist;
  }, [acreageModel, yieldModel, balanceSheet, harvestRatioOverride]);

  // ====== UI HELPERS ======
  const Slider = ({ label, value, onChange, min, max, step, unit = "", sublabel }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#c8d6e5", letterSpacing: 0.3 }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace" }}>{typeof value === "number" ? value.toFixed(step < 1 ? (step < 0.1 ? 2 : 1) : 0) : value}{unit}</span>
      </div>
      {sublabel && <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3, lineHeight: 1.3 }}>{sublabel}</div>}
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: "#fbbf24", height: 5, cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#4b5563" }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );

  const MetricBox = ({ label, value, sub, color = "#fbbf24", warn }) => (
    <div style={{ textAlign: "center", padding: "12px 6px", background: warn ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.025)", borderRadius: 8, border: `1px solid ${warn ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)"}` }}>
      <div style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{sub}</div>}
    </div>
  );

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)}
      style={{ padding: "8px 16px", fontSize: 12, fontWeight: activeTab === id ? 700 : 500, color: activeTab === id ? "#0f172a" : "#6b7280", background: activeTab === id ? "#fbbf24" : "transparent", border: "none", borderRadius: 5, cursor: "pointer", transition: "all 0.15s" }}>
      {label}
    </button>
  );

  const getSUColor = su => su > 14 ? "#22c55e" : su > 12 ? "#84cc16" : su > 10 ? "#fbbf24" : su > 8 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ minHeight: "100vh", background: "#0c1017", color: "#d1d5db", fontFamily: "'Inter', -apple-system, sans-serif", padding: "20px 14px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        input[type=range]{-webkit-appearance:none;background:rgba(255,255,255,0.07);border-radius:3px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:#fbbf24;cursor:pointer;border:2px solid #0c1017}
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>2026/27 Corn Projection Engine</h1>
 <span style={{ fontSize: 11, color: "#4b5563", fontFamily: "'JetBrains Mono', monospace" }}>v3.0 -- corrected H/P ratios</span>
        </div>
        <p style={{ margin: "3px 0 16px", fontSize: 12, color: "#6b7280" }}>
 Economics-driven acreage + corrected harvested/planted ratios + scenario-weighted yield -> balance sheet
        </p>

        {/* Top Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 18 }}>
          <MetricBox label="Planted" value={`${acreageModel.totalPlanted}M`} sub={`${(acreageModel.totalPlanted - 98.8).toFixed(1)}M vs '25`} />
          <MetricBox label="H/P Ratio" value={`${harvestRatioOverride}%`} sub={`25yr avg: 91.1%`} warn={harvestRatioOverride < 90 || harvestRatioOverride > 92.5} />
          <MetricBox label="Harvested" value={`${acreageModel.harvested.toFixed(1)}M`} sub={`vs 91.3M in '25`} />
          <MetricBox label="Yield" value={yieldModel.selectedYield} sub={`E[Y]=${yieldModel.expectedYield.toFixed(1)}`} color="#60a5fa" />
          <MetricBox label="Production" value={`${balanceSheet.production.toFixed(2)}B`} sub="bushels" />
          <MetricBox label="Ending Stks" value={`${balanceSheet.endingStocks.toFixed(2)}B`} sub={`S/U: ${balanceSheet.stocksToUse}%`} color={getSUColor(balanceSheet.stocksToUse)} />
          <MetricBox label="Implied $" value={`$${balanceSheet.priceEst.toFixed(2)}`} sub="season avg" color={balanceSheet.priceEst > 4.4 ? "#22c55e" : "#fbbf24"} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 3, marginBottom: 16, background: "rgba(255,255,255,0.025)", padding: 3, borderRadius: 6, width: "fit-content" }}>
          <TabBtn id="acreage" label="Acreage & Harvest" />
          <TabBtn id="yield" label="Yield Model" />
          <TabBtn id="balance" label="Balance Sheet" />
          <TabBtn id="compare" label="Industry Projections" />
          <TabBtn id="history" label="Historical" />
          <TabBtn id="sources" label="Sources" />
        </div>

        {/* ====== ACREAGE TAB ====== */}
        {activeTab === "acreage" && (
          <div>
            {/* Sub-tabs for acreage section */}
            <div style={{ display: "flex", gap: 3, marginBottom: 14, background: "rgba(255,255,255,0.02)", padding: 3, borderRadius: 6, flexWrap: "wrap" }}>
              {[["model","Acreage Model"],["acres","Stacked Acres"],["ratio","Price Ratio"],["insurance","Insurance & RP"],["budgets","ISU Budgets"],["scatter","Ratio vs Acres"],["acreageTable","Full Data"]].map(([id,label])=>(
                <button key={id} onClick={()=>setAcreageSubTab(id)} style={{ padding:"6px 12px",fontSize:11,fontWeight:acreageSubTab===id?700:500,color:acreageSubTab===id?"#0f172a":"#6b7280",background:acreageSubTab===id?"#f59e0b":"transparent",border:"none",borderRadius:4,cursor:"pointer",transition:"all 0.15s" }}>{label}</button>
              ))}
            </div>

            {/* Acreage Decision Stats Row */}
            {acreageSubTab !== "model" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 14 }}>
                {[
                  ["2026e Corn",`${acreageEst.cP}M`,"ac planted","#f59e0b"],
                  ["2026e Soy",`${acreageEst.sP}M`,"ac planted","#22c55e"],
                  ["2026e Ratio",acreageEst.ratio.toFixed(2),"soy/corn","#60a5fa"],
                  ["Corn RP 85%",`$${acreageEst.cRP85}`,"/ac guarantee","#fbbf24"],
                  ["Soy RP 85%",`$${acreageEst.sRP85}`,"/ac guarantee","#22c55e"],
                  ["Corn Margin",`$${acreageEst.cMargin}`,"/ac vs ISU cost",acreageEst.cMargin>0?"#22c55e":"#ef4444"],
                  ["Soy Margin",`$${acreageEst.sMargin}`,"/ac vs ISU cost",acreageEst.sMargin>0?"#22c55e":"#ef4444"],
                ].map(([lbl,val,sub,c])=>(
                  <div key={lbl} style={{ textAlign:"center",padding:"8px 4px",background:"rgba(255,255,255,0.02)",borderRadius:6,border:"1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ fontSize:8,color:"#6b7280",textTransform:"uppercase",letterSpacing:0.7 }}>{lbl}</div>
                    <div style={{ fontSize:18,fontWeight:700,color:c,fontFamily:"'JetBrains Mono', monospace",marginTop:1 }}>{val}</div>
                    <div style={{ fontSize:9,color:"#4b5563",marginTop:1 }}>{sub}</div>
                  </div>
                ))}
              </div>
            )}

            {/* ====== MODEL SUB-TAB (original acreage content) ====== */}
            {acreageSubTab === "model" && (
          <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>Acreage & Harvest Drivers</h3>
 <Slider label="Soy/Corn Price Ratio" value={soyCornRatio} onChange={setSoyCornRatio} min={2.0} max={3.0} step={0.02} sublabel="Higher -> more beans planted, fewer corn acres" />
              <Slider label="Rotation Pressure" value={rotationPressure} onChange={setRotationPressure} min={0} max={1} step={0.05} sublabel="0=sticky, 1=full reversion from '25 surge" />
              <Slider label="Financial Stress" value={financialStressFactor} onChange={setFinancialStressFactor} min={0} max={1} step={0.05} sublabel="4th yr of losses; stressed farmers plant beans" />
              <Slider label="Bridge Pmt Effect" value={bridgePaymentEffect} onChange={setBridgePaymentEffect} min={0} max={3} step={0.1} unit="M ac" sublabel="$44.36/ac corn vs $30.88 beans keeps acres in corn" />
 <Slider label="Fertilizer Cost Chg " value={fertilizerCostChange} onChange={setFertilizerCostChange} min={-15} max={15} step={1} unit="%" sublabel="Cheaper N favors corn (forecast -5% in 2026)" />
              
              <div style={{ marginTop: 12, padding: 10, background: "rgba(239,68,68,0.06)", borderRadius: 6, border: "1px solid rgba(239,68,68,0.15)" }}>
 <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, marginBottom: 6 }}> -- HARVESTED/PLANTED RATIO (KEY FIX)</div>
                <Slider label="H/P Ratio" value={harvestRatioOverride} onChange={setHarvestRatioOverride} min={88} max={93} step={0.1} unit="%" sublabel="25yr avg=91.1% | 2025 final=92.3% (highest since '07) | 2019=90.6%" />
                <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.4, marginTop: 4 }}>
 Gap = silage + abandoned + prevent plant. High-yield years -> higher ratio (less silage). Normal year -> ~91%. 2025's 92.3% was exceptional -- outlier, not new normal.
                </div>
              </div>

              <div style={{ marginTop: 14, padding: 10, background: "rgba(251,191,36,0.05)", borderRadius: 6, border: "1px solid rgba(251,191,36,0.12)" }}>
                <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 600, marginBottom: 6 }}>ACREAGE BUILD-UP</div>
                <div style={{ fontSize: 11, color: "#c8d6e5", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
                  Ratio base: {acreageModel.ratioBase}M<br/>
                  Rotation: {acreageModel.rotAdj > 0 ? "+" : ""}{acreageModel.rotAdj}M<br/>
                  Stress: {acreageModel.stressAdj > 0 ? "+" : ""}{acreageModel.stressAdj}M<br/>
                  Bridge pmts: +{acreageModel.bridgeAdj}M<br/>
                  Fert: {acreageModel.fertAdj > 0 ? "+" : ""}{acreageModel.fertAdj}M<br/>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 4, paddingTop: 4, fontWeight: 700, color: "#fbbf24" }}>
 Planted: {acreageModel.totalPlanted}M x {harvestRatioOverride}% = <span style={{ color: "#60a5fa" }}>{acreageModel.harvested.toFixed(1)}M harvested</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* ====== Harvest Ratio History THE KEY CHART ====== */}
              <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
 <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>Harvested/Planted Ratio History -- Why This Matters</h3>
                <p style={{ margin: "0 0 10px", fontSize: 10, color: "#6b7280" }}>Each 1% change in H/P ratio on 95M planted acres = ~950K harvested acres = ~175M bu production swing at trend yield</p>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={historyWithProjection} margin={{ top: 8, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <YAxis domain={[88, 93.5]} tick={{ fontSize: 10, fill: "#6b7280" }} label={{ value: "H/P %", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "#4b5563" } }} />
                    <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} />
                    <Bar dataKey="harvestRatio" name="H/P Ratio %">
                      {historyWithProjection.map((d, i) => (
                        <Cell key={i} fill={d.type === "projected" ? "#fbbf24" : d.harvestRatio >= 92 ? "#22c55e" : d.harvestRatio < 90.5 ? "#ef4444" : "#60a5fa"} fillOpacity={d.type === "projected" ? 1 : 0.65} />
                      ))}
                    </Bar>
                    <ReferenceLine y={91.1} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "25yr Avg: 91.1%", fill: "#f59e0b", fontSize: 9 }} />
                    <ReferenceLine y={92.3} stroke="#22c55e" strokeDasharray="3 3" label={{ value: "2025: 92.3%", fill: "#22c55e", fontSize: 9 }} />
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                  {[
                    ["2022 (drought yr)", "89.4%", "#ef4444"],
                    ["2019 (prevent plant)", "90.6%", "#f59e0b"],
                    ["2025 (record yield)", "92.3%", "#22c55e"],
                  ].map(([label, val, c]) => (
                    <div key={label} style={{ padding: "6px 8px", background: `${c}11`, borderRadius: 4, border: `1px solid ${c}22`, fontSize: 10, textAlign: "center" }}>
                      <div style={{ color: "#9ca3af" }}>{label}</div>
                      <div style={{ color: c, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* State chart */}
              <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
 <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>State Planted Acres: 2024 -> 2025 -> 2026 Projected</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={acreageModel.stateProjections} margin={{ top: 8, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="abbr" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} formatter={(v) => [`${v}M ac`]} />
                    <Bar dataKey="planted2024" name="2024" fill="#4b5563" radius={[2,2,0,0]} />
                    <Bar dataKey="planted2025" name="2025" fill="#60a5fa" radius={[2,2,0,0]} />
                    <Bar dataKey="projected2026" name="2026 Proj" fill="#fbbf24" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            </div>
            )}

            {/* ====== STACKED ACRES SUB-TAB ====== */}
            {acreageSubTab === "acres" && (
              <div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#c8d6e5", marginBottom: 2 }}>CORN + SOYBEAN PLANTED ACRES (M) - Stacked</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>2026e: {acreageEst.total}M ({acreageEst.cP}M corn + {acreageEst.sP}M soy). Dashed border = estimate.</div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ACREAGE_DATA} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <YAxis domain={[0, 200]} tick={{ fontSize: 10, fill: "#6b7280" }} label={{ value: "M Acres", angle: -90, position: "insideLeft", fontSize: 9, fill: "#4b5563" }} />
                      <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="cP" name="Corn" stackId="a" fill="#f59e0b" fillOpacity={0.8}>{ACREAGE_DATA.map((d, i) => <Cell key={i} fill="#f59e0b" fillOpacity={d.est ? 0.4 : 0.8} stroke={d.est ? "#f59e0b" : "none"} strokeWidth={d.est ? 1.5 : 0} strokeDasharray={d.est ? "4 2" : ""} />)}</Bar>
                      <Bar dataKey="sP" name="Soybeans" stackId="a" fill="#22c55e" fillOpacity={0.8} radius={[2,2,0,0]}>{ACREAGE_DATA.map((d, i) => <Cell key={i} fill="#22c55e" fillOpacity={d.est ? 0.4 : 0.8} stroke={d.est ? "#22c55e" : "none"} strokeWidth={d.est ? 1.5 : 0} strokeDasharray={d.est ? "4 2" : ""} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#c8d6e5", marginBottom: 2 }}>CORN SHARE OF COMBINED ACRES (%)</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>Above 54% = corn-heavy. 2025: 54.9% (most since 2013). 2026e: {acreageEst.cShare}%.</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <ComposedChart data={ACREAGE_DATA} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <YAxis domain={[47, 57]} tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `${v}%`} />
                      <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} />
                      <ReferenceLine y={52.5} stroke="#4b5563" strokeDasharray="5 5" />
                      <Line dataKey="cShare" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: "#f59e0b" }} name="Corn Share %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ====== PRICE RATIO SUB-TAB ====== */}
            {acreageSubTab === "ratio" && (
              <div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", marginBottom: 2 }}>NOV SOY / DEC CORN - Feb Insurance Price Ratio</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>2026e: <strong style={{ color: "#a78bfa" }}>{acreageEst.ratio.toFixed(2)}</strong> — highest since 2018. Higher ratio = soy more attractive.</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={ACREAGE_DATA} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <defs><linearGradient id="rFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60a5fa" stopOpacity={0.15} /><stop offset="100%" stopColor="#60a5fa" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <YAxis domain={[2.0, 2.8]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} />
                      <ReferenceLine y={2.4} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "~2.40 neutral", fill: "#f59e0b", fontSize: 9, position: "insideTopRight" }} />
                      <Area dataKey="ratio" fill="url(#rFill)" stroke="none" name="Ratio" />
                      <Line dataKey="ratio" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4, fill: "#60a5fa" }} name="Soy/Corn Ratio" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[{ r: "< 2.30", l: "Corn gains acres", d: "Low soy value relative to corn. Corn dominates planting.", c: "#f59e0b" },
                    { r: "2.30 - 2.50", l: "Neutral zone", d: `2026 at ${acreageEst.ratio.toFixed(2)}. Policy, costs, rotation tip balance.`, c: "#60a5fa" },
                    { r: "> 2.50", l: "Soy gains acres", d: "Strong soy economics. 2017-2018: 90M+ soy acres.", c: "#22c55e" }
                  ].map((z, i) => (<div key={i} style={{ padding: 12, textAlign: "center", background: "rgba(255,255,255,0.025)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}><div style={{ fontSize: 9, color: "#6b7280" }}>{z.r}</div><div style={{ fontSize: 14, fontWeight: 700, color: z.c, margin: "4px 0" }}>{z.l}</div><div style={{ fontSize: 10, color: "#4b5563" }}>{z.d}</div></div>))}
                </div>
              </div>
            )}

            {/* ====== INSURANCE & RP SUB-TAB ====== */}
            {acreageSubTab === "insurance" && (
              <div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#c8d6e5", marginBottom: 2 }}>85% REVENUE PROTECTION GUARANTEE ($/ac)</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>Proj Price x Yield x 0.85. Higher = less risk = more willingness to plant that crop.</div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={ACREAGE_DATA} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `$${v}`} domain={[0, 1000]} />
                      <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="cRP85" name="Corn RP $/ac" fill="#f59e0b" fillOpacity={0.7} radius={[2,2,0,0]} />
                      <Bar dataKey="sRP85" name="Soy RP $/ac" fill="#22c55e" fillOpacity={0.7} radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 2 }}>CROP INSURANCE PREMIUMS (ISU, 80% RP, Central IA) - $/ac</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>2026e premiums ~<strong style={{ color: "#22c55e" }}>half of 2025</strong>. Corn: ~$17 (vs $22). Soy: ~$9 (vs $13). Lower vol + lower proj prices.</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ACREAGE_DATA.filter(d => d.cIns !== null)} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `$${v}`} domain={[0, 45]} />
                      <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="cIns" name="Corn Prem $/ac" fill="#f59e0b" fillOpacity={0.6} radius={[2,2,0,0]} />
                      <Bar dataKey="sIns" name="Soy Prem $/ac" fill="#22c55e" fillOpacity={0.6} radius={[2,2,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#c8d6e5", marginBottom: 6 }}>2026 INSURANCE INSIGHTS</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.7 }}>
                    <div style={{ padding: 10, background: "rgba(34,197,94,0.04)", borderRadius: 6, border: "1px solid rgba(34,197,94,0.12)", marginBottom: 8 }}><strong style={{ color: "#22c55e" }}>Premiums roughly halved.</strong> Lower projected prices and lower volatility mean cheaper coverage. Corn 80% RP ~$17/ac vs $22 last year. Soy ~$9 vs $13.</div>
                    <div style={{ padding: 10, background: "rgba(96,165,250,0.04)", borderRadius: 6, border: "1px solid rgba(96,165,250,0.12)", marginBottom: 8 }}><strong style={{ color: "#60a5fa" }}>Feb premiums favorable vs Nov policies.</strong> February insurance premiums are significantly cheaper than Nov policy period, supporting acreage decisions based on the Feb price ratio ({acreageEst.ratio.toFixed(2)}) rather than last fall's levels.</div>
                    <div style={{ padding: 10, background: "rgba(245,158,11,0.04)", borderRadius: 6, border: "1px solid rgba(245,158,11,0.12)" }}><strong style={{ color: "#f59e0b" }}>Corn margins still favorable to beans, but gap shrinking.</strong> At MTD Feb prices, ISU budgets show corn margin advantage of ~${acreageEst.marginAdv}/ac over soy — significantly less than 2025 when higher prices + bridge payments widened the gap.</div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== ISU BUDGETS SUB-TAB ====== */}
            {acreageSubTab === "budgets" && (
              <div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#c8d6e5", marginBottom: 2 }}>REVENUE vs ISU COST ($/ac) - Bars = Revenue, Dashed = Cost</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>Revenue = Feb proj price x national yield. Cost = ISU total (variable + fixed + land).</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={ACREAGE_DATA.filter(d => d.cCost !== null)} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `$${v}`} domain={[400, 1200]} />
                      <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="cRev" name="Corn Rev $/ac" fill="#f59e0b" fillOpacity={0.4} radius={[2,2,0,0]} />
                      <Bar dataKey="sRev" name="Soy Rev $/ac" fill="#22c55e" fillOpacity={0.4} radius={[2,2,0,0]} />
                      <Line dataKey="cCost" name="Corn Cost" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
                      <Line dataKey="sCost" name="Soy Cost" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#c8d6e5", marginBottom: 2 }}>MARGIN (Revenue - Cost) - $/ac</div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>Red = loss. Both crops underwater in 2026e but corn less so.</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ACREAGE_DATA.filter(d => d.cMargin !== null)} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `$${v}`} />
                      <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} /><Legend wrapperStyle={{ fontSize: 10 }} /><ReferenceLine y={0} stroke="#6b7280" />
                      <Bar dataKey="cMargin" name="Corn Margin" radius={[2,2,0,0]}>{ACREAGE_DATA.filter(d => d.cMargin !== null).map((d, i) => <Cell key={i} fill={d.cMargin >= 0 ? "#f59e0b" : "#ef4444"} fillOpacity={d.est ? 0.5 : 0.7} />)}</Bar>
                      <Bar dataKey="sMargin" name="Soy Margin" radius={[2,2,0,0]}>{ACREAGE_DATA.filter(d => d.sMargin !== null).map((d, i) => <Cell key={i} fill={d.sMargin >= 0 ? "#22c55e" : "#ef4444"} fillOpacity={d.est ? 0.5 : 0.7} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 6 }}>ISU 2026 BUDGET (Ag Decision Maker, FM 1712, Jan 2026)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>
                    <div style={{ padding: 10, background: "rgba(245,158,11,0.04)", borderRadius: 6, border: "1px solid rgba(245,158,11,0.12)" }}>
                      <strong style={{ color: "#f59e0b" }}>Corn Following Soy - 211 bpa</strong><br/>Total cost: <strong>$912/ac</strong> ($4.32/bu)<br/>Variable: $484 | Fixed: $428<br/>Insurance (80% RP): $17.10/ac<br/>Land (rent): $274/ac<br/>At $4.32: Rev $911/ac<br/><strong style={{ color: "#ef4444" }}>Margin: ~-$1/ac</strong>
                    </div>
                    <div style={{ padding: 10, background: "rgba(34,197,94,0.04)", borderRadius: 6, border: "1px solid rgba(34,197,94,0.12)" }}>
                      <strong style={{ color: "#22c55e" }}>Soy Following Corn - 61 bpa</strong><br/>Total cost: <strong>$679/ac</strong> ($11.13/bu)<br/>Variable: $290 | Fixed: $389<br/>Insurance (80% RP): $9.10/ac<br/>Land (rent): $274/ac<br/>At $10.52: Rev $642/ac<br/><strong style={{ color: "#ef4444" }}>Margin: ~-$37/ac</strong>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 10, color: "#6b7280", lineHeight: 1.5 }}><strong>Key:</strong> Corn costs up 4%, soy up 2% vs 2025. Corn margin advantage ~$36/ac over soy at MTD Feb prices — significantly less than year-ago when bridge payments ($44/ac corn) and higher proj price ($4.70) widened the gap.</div>
                </div>
              </div>
            )}

            {/* ====== SCATTER SUB-TAB ====== */}
            {acreageSubTab === "scatter" && (
              <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#c8d6e5", marginBottom: 2 }}>SOY/CORN RATIO vs SOY PLANTED ACRES</div>
                <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 8 }}>Higher ratio should pull soy acres up. Insurance, policy, and costs create outliers.</div>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={ACREAGE_DATA} margin={{ top: 10, right: 15, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="ratio" type="number" domain={[2.1, 2.7]} tick={{ fontSize: 10, fill: "#6b7280" }} label={{ value: "Soy/Corn Ratio (Feb)", position: "insideBottom", offset: -5, fontSize: 10, fill: "#6b7280" }} />
                    <YAxis domain={[74, 92]} tick={{ fontSize: 10, fill: "#6b7280" }} label={{ value: "Soy Planted (M ac)", angle: -90, position: "insideLeft", fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip content={({ active, payload }) => { if (!active || !payload?.length) return null; const d = payload[0].payload; return (<div style={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, padding: 8, fontSize: 10 }}><div style={{ fontWeight: 700, color: d.est ? "#a78bfa" : "#f59e0b" }}>{d.year}{d.est ? "e" : ""}</div><div>Ratio: {d.ratio.toFixed(3)} | Soy: {d.sP}M | Corn: {d.cP}M</div>{d.cMargin !== null && <div style={{ color: "#6b7280" }}>Corn margin: ${d.cMargin} | Soy: ${d.sMargin}</div>}</div>); }} />
                    <Scatter dataKey="sP" fill="#22c55e">{ACREAGE_DATA.map((d, i) => <Cell key={i} fill={d.est ? "#a78bfa" : d.year >= 2023 ? "#f59e0b" : "#22c55e"} r={d.est ? 8 : d.year >= 2023 ? 6 : 4} />)}</Scatter>
                  </ComposedChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", fontSize: 10, color: "#6b7280", marginTop: 6 }}>
                  {[["#22c55e", "2013-2022"], ["#f59e0b", "2023-2025"], ["#a78bfa", "2026e"]].map(([c, l]) => (<span key={l}><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: c, marginRight: 3 }} />{l}</span>))}
                </div>
              </div>
            )}

            {/* ====== FULL DATA TABLE SUB-TAB ====== */}
            {acreageSubTab === "acreageTable" && (
              <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5, minWidth: 1050 }}>
                  <thead><tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                    {["Yr","Corn M","Soy M","Tot","C%","C Proj","C Harv","S Proj","S Harv","Ratio","CY","SY","C RP85","S RP85","C Cost","S Cost","C Marg","S Marg"].map(h => (<th key={h} style={{ padding: "4px 3px", textAlign: "right", color: "#6b7280", fontWeight: 600, fontSize: 7.5, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>))}
                  </tr></thead>
                  <tbody>{ACREAGE_DATA.map(d => (
                    <tr key={d.year} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: d.est ? "rgba(167,139,250,0.04)" : d.year >= 2023 ? "rgba(245,158,11,0.02)" : "transparent" }}>
                      <td style={{ padding: "3px", textAlign: "right", fontWeight: 700, color: d.est ? "#a78bfa" : "#c8d6e5" }}>{d.year}{d.est?"e":""}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: "#f59e0b" }}>{d.cP}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: "#22c55e" }}>{d.sP}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: "#6b7280" }}>{d.total}</td>
                      <td style={{ padding: "3px", textAlign: "right" }}>{d.cShare}%</td>
                      <td style={{ padding: "3px", textAlign: "right" }}>${d.cProj.toFixed(2)}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: d.cHarv===null?"#4b5563":d.cHarv>d.cProj?"#22c55e":"#ef4444" }}>{d.cHarv!==null?`$${d.cHarv.toFixed(2)}`:"--"}</td>
                      <td style={{ padding: "3px", textAlign: "right" }}>${d.sProj.toFixed(2)}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: d.sHarv===null?"#4b5563":d.sHarv>d.sProj?"#22c55e":"#ef4444" }}>{d.sHarv!==null?`$${d.sHarv.toFixed(2)}`:"--"}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: "#60a5fa", fontWeight: 600 }}>{d.ratio.toFixed(2)}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: "#6b7280" }}>{d.cY}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: "#6b7280" }}>{d.sY}</td>
                      <td style={{ padding: "3px", textAlign: "right" }}>${d.cRP85}</td>
                      <td style={{ padding: "3px", textAlign: "right" }}>${d.sRP85}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: "#6b7280" }}>{d.cCost?`$${d.cCost}`:"--"}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: "#6b7280" }}>{d.sCost?`$${d.sCost}`:"--"}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: d.cMargin===null?"#4b5563":d.cMargin>=0?"#22c55e":"#ef4444", fontWeight: 600 }}>{d.cMargin!==null?`$${d.cMargin}`:"--"}</td>
                      <td style={{ padding: "3px", textAlign: "right", color: d.sMargin===null?"#4b5563":d.sMargin>=0?"#22c55e":"#ef4444", fontWeight: 600 }}>{d.sMargin!==null?`$${d.sMargin}`:"--"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* ====== YIELD TAB ====== */}
        {activeTab === "yield" && (
          <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#60a5fa" }}>Yield Drivers</h3>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#c8d6e5", marginBottom: 6 }}>Weather Scenario</div>
                {WEATHER_SCENARIOS.map((ws, i) => (
                  <button key={i} onClick={() => setWeatherScenarioIdx(i)}
                    style={{ display: "block", width: "100%", padding: "7px 10px", marginBottom: 3, textAlign: "left", fontSize: 11, fontWeight: weatherScenarioIdx === i ? 700 : 400, color: weatherScenarioIdx === i ? "#0f172a" : "#c8d6e5", background: weatherScenarioIdx === i ? ws.color : "rgba(255,255,255,0.025)", border: weatherScenarioIdx === i ? "none" : "1px solid rgba(255,255,255,0.05)", borderRadius: 5, cursor: "pointer" }}>
 {ws.name} ({ws.yieldAdj > 0 ? "+" : ""}{ws.yieldAdj} bpa) -- {(ws.prob*100)}% prob
                  </button>
                ))}
              </div>
              <Slider label="Trend Growth" value={trendGrowthRate} onChange={setTrendGrowthRate} min={1.0} max={3.0} step={0.1} unit=" bpa/yr" sublabel="Irwin: ~2 bpa/yr; aggressive: 2.5+" />
              <Slider label="Late Planting" value={plantingProgressAdj} onChange={setPlantingProgressAdj} min={-5} max={0} step={0.5} unit=" bpa" sublabel="0=normal; -5=very late (2019-like)" />
 <Slider label="ENSO Adj" value={ensoAdj} onChange={setEnsoAdj} min={-3} max={2} step={0.5} unit=" bpa" sublabel="La Nina->Neutral transition: slight negative" />
              <div style={{ marginTop: 12, padding: 10, background: "rgba(96,165,250,0.06)", borderRadius: 6, border: "1px solid rgba(96,165,250,0.12)" }}>
                <div style={{ fontSize: 10, color: "#60a5fa", fontWeight: 600, marginBottom: 6 }}>YIELD BUILD-UP</div>
                <div style={{ fontSize: 11, color: "#c8d6e5", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.7 }}>
                  2025 trend: 181.0<br/>
                  + Growth: +{trendGrowthRate.toFixed(1)}<br/>
                  + Weather: {yieldModel.weatherAdj > 0 ? "+" : ""}{yieldModel.weatherAdj.toFixed(1)}<br/>
                  + Planting: {plantingProgressAdj.toFixed(1)}<br/>
                  + ENSO: {ensoAdj > 0 ? "+" : ""}{ensoAdj.toFixed(1)}<br/>
                  + Stochastic: -0.5<br/>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 4, paddingTop: 4, fontWeight: 700, color: "#60a5fa" }}>= {yieldModel.selectedYield} bpa</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
 <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>Yield Distribution -- Production Impact</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={yieldModel.yieldDistribution} margin={{ top: 8, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} />
                    <YAxis yAxisId="yield" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <YAxis yAxisId="prob" orientation="right" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} />
                    <Bar yAxisId="yield" dataKey="yield" name="Yield (bpa)" radius={[3,3,0,0]}>
                      {yieldModel.yieldDistribution.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={weatherScenarioIdx === i ? 1 : 0.3} />)}
                    </Bar>
                    <Line yAxisId="prob" dataKey="probability" name="Prob %" stroke="#fbbf24" strokeWidth={2} dot={{ r: 4, fill: "#fbbf24" }} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "#6b7280" }}>
 E[Yield]: <span style={{ fontWeight: 700, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>{yieldModel.expectedYield.toFixed(1)}</span> -- 
                  E[Prod]: <span style={{ fontWeight: 700, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace" }}>{(yieldModel.expectedYield * acreageModel.harvested / 1000).toFixed(2)}B</span>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>US Corn Yield History + 2026</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={historyWithProjection} margin={{ top: 8, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <YAxis domain={[160, 195]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} />
                    <Line dataKey="yield" name="Yield (bpa)" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
                    <ReferenceLine y={yieldModel.baseTrend} stroke="#fbbf24" strokeDasharray="5 5" label={{ value: `Trend: ${yieldModel.baseTrend}`, fill: "#fbbf24", fontSize: 9 }} />
                    <ReferenceLine y={186.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "2025: 186.5", fill: "#ef4444", fontSize: 9 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ====== BALANCE SHEET TAB ====== */}
        {activeTab === "balance" && (
          <div style={{ display: "grid", gridTemplateColumns: expandedDemand ? "1fr" : "310px 1fr", gap: 20 }}>
            {!expandedDemand ? (
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#22c55e" }}>Demand Assumptions</h3>
              <p style={{ margin: "0 0 10px", fontSize: 10, color: "#6b7280" }}>Click any category for full research deep-dive</p>

              {/* EXPORTS clickable */}
              <div onClick={() => setExpandedDemand("exports")} style={{ cursor: "pointer", padding: 10, marginBottom: 8, background: "rgba(96,165,250,0.04)", borderRadius: 6, border: "1px solid rgba(96,165,250,0.12)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(96,165,250,0.04)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa" }}>Exports</span>
                  <span style={{ fontSize: 9, color: "#60a5fa", background: "rgba(96,165,250,0.1)", padding: "2px 6px", borderRadius: 3 }}>Deep-dive \u2192</span>
                </div>
                <Slider label="Exports" value={exportEstimate} onChange={setExportEstimate} min={2.5} max={3.6} step={0.05} unit="B" sublabel={`E[V]=${EXPORT_RESEARCH.expectedVal}B | 25/26: ${EXPORT_RESEARCH.current2526.wasde}B record`} />
              </div>

              {/* ETHANOL clickable */}
              <div onClick={() => setExpandedDemand("ethanol")} style={{ cursor: "pointer", padding: 10, marginBottom: 8, background: "rgba(251,191,36,0.04)", borderRadius: 6, border: "1px solid rgba(251,191,36,0.12)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(251,191,36,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(251,191,36,0.04)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24" }}>Ethanol</span>
                  <span style={{ fontSize: 9, color: "#fbbf24", background: "rgba(251,191,36,0.1)", padding: "2px 6px", borderRadius: 3 }}>Deep-dive \u2192</span>
                </div>
                <Slider label="Ethanol" value={ethanolEstimate} onChange={setEthanolEstimate} min={5.0} max={5.8} step={0.05} unit="B" sublabel={`E[V]=${ETHANOL_RESEARCH.expectedVal}B | 25/26: ${ETHANOL_RESEARCH.current2526.wasdeUse}B`} />
              </div>

              {/* FEED clickable */}
              <div onClick={() => setExpandedDemand("feed")} style={{ cursor: "pointer", padding: 10, marginBottom: 8, background: "rgba(34,197,94,0.04)", borderRadius: 6, border: "1px solid rgba(34,197,94,0.12)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,197,94,0.04)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#22c55e" }}>Feed & Residual</span>
                  <span style={{ fontSize: 9, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 6px", borderRadius: 3 }}>Deep-dive \u2192</span>
                </div>
                <Slider label="Feed & Residual" value={feedEstimate} onChange={setFeedEstimate} min={5.4} max={6.4} step={0.05} unit="B" sublabel={`E[V]=${FEED_RESEARCH.expectedVal}B | 25/26: ${FEED_RESEARCH.current2526.wasdeFeed}B`} />
              </div>

              <div style={{ marginTop: 12, padding: 10, background: "rgba(34,197,94,0.05)", borderRadius: 6, border: "1px solid rgba(34,197,94,0.12)" }}>
                <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 600, marginBottom: 6 }}>S/U \u2192 PRICE MAP</div>
                <div style={{ fontSize: 10, lineHeight: 1.7 }}>
                  {[[">16%","$3.50-3.80","#22c55e"],["14-16%","$3.80-4.10","#84cc16"],["12-14%","$4.10-4.40","#fbbf24"],["10-12%","$4.40-5.00","#f59e0b"],["8-10%","$5.00-5.50","#ef4444"],["<8%","$5.50+","#dc2626"]].map(([su,p,c])=>(
                    <div key={su} style={{display:"flex",justifyContent:"space-between"}}><span style={{color:c,fontWeight:600}}>{su}</span><span style={{fontFamily:"'JetBrains Mono', monospace",color:"#c8d6e5"}}>{p}</span></div>
                  ))}
                </div>
              </div>
            </div>
            ) : (
            /* EXPANDED DEMAND DEEP-DIVE */
            <div style={{ gridColumn: "1 / -1" }}>
              <button onClick={() => setExpandedDemand(null)} style={{ marginBottom: 12, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#fbbf24", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 5, cursor: "pointer" }}>\u2190 Back to Balance Sheet</button>

              {/* EXPORTS DEEP-DIVE */}
              {expandedDemand === "exports" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#60a5fa" }}>Export Demand Deep-Dive \u2014 2026/27</h3>
                    <div style={{ flex: 1, maxWidth: 300 }}><Slider label="Your Export Estimate" value={exportEstimate} onChange={setExportEstimate} min={2.5} max={3.6} step={0.05} unit="B" /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8 }}>25/26 BASELINE (Feb WASDE)</div>
                      <div style={{ fontSize: 10, color: "#c8d6e5", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.8 }}>
                        Exports: <span style={{ color: "#60a5fa", fontWeight: 700 }}>3.300B</span> (record)<br/>vs Jan: +100M bu<br/>vs 24/25: +442M (+15.5%)<br/>vs 23/24: +1,045M (+46.3%)
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 6, paddingTop: 6 }}>
                        Weekly: {EXPORT_RESEARCH.weeklyPace.cumSales}B committed<br/>Pace: {EXPORT_RESEARCH.weeklyPace.pctTarget}% vs {EXPORT_RESEARCH.weeklyPace.fiveYrAvg}% avg<br/>YoY: +{EXPORT_RESEARCH.weeklyPace.yoyPct}%
                        </div>
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8 }}>FOB PRICES ($/MT) & DOLLAR</div>
                      {[["US Gulf", EXPORT_RESEARCH.fobPrices.usGulf, "#60a5fa"], ["Brazil", EXPORT_RESEARCH.fobPrices.brazil, "#22c55e"], ["Argentina", EXPORT_RESEARCH.fobPrices.argentina, "#fbbf24"], ["Ukraine", EXPORT_RESEARCH.fobPrices.ukraine, "#f59e0b"]].map(([n, p, c]) => (
                        <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11 }}><span style={{ color: "#9ca3af" }}>{n}</span><span style={{ color: c, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>${p}</span></div>
                      ))}
                      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 6, paddingTop: 6, fontSize: 10, color: "#9ca3af" }}>
                        DXY: <span style={{ color: "#22c55e", fontWeight: 700 }}>{EXPORT_RESEARCH.fobPrices.dxy}</span> ({EXPORT_RESEARCH.fobPrices.dxyChg}% YoY)<br/><span style={{ color: "#22c55e" }}>Weak $ = cheaper US corn globally</span>
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8 }}>COMPETITORS</div>
                      {EXPORT_RESEARCH.competitors.map(c => (
                        <div key={c.name} style={{ marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#c8d6e5" }}>{c.name}: {c.prod}</div><div style={{ fontSize: 9, color: "#6b7280" }}>Exp: {c.exports} \u2014 {c.note}</div></div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8 }}>TOP DESTINATIONS</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6 }}>
                      {EXPORT_RESEARCH.destinations.map(d => (
                        <div key={d.name} style={{ padding: 8, background: "rgba(255,255,255,0.015)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.04)" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: d.name === "China" ? "#ef4444" : "#c8d6e5" }}>{d.name}</div>
                          <div style={{ fontSize: 10, color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>{d.vol}</div>
                          <div style={{ fontSize: 9, color: "#6b7280" }}>{d.pct} \u2022 {d.trend}</div>
                          <div style={{ fontSize: 8, color: "#4b5563", marginTop: 3 }}>{d.risk}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#60a5fa", marginBottom: 8 }}>26/27 EXPORT SCENARIOS \u2014 E[V] = {EXPORT_RESEARCH.expectedVal}B</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                      {EXPORT_RESEARCH.scenarios.map(s => (
                        <div key={s.name} style={{ padding: 10, background: `${s.color}0a`, borderRadius: 6, border: `1px solid ${s.color}25`, textAlign: "center" }}>
                          <div style={{ fontSize: 9, color: s.color, fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.exports}B</div>
                          <div style={{ fontSize: 9, color: "#6b7280" }}>{s.prob}% prob</div>
                          <div style={{ fontSize: 8, color: "#4b5563", marginTop: 3 }}>{s.drivers}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, padding: 8, background: "rgba(96,165,250,0.04)", borderRadius: 4, fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>
                      <strong style={{ color: "#60a5fa" }}>Key:</strong> 25/26 at 3.3B is a high-water mark (17B production). With 26/27 ~15.5B, surplus shrinks. But weak $ (DXY 97 vs 107) and Brazil ethanol boom (30 MMT domestic) are structural tailwinds. Mexico (40% to one buyer) is biggest risk.
                    </div>
                  </div>
                </div>
              )}

              {/* ETHANOL DEEP-DIVE */}
              {expandedDemand === "ethanol" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fbbf24" }}>Ethanol Demand Deep-Dive \u2014 2026/27</h3>
                    <div style={{ flex: 1, maxWidth: 300 }}><Slider label="Your Ethanol Estimate" value={ethanolEstimate} onChange={setEthanolEstimate} min={5.0} max={5.8} step={0.05} unit="B" /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>CORN FOR ETHANOL \u2014 HISTORICAL (B bu)</div>
                      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
                        {ETHANOL_RESEARCH.historicalUse.map((h, i) => (
                          <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ height: `${(h.use - 4.8) * 80}px`, background: i === ETHANOL_RESEARCH.historicalUse.length - 1 ? "#fbbf24" : "rgba(251,191,36,0.3)", borderRadius: "3px 3px 0 0", minHeight: 10 }} />
                            <div style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>{h.year}</div>
                            <div style={{ fontSize: 9, color: "#c8d6e5", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{h.use}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 10, color: "#9ca3af" }}>25/26 WASDE: <span style={{ color: "#fbbf24", fontWeight: 700 }}>5.600B</span> (unchanged Jan\u2192Feb). Range since 2019: 5.03\u20135.60B</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>KEY POLICY DRIVERS</div>
                      {ETHANOL_RESEARCH.keyDrivers.map(d => (
                        <div key={d.factor} style={{ marginBottom: 6, padding: 6, background: "rgba(255,255,255,0.015)", borderRadius: 4 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#c8d6e5" }}>{d.factor}</span>
                            <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, fontWeight: 600, color: d.status === "Pending" ? "#f59e0b" : d.status === "Declining" ? "#ef4444" : "#22c55e", background: d.status === "Pending" ? "rgba(245,158,11,0.1)" : d.status === "Declining" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)" }}>{d.status}</span>
                          </div>
                          <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 600 }}>{d.impact}</div>
                          <div style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>{d.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>26/27 ETHANOL SCENARIOS \u2014 E[V] = {ETHANOL_RESEARCH.expectedVal}B</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                      {ETHANOL_RESEARCH.scenarios.map(s => (
                        <div key={s.name} style={{ padding: 10, background: `${s.color}0a`, borderRadius: 6, border: `1px solid ${s.color}25`, textAlign: "center" }}>
                          <div style={{ fontSize: 8, color: s.color, fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.use}B</div>
                          <div style={{ fontSize: 9, color: "#6b7280" }}>{s.prob}% prob</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, padding: 8, background: "rgba(251,191,36,0.04)", borderRadius: 4, fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>
                      <strong style={{ color: "#fbbf24" }}>Key:</strong> Most stable demand category (5.0\u20135.6B range over 6 years). E15 year-round is biggest upside (+200-400M bu) but Congress punted Jan \'26. OBBBA extended 45Z with zero ILUC for corn ethanol. Gasoline declining ~1%/yr is structural headwind. Realistic 26/27 range: 5.45\u20135.55B without E15.
                    </div>
                  </div>
                </div>
              )}

              {/* FEED DEEP-DIVE */}
              {expandedDemand === "feed" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#22c55e" }}>Feed & Residual Deep-Dive \u2014 2026/27</h3>
                    <div style={{ flex: 1, maxWidth: 300 }}><Slider label="Your F&R Estimate" value={feedEstimate} onChange={setFeedEstimate} min={5.4} max={6.4} step={0.05} unit="B" /></div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>FEED & RESIDUAL \u2014 HISTORICAL (B bu)</div>
                      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
                        {FEED_RESEARCH.historicalUse.map((h, i) => (
                          <div key={i} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ height: `${(h.use - 5.0) * 66}px`, background: i === FEED_RESEARCH.historicalUse.length - 1 ? "#22c55e" : "rgba(34,197,94,0.3)", borderRadius: "3px 3px 0 0", minHeight: 10 }} />
                            <div style={{ fontSize: 8, color: "#6b7280", marginTop: 2 }}>{h.year}</div>
                            <div style={{ fontSize: 9, color: "#c8d6e5", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{h.use}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        {FEED_RESEARCH.components.map(c => (
                          <div key={c.name} style={{ marginBottom: 4, padding: 5, background: "rgba(255,255,255,0.015)", borderRadius: 4 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "#c8d6e5" }}>{c.name} <span style={{ color: "#22c55e" }}>{c.pct}</span></div>
                            <div style={{ fontSize: 8, color: "#6b7280" }}>{c.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>LIVESTOCK OUTLOOK (WASDE/ERS)</div>
                      {FEED_RESEARCH.livestockOutlook.map(l => (
                        <div key={l.sector} style={{ marginBottom: 8, padding: 6, background: "rgba(255,255,255,0.015)", borderRadius: 4 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: "#c8d6e5" }}>{l.sector}</div>
                          <div style={{ fontSize: 9, color: "#9ca3af", lineHeight: 1.4 }}>{l.outlook}</div>
                        </div>
                      ))}
                      <div style={{ padding: 6, background: "rgba(34,197,94,0.04)", borderRadius: 4, fontSize: 9, color: "#22c55e", lineHeight: 1.4 }}>
                        <strong>Price effect:</strong> {FEED_RESEARCH.priceEffect}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(239,68,68,0.04)", borderRadius: 8, padding: 12, border: "1px solid rgba(239,68,68,0.12)", marginBottom: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>UNDERSTANDING THE "RESIDUAL"</div>
                    <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>{FEED_RESEARCH.residualNote}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 8, padding: 14, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>26/27 F&R SCENARIOS \u2014 E[V] = {FEED_RESEARCH.expectedVal}B</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                      {FEED_RESEARCH.scenarios.map(s => (
                        <div key={s.name} style={{ padding: 10, background: `${s.color}0a`, borderRadius: 6, border: `1px solid ${s.color}25`, textAlign: "center" }}>
                          <div style={{ fontSize: 8, color: s.color, fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.use}B</div>
                          <div style={{ fontSize: 9, color: "#6b7280" }}>{s.prob}% prob</div>
                          <div style={{ fontSize: 7, color: "#4b5563", marginTop: 2 }}>{s.note}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, padding: 8, background: "rgba(34,197,94,0.04)", borderRadius: 4, fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>
                      <strong style={{ color: "#22c55e" }}>Key:</strong> Most production-dependent demand category. 25/26 jump to 6.2B driven by 17B crop inflating residual. For 26/27 with ~15.5B production, expect reversion to 5.85\u20135.95B. Cattle herd rebuild + low prices support actual feed, but smaller residual offsets. If production disappoints, this drops fastest.
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
<div>
              <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>2026/27 US Corn Balance Sheet (Billion Bushels)</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  <thead><tr style={{ borderBottom: "2px solid #fbbf24" }}>
                    <th style={{ textAlign: "left", padding: "6px 10px", color: "#fbbf24" }}>Category</th>
                    <th style={{ textAlign: "right", padding: "6px 10px", color: "#4b5563" }}>25/26 USDA</th>
                    <th style={{ textAlign: "right", padding: "6px 10px", color: "#60a5fa" }}>26/27 Selected</th>
                    <th style={{ textAlign: "right", padding: "6px 10px", color: "#22c55e" }}>26/27 E[V]</th>
                  </tr></thead>
                  <tbody>
                    {[
                      ["SUPPLY",null,null,null,true],
                      ["Beg. Stocks","1.551",balanceSheet.beginStocks.toFixed(3),balanceSheet.beginStocks.toFixed(3)],
                      ["Planted Acres","98.8M",`${acreageModel.totalPlanted}M`,`${acreageModel.totalPlanted}M`],
                      ["H/P Ratio","92.3%",`${harvestRatioOverride}%`,`${harvestRatioOverride}%`],
                      ["Harvested","91.3M",`${acreageModel.harvested.toFixed(1)}M`,`${acreageModel.harvested.toFixed(1)}M`],
                      ["Yield","186.5",`${yieldModel.selectedYield}`,`${yieldModel.expectedYield.toFixed(1)}`],
                      ["Production","17.021",balanceSheet.production.toFixed(3),balanceSheet.expProduction.toFixed(3)],
                      ["Imports","0.025","0.025","0.025"],
                      ["Total Supply","18.597",balanceSheet.totalSupply.toFixed(3),(balanceSheet.beginStocks+balanceSheet.expProduction+0.025).toFixed(3),true],
                      ["USE",null,null,null,true],
                      ["Feed & Resid.","6.200",feedEstimate.toFixed(2),feedEstimate.toFixed(2)],
                      ["Ethanol","5.500",ethanolEstimate.toFixed(2),ethanolEstimate.toFixed(2)],
                      ["FSI Other","1.415","1.420","1.420"],
                      ["Exports","3.300",exportEstimate.toFixed(2),exportEstimate.toFixed(2)],
                      ["Total Use","16.415",balanceSheet.totalUse.toFixed(3),balanceSheet.totalUse.toFixed(3),true],
                      ["RESULT",null,null,null,true],
                      ["Ending Stocks","2.127",balanceSheet.endingStocks.toFixed(3),balanceSheet.expEnding.toFixed(3)],
                      ["Stocks/Use","13.0%",`${balanceSheet.stocksToUse}%`,`${balanceSheet.expSU}%`],
 ["Implied Price","$4.10",`$${balanceSheet.priceEst.toFixed(2)}`," -- "],
                    ].map(([l,c25,cS,cE,hdr],i)=>(
                      <tr key={i} style={{borderBottom:hdr?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(255,255,255,0.02)",background:hdr?"rgba(255,255,255,0.015)":"transparent"}}>
                        <td style={{padding:"5px 10px",fontWeight:hdr?700:400,color:hdr?"#fbbf24":l.includes("Ending")||l.includes("Stocks/Use")?getSUColor(balanceSheet.stocksToUse):"#c8d6e5"}}>{l}</td>
                        <td style={{textAlign:"right",padding:"5px 10px",color:"#4b5563"}}>{c25}</td>
                        <td style={{textAlign:"right",padding:"5px 10px",color:"#60a5fa",fontWeight:l.includes("Ending")||l.includes("Production")?700:400}}>{cS}</td>
                        <td style={{textAlign:"right",padding:"5px 10px",color:"#22c55e"}}>{cE}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Scenario boxes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {yieldModel.yieldDistribution.map((d, i) => {
                  const supply = +(balanceSheet.beginStocks + d.production + 0.025).toFixed(2);
                  const ending = +(supply - balanceSheet.totalUse).toFixed(2);
                  const su = balanceSheet.totalUse > 0 ? +((ending / balanceSheet.totalUse) * 100).toFixed(1) : 0;
                  return (
                    <div key={i} style={{ padding: 10, background: `${d.color}0a`, borderRadius: 6, border: `1px solid ${d.color}25`, textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: d.color, fontWeight: 700 }}>{d.name}</div>
                      <div style={{ fontSize: 9, color: "#6b7280" }}>{d.yield} bpa</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: d.color, fontFamily: "'JetBrains Mono', monospace", margin: "4px 0" }}>{d.production}B</div>
                      <div style={{ fontSize: 9, color: "#6b7280" }}>ES: {ending.toFixed(2)}B</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: getSUColor(su), fontFamily: "'JetBrains Mono', monospace" }}>{su}% S/U</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ====== INDUSTRY COMPARE TAB ====== */}
        {activeTab === "compare" && (
          <div>
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 14 }}>
 <h3 style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#c8d6e5" }}>2026/27 Corn -- Industry Projection Comparison</h3>
              <p style={{ margin: "0 0 12px", fontSize: 11, color: "#6b7280" }}>Your model (gold) vs published estimates from USDA, universities, and trade houses. Sources: USDA Baseline (Dec '25), Advance Trading (Dec '25), Scott Irwin/U of I (Feb '26 Pro Farmer), Texas A&M (Feb '26), FAPRI/Ben Brown (Feb '26), NCGA Q1 Outlook.</p>
              
              {/* Planted Acres comparison */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", margin: "0 0 8px" }}>Planted Acres (M)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[...INDUSTRY_PROJECTIONS, { source: "Your Model", planted: acreageModel.totalPlanted, yield: yieldModel.selectedYield, production: balanceSheet.production, color: "#fbbf24", harvRatio: harvestRatioOverride }]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="source" tick={{ fontSize: 9, fill: "#6b7280" }} angle={-15} />
                    <YAxis domain={[92, 97]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} formatter={v => [`${v}M acres`]} />
                    <Bar dataKey="planted" radius={[3,3,0,0]}>
                      {[...INDUSTRY_PROJECTIONS, { color: "#fbbf24" }].map((d, i) => <Cell key={i} fill={d.color} fillOpacity={i === INDUSTRY_PROJECTIONS.length ? 1 : 0.7} />)}
                    </Bar>
                    <ReferenceLine y={98.8} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "2025: 98.8M", fill: "#ef4444", fontSize: 9, position: "right" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Yield comparison */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", margin: "0 0 8px" }}>Yield (bpa)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[...INDUSTRY_PROJECTIONS, { source: "Your Model", planted: acreageModel.totalPlanted, yield: yieldModel.selectedYield, production: balanceSheet.production, color: "#fbbf24", harvRatio: harvestRatioOverride }]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="source" tick={{ fontSize: 9, fill: "#6b7280" }} angle={-15} />
                    <YAxis domain={[178, 188]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} formatter={v => [`${v} bpa`]} />
                    <Bar dataKey="yield" radius={[3,3,0,0]}>
                      {[...INDUSTRY_PROJECTIONS, { color: "#fbbf24" }].map((d, i) => <Cell key={i} fill={d.color} fillOpacity={i === INDUSTRY_PROJECTIONS.length ? 1 : 0.7} />)}
                    </Bar>
                    <ReferenceLine y={186.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "2025: 186.5", fill: "#ef4444", fontSize: 9, position: "right" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Production comparison */}
              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", margin: "0 0 8px" }}>Production (Billion Bu)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[...INDUSTRY_PROJECTIONS, { source: "Your Model", planted: acreageModel.totalPlanted, yield: yieldModel.selectedYield, production: balanceSheet.production, color: "#fbbf24", harvRatio: harvestRatioOverride }]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="source" tick={{ fontSize: 9, fill: "#6b7280" }} angle={-15} />
                    <YAxis domain={[14.5, 17.5]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} formatter={v => [`${v}B bu`]} />
                    <Bar dataKey="production" radius={[3,3,0,0]}>
                      {[...INDUSTRY_PROJECTIONS, { color: "#fbbf24" }].map((d, i) => <Cell key={i} fill={d.color} fillOpacity={i === INDUSTRY_PROJECTIONS.length ? 1 : 0.7} />)}
                    </Bar>
                    <ReferenceLine y={17.021} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "2025: 17.02B", fill: "#ef4444", fontSize: 9, position: "right" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detail table */}
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>Projection Detail & Notes</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead><tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
                  {["Source","Planted (M)","H/P %","Harvested (M)","Yield","Prod (B)","Notes"].map(h=>(
                    <th key={h} style={{ textAlign: h==="Notes"?"left":"right", padding: "6px 8px", color: "#6b7280", fontWeight: 600, fontSize: 10 }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
 {[...INDUSTRY_PROJECTIONS, { source: "YOUR MODEL", planted: acreageModel.totalPlanted, yield: yieldModel.selectedYield, production: balanceSheet.production, color: "#fbbf24", harvRatio: harvestRatioOverride, note: `Custom -- E[Y]=${yieldModel.expectedYield.toFixed(1)}, E[Prod]=${(yieldModel.expectedYield * acreageModel.harvested / 1000).toFixed(2)}B` }].map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", background: p.source === "YOUR MODEL" ? "rgba(251,191,36,0.06)" : "transparent" }}>
                      <td style={{ padding: "5px 8px", textAlign: "right", color: p.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{p.source}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#c8d6e5" }}>{p.planted}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#c8d6e5" }}>{p.harvRatio}%</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#c8d6e5" }}>{(p.planted * p.harvRatio / 100).toFixed(1)}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#c8d6e5" }}>{p.yield}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", fontFamily: "'JetBrains Mono', monospace", color: "#c8d6e5", fontWeight: 600 }}>{typeof p.production === "number" ? p.production.toFixed(2) : p.production}</td>
                      <td style={{ padding: "5px 8px", textAlign: "left", color: "#6b7280", fontSize: 10 }}>{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 12, padding: 10, background: "rgba(251,191,36,0.04)", borderRadius: 6, border: "1px solid rgba(251,191,36,0.1)", fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>
 <strong style={{ color: "#fbbf24" }}>Key Observation:</strong> Most industry projections cluster at 94.5 -- 96M planted acres and 181 -- 185 bpa yield. The biggest divergence is in yield: Irwin (185 -- 186) and NCGA (186.5, assuming repeat of 2025) vs USDA baseline (181) and Texas A&M (183). <strong style={{ color: "#fbbf24" }}>The H/P ratio is the variable almost nobody talks about</strong> -- most are implicitly using 91.1% (25yr avg), but note that ATI uses 91.5% while 2025 printed 92.3%. Using 92.3% vs 91.1% on 95M planted acres = 1.14M more harvested acres = ~210M more bushels. That's the difference between comfortable 14% S/U and watchable 12.5% S/U.
              </div>
            </div>
          </div>
        )}

        {/* ====== HISTORY TAB ====== */}
        {activeTab === "history" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
 <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>Planted vs Harvested Acres (2014 -> 2026)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={historyWithProjection} margin={{ top: 8, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis domain={[75, 102]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="planted" name="Planted (M)" fill="#60a5fa" fillOpacity={0.35} radius={[2,2,0,0]} />
                  <Bar dataKey="harvested" name="Harvested (M)" fill="#22c55e" fillOpacity={0.6} radius={[2,2,0,0]} />
                </ComposedChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 10, color: "#4b5563", marginTop: 6 }}>The gap between bars = silage + abandoned + prevent plant. Wider gap = lower H/P ratio.</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>Alternating Acreage Pattern</h3>
              <div style={{ padding: 12, fontSize: 12, color: "#c8d6e5", fontFamily: "'JetBrains Mono', monospace", lineHeight: 2.0 }}>
                {NATIONAL_HISTORY.slice(-6).map((h, i) => {
                  const prev = NATIONAL_HISTORY[NATIONAL_HISTORY.length - 7 + i];
                  const delta = prev ? h.planted - prev.planted : 0;
                  return (
                    <div key={h.year} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.03)", padding: "3px 0" }}>
                      <span>{h.year}</span>
                      <span>{h.planted}M</span>
                      <span style={{ color: delta > 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
 {delta > 0 ? " -- " : " -- "} {Math.abs(delta).toFixed(1)}M
                      </span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #fbbf24", padding: "6px 0", color: "#fbbf24", fontWeight: 700 }}>
 <span>2026 -> </span>
                  <span>{acreageModel.totalPlanted}M</span>
 <span> -- {(98.8 - acreageModel.totalPlanted).toFixed(1)}M</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 6 }}>
 Pattern since 2020: UP/UP/DOWN/UP/DOWN/UP -> 2026 is DOWN year. But bridge payments ($44/ac) + OBBBA reference price hikes blunt the decline vs pure economics.
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>Production History + 2026</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={historyWithProjection} margin={{ top: 8, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <Tooltip contentStyle={{ background: "#1a1f2e", border: "1px solid #2d3748", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="production" name="Production (B)" radius={[3,3,0,0]}>
                    {historyWithProjection.map((d, i) => <Cell key={i} fill={d.type === "projected" ? "#fbbf24" : "#60a5fa"} fillOpacity={d.type === "projected" ? 1 : 0.6} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#c8d6e5" }}>Bridge Payment Impact on 2026 Decisions</h3>
              <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.7 }}>
                <div style={{ padding: 8, background: "rgba(251,191,36,0.05)", borderRadius: 6, marginBottom: 8, border: "1px solid rgba(251,191,36,0.1)" }}>
                  <strong style={{ color: "#fbbf24" }}>FBA: $44.36/ac corn vs $30.88/ac beans</strong><br/>
                  On 1,000 corn acres = $44,360 payment (Feb 28 delivery)
                </div>
                <div style={{ padding: 8, background: "rgba(96,165,250,0.05)", borderRadius: 6, marginBottom: 8, border: "1px solid rgba(96,165,250,0.1)" }}>
                  <strong style={{ color: "#60a5fa" }}>OBBBA Reference Price Hikes (crop yr 2026):</strong><br/>
 Corn ref price up 10-21% -> stronger PLC payments<br/>
                  30M+ new base acres eligible for ARC/PLC<br/>
                  Crop insurance subsidies up to 80% for SCO/ECO
                </div>
                <div style={{ padding: 8, background: "rgba(34,197,94,0.05)", borderRadius: 6, border: "1px solid rgba(34,197,94,0.1)" }}>
                  <strong style={{ color: "#22c55e" }}>Irwin (Feb '26):</strong> "Bridge payments have backfilled corn losses... I think we'll plant at least 95-96M acres." Brown (FAPRI): "Per-acre payment rates favor corn... those backstops support willingness to stick with corn."
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== SOURCES TAB ====== */}
        {activeTab === "sources" && (
          <div style={{ maxWidth: 900 }}>
            <div style={{ background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#fbbf24" }}>Data Sources & References</h3>
              <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 16px" }}>All data sourced through Feb 18, 2026. Click any link to view the original source.</p>

              {[
                {
                  category: "USDA Official Reports (Acres, Yields, Production)",
                  color: "#fbbf24",
                  sources: [
                    { title: "USDA WASDE -- Feb 11, 2026 (World Agricultural Supply & Demand Estimates)", url: "https://www.usda.gov/oce/commodity/wasde" },
                    { title: "NASS: Crop Production 2025 Summary (Jan 10, 2026) -- Final 2025: corn 98.8M planted/91.3M harvested/186.5 bpa/17.02B bu; soy 81.2M/80.2M/53.0 bpa", url: "https://release.nass.usda.gov/reports/cropan26.pdf" },
                    { title: "NASS: Crop Production 2024 Summary (Jan 10, 2025) -- Final 2024: corn 90.7M/183.1 bpa, soy 87.1M/50.7 bpa", url: "https://release.nass.usda.gov/reports/cropan25.pdf" },
                    { title: "NASS: Acreage Report (Jun 30, 2025) -- Initial 2025 estimates: 95.2M corn, 83.4M soy", url: "https://www.nass.usda.gov/Newsroom/2025/06-30-2025.php" },
                    { title: "NASS: Crop Production (Sep 12, 2025) -- Revised 2025: corn 98.7M planted, soy 81.1M", url: "https://release.nass.usda.gov/reports/crop0925.pdf" },
                    { title: "NASS Quick Stats -- Interactive database for all historical planted acres, yields, production", url: "https://quickstats.nass.usda.gov/" },
                    { title: "NASS: Charts & Maps -- Corn planted acreage by year", url: "https://www.nass.usda.gov/Charts_and_Maps/Field_Crops/cornac.php" },
                    { title: "NASS: Charts & Maps -- Soybean planted acreage by year", url: "https://www.nass.usda.gov/Charts_and_Maps/Field_Crops/soyac.php" },
                    { title: "NASS: Charts & Maps -- Corn yield by year (official yield time series)", url: "https://www.nass.usda.gov/Charts_and_Maps/Field_Crops/cornyld.php" },
                    { title: "USDA Agricultural Projections to 2034 (Feb 2025 Baseline) -- 95M corn baseline for 2026", url: "https://www.usda.gov/sites/default/files/documents/USDA-Agricultural-Projections-to-2034.pdf" },
                    { title: "USDA 2026 Baseline Acreage -- Early Release Dec 2025 (95M corn acres projected)", url: "https://southeastagnet.com/2025/12/12/usda-2026-baseline-acreage-estimates-early-release/" },
                    { title: "USDA Grains & Oilseeds Outlook -- Feb 2025 Ag Forum (94M planted, 181 bpa weather-adjusted trend)", url: "https://www.usda.gov/sites/default/files/documents/2025AOF-grains-oilseeds-outlook.pdf" },
                  ]
                },
                {
                  category: "Harvested/Planted Ratio Analysis",
                  color: "#ef4444",
                  sources: [
                    { title: "DTN: U.S. Corn Harvested/Planted Ratio -- Aug 21, 2025 (25yr avg 91.1%, state-level analysis)", url: "https://www.dtnpf.com/agriculture/web/ag/blogs/fundamentally-speaking/blog-post/2025/08/21/u-s-corn-harvestedplanted-ratio" },
                    { title: "DTN: Record US Corn Crop Based on Yield, Acreage -- Feb 3, 2026 (final 2025 H/P ratio 92.3%, highest since 2007)", url: "https://www.dtnpf.com/agriculture/web/ag/blogs/fundamentally-speaking/blog-post/2026/02/03/record-us-corn-crop-based-yield" },
                    { title: "DTN: Unprecedented Increase in US Corn Planted & Harvested Area -- Sep 18, 2025", url: "https://www.dtnpf.com/agriculture/web/ag/blogs/fundamentally-speaking/blog-post/2025/09/18/unprecedented-increase-u-s-corn-area-2" },
                    { title: "farmdoc: Yes, There Are a Lot of Corn Acres -- FSA Acreage Data -- Aug 18, 2025", url: "https://farmdocdaily.illinois.edu/2025/08/yes-there-are-a-lot-of-corn-acres-evidence-from-fsa-acreage-data.html" },
                  ]
                },
                {
                  category: "Crop Insurance Projected & Harvest Prices (USDA RMA)",
                  color: "#60a5fa",
                  sources: [
                    { title: "RMA Price Discovery Portal -- Live & historical projected/harvest prices for all crops", url: "https://prodwebnlb.rma.usda.gov/apps/PriceDiscovery" },
                    { title: "RMA Bulletin PM-26-008: 2026 CY Projected Prices (Jan 1-31, 2026 discovery period)", url: "https://www.rma.usda.gov/policy-procedure/bulletins-memos/product-management-bulletin/pm-26-008-2026-crop-year-common-crop" },
                    { title: "RMA Bulletin PM-26-010: 2026 CY Projected Prices (Jan 15 - Feb 14, 2026 discovery)", url: "https://www.rma.usda.gov/policy-procedure/bulletins-memos/product-management-bulletin/pm-26-010-2026-crop-year-common-crop" },
                    { title: "RMA Corn Insurance page -- All bulletins, actuarial data, price announcements", url: "https://www.rma.usda.gov/taxonomy/term/71" },
                    { title: "farmdoc daily: Crop Insurance Decisions for 2025 (Mar 5, 2025) -- Historical proj prices, RP examples", url: "https://farmdocdaily.illinois.edu/2025/03/crop-insurance-decisions-for-2025.html" },
                    { title: "farmdoc daily: 2025 Crop Insurance Harvest Prices (Nov 5, 2025) -- Corn $4.22, Soy $10.36", url: "https://farmdocdaily.illinois.edu/2025/11/2025-crop-insurance-harvest-prices-for-corn-and-soybeans.html" },
                    { title: "DTN: Revenue Protection Sticks With Spring Guarantees (Oct 31, 2025) -- Full proj/harvest price table 2013-2025", url: "https://www.dtnpf.com/agriculture/web/ag/news/business-inputs/article/2025/10/31/crop-insurance-protection-sticks-4" },
                    { title: "DTN: Spring Prices Settle at $4.66 Corn, $11.55 Soy (Feb 29, 2024)", url: "https://www.dtnpf.com/agriculture/web/ag/news/business-inputs/article/2024/02/29/spring-crop-insurance-projected-4-66" },
                    { title: "AFBF Market Intel: Reviewing 2025 Crop Insurance Price Discovery (Jan 2026)", url: "https://www.fb.org/market-intel/reviewing-2025-crop-insurance-price-discovery" },
                    { title: "FCS America: Historical Crop Price Charts (projected & harvest, 2014-2025)", url: "https://www.fcsamerica.com/insurance/resources/crop-price-history" },
                    { title: "FCS America: Crop Insurance Prices -- Live 2026 Feb discovery tracker", url: "https://www.fcsamerica.com/insurance/resources/crop-insurance-prices" },
                  ]
                },
                {
                  category: "ISU Crop Budgets & Cost of Production",
                  color: "#22c55e",
                  sources: [
                    { title: "ISU: Estimated Costs of Crop Production in Iowa 2026 (FM 1712, Jan 2026) -- Full PDF", url: "https://www.extension.iastate.edu/agdm/crops/pdf/a1-20.pdf" },
                    { title: "ISU Ag Decision Maker: Costs & Returns landing page (all years 2015-2026)", url: "https://www.extension.iastate.edu/agdm/crops/html/a1-20.html" },
                    { title: "ISU: 2026 Cost Implications for Corn & Soy Producers (Hart, Jan 2026)", url: "https://www.extension.iastate.edu/agdm/articles/hart/HarJan26b.html" },
                    { title: "ISU News: 2026 Iowa Crop Costs Increase -- Corn +4%, Soy +2% (Jan 29, 2026)", url: "https://www.extension.iastate.edu/news/2026-iowa-crop-production-costs-increase-limiting-profit-opportunities-corn-and-soybean-farmers" },
                    { title: "ISU Ag Decision Maker: All crop budget tools & calculators", url: "https://www.extension.iastate.edu/agdm/cdcostsreturns.html" },
                    { title: "USDA ERS: Commodity Costs & Returns -- National-level cost benchmarks", url: "https://www.ers.usda.gov/data-products/commodity-costs-and-returns/" },
                    { title: "NCGA Q1 2026: $917/ac corn cost, $0.88/bu loss, 4th consecutive year of worsening losses", url: "https://www.ncga.com/stay-informed/media/the-corn-economy/article/2026/01/economic-outlook-2026-q1" },
                    { title: "farmdoc: 2026 Illinois Crop Budgets -- Aug 2025 (negative returns 4th straight year, breakeven $4.66-$4.94)", url: "https://farmdocdaily.illinois.edu/2025/08/2026-illinois-crop-budgets.html" },
                    { title: "FarmWeek: farmdoc 2026 Budget Estimates (corn returns -$72 to -$111/ac, soybeans -$8 to +$18/ac)", url: "https://www.farmweeknow.com/profitability/farmdoc-publishes-first-2026-crop-budget-estimates/article_187ecec2-c843-4df3-a72f-4efc1207b6f6.html" },
                  ]
                },
                {
                  category: "Insurance Premiums & Policy Analysis",
                  color: "#a78bfa",
                  sources: [
                    { title: "Southern Ag Today: Do Futures Rise or Fall During Feb Discovery? (Smith, Feb 2023)", url: "https://southernagtoday.org/2023/02/do-corn-and-soybean-harvest-futures-rise-or-fall-during-the-february-projected-crop-insurance-price-determination-period/" },
                  ]
                },
                {
                  category: "Industry 2026/27 Projections",
                  color: "#8b5cf6",
                  sources: [
                    { title: "Pro Farmer / Irwin: Bridge Payments and Big Yields Will Tilt 2026 to Corn -- Feb 7, 2026 (95-96M acres, 185-186 bpa)", url: "https://www.profarmer.com/news/agriculture-news/bridge-payments-and-big-yields-will-tilt-2026-corn" },
                    { title: "Farm Progress / Advance Trading: Corn Supply Forecast Hits Record -- Dec 15, 2025 (94.5M, 184 bpa, 15.91B)", url: "https://www.farmprogress.com/commentary/what-do-fewer-corn-acres-and-higher-ending-stocks-lead-to-" },
                    { title: "Farm Progress / Texas A&M: Corn Acres Surge in 2025 -- Feb 2026 (95M, 183 bpa trendline)", url: "https://www.farmprogress.com/corn/corn-acres-surge-in-2025-but-will-2026-bring-a-market-correction-" },
                    { title: "NCGA Economic Outlook Q1 2026 (95M USDA baseline, alternating pattern, bridge payment analysis)", url: "https://www.ncga.com/stay-informed/media/the-corn-economy/article/2026/01/economic-outlook-2026-q1" },
                    { title: "AgWeb / FAPRI Baseline Update (corn avg $4.12, 95M acres, 5yr projection)", url: "https://www.agweb.com/news/crops/corn/fapri-updates-ag-baseline-projecting-prices-remain-near-current-levels-over-next-5-" },
                  ]
                },
                {
                  category: "Bridge Payments & OBBBA Farm Policy",
                  color: "#f97316",
                  sources: [
                    { title: "USDA: Trump Admin Announces $12B Farmer Bridge Payments -- Dec 8, 2025", url: "https://www.usda.gov/about-usda/news/press-releases/2025/12/08/trump-administration-announces-12-billion-farmer-bridge-payments-american-farmers-impacted-unfair" },
                    { title: "USDA: FBA Payment Rates -- Dec 31, 2025 (Corn $44.36/ac, Soy $30.88/ac, Wheat $39.35/ac)", url: "https://www.usda.gov/about-usda/news/press-releases/2025/12/31/usda-announces-commodity-payment-rates-farmer-bridge-assistance-program" },
                    { title: "FSA: Farmer Bridge Assistance Program Details (eligibility, payment limits, acreage rules)", url: "https://www.fsa.usda.gov/resources/programs/farmer-bridge-assistance-fba-program" },
                    { title: "AFBF Market Intel: FBA Program Details on $11 Billion in Aid (state-level payment projections)", url: "https://www.fb.org/market-intel/farmer-bridge-assistance-program-details-on-11-billion-in-aid" },
                    { title: "farmdoc: FBA Payment Rates Analysis -- Jan 6, 2026 (avg IL farm ~$56K in FBA support)", url: "https://farmdocdaily.illinois.edu/2026/01/farmer-bridge-assistance-program-payment-rates.html" },
                    { title: "USDA Farmers First Page (OBBBA provisions, E15, trade deals, reference price hikes)", url: "https://www.usda.gov/farmers-first" },
                  ]
                },
                {
                  category: "Balance Sheet -- Export Demand",
                  color: "#06b6d4",
                  sources: [
                    { title: "USDA FAS: Export Sales Weekly Report -- Corn cumulative commitments & weekly pace", url: "https://apps.fas.usda.gov/export-sales/esrd1.html" },
                    { title: "USDA FAS: GATS -- Global Agricultural Trade System (bilateral trade data by destination)", url: "https://apps.fas.usda.gov/gats/default.aspx" },
                    { title: "USDA FAS: Grain -- World Markets and Trade (quarterly; competitor production & exports)", url: "https://fas.usda.gov/data/grain-world-markets-and-trade" },
                    { title: "CONAB: Acompanhamento da Safra Brasileira -- Graos (Brazil corn 2nd crop estimates)", url: "https://www.conab.gov.br/info-agro/safras/graos" },
                    { title: "USDA FAS: Argentina Grain & Feed Annual (Buenos Aires GAIN Report, export tax policy)", url: "https://fas.usda.gov/regions/argentina" },
                    { title: "USDA FAS: Ukraine Grain & Feed Annual (GAIN Report, Black Sea export conditions)", url: "https://fas.usda.gov/regions/ukraine" },
                    { title: "IGC: Grain Market Report -- International Grains Council (global trade flows, FOB prices)", url: "https://www.igc.int/en/markets/marketinfo-sd.aspx" },
                    { title: "Federal Reserve: DXY Dollar Index -- Trade-weighted (FRED series DTWEXBGS)", url: "https://fred.stlouisfed.org/series/DTWEXBGS" },
                  ]
                },
                {
                  category: "Balance Sheet -- Ethanol Demand & Policy",
                  color: "#eab308",
                  sources: [
                    { title: "EIA: Weekly Ethanol Production & Stocks (PSW report, Table 10)", url: "https://www.eia.gov/petroleum/supply/weekly/" },
                    { title: "EIA: Monthly Energy Review -- Fuel ethanol overview (Table 10.3)", url: "https://www.eia.gov/totalenergy/data/monthly/#renewable" },
                    { title: "EIA: Short-Term Energy Outlook -- Motor gasoline consumption forecast", url: "https://www.eia.gov/outlooks/steo/" },
                    { title: "EPA: Renewable Fuel Standard Program -- Annual RVO volumes & compliance", url: "https://www.epa.gov/renewable-fuel-standard-program" },
                    { title: "Renewable Fuels Association: Monthly Ethanol Statistics (production, stocks, trade)", url: "https://ethanolrfa.org/markets-and-statistics/monthly-ethanol-statistics" },
                    { title: "USDA Farmers First: OBBBA provisions including 45Z/ILUC harmonization for corn ethanol", url: "https://www.usda.gov/farmers-first" },
                  ]
                },
                {
                  category: "Balance Sheet -- Feed & Residual Demand",
                  color: "#84cc16",
                  sources: [
                    { title: "USDA NASS: Grain Stocks Report (quarterly -- Sep 1, Dec 1, Mar 1, Jun 1 positions)", url: "https://usda.library.cornell.edu/concern/publications/xg94hp534" },
                    { title: "USDA ERS: Livestock, Dairy, and Poultry Outlook (monthly; cattle/hog/poultry production forecasts)", url: "https://www.ers.usda.gov/publications/pub-details/?pubid=100522" },
                    { title: "USDA ERS: Feed Outlook (quarterly; corn feed & residual calculations, price spreads)", url: "https://www.ers.usda.gov/publications/pub-details/?pubid=100526" },
                    { title: "USDA NASS: Cattle on Feed Report (monthly; placements, marketings, on-feed inventory)", url: "https://usda.library.cornell.edu/concern/publications/m326m174z" },
                    { title: "USDA NASS: Cattle Inventory Report (Jan/Jul; herd rebuild tracking)", url: "https://usda.library.cornell.edu/concern/publications/h702q636h" },
                    { title: "USDA NASS: Hogs and Pigs Report (quarterly; inventory, farrowing intentions)", url: "https://usda.library.cornell.edu/concern/publications/rj430453j" },
                    { title: "USDA APHIS: HPAI Confirmed Detections -- Bird flu tracking for poultry impact", url: "https://www.aphis.usda.gov/livestock-poultry-disease/avian/avian-influenza/hpai-detections" },
                  ]
                },
                {
                  category: "Yield Methodology & Trend Analysis",
                  color: "#14b8a6",
                  sources: [
                    { title: "farmdoc: Estimates of Corn Production and Yields Based on Crop Conditions (Bain-Fortenbery model)", url: "https://farmdocdaily.illinois.edu/wp-content/uploads/2024/07/fdd070824.pdf" },
                    { title: "farmdoc: Trend Yield Models for US Corn (Irwin/Good methodology, 1988-present OLS)", url: "https://farmdocdaily.illinois.edu/2023/03/2023-corn-and-soybean-budgets-and-return-outlook.html" },
                    { title: "NOAA CPC: ENSO Diagnostic Discussion -- La Nina/El Nino forecast & historical corn yield impacts", url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml" },
                  ]
                },
                {
                  category: "Jan WASDE & Market Reaction",
                  color: "#64748b",
                  sources: [
                    { title: "DTN: USDA Raises 2025 Corn Production to More Than 17 BB -- Jan 12, 2026", url: "https://www.dtnpf.com/agriculture/web/ag/columns/washington-insider/article/2026/01/12/usda-raises-2025-corn-production-17" },
                    { title: "DTN: USDA to Set the Stage for 2026 -- Jan 8, 2026 (pre-report analysis)", url: "https://www.dtnpf.com/agriculture/web/ag/columns/washington-insider/article/2026/01/08/usda-set-stage-2026-series-reports" },
                    { title: "Farm Policy News / U of I: USDA Says 2025 Corn Hit 17B Bu -- Jan 2026 (price implications)", url: "https://farmpolicynews.illinois.edu/2026/01/usda-says-2025-corn-production-hit-17-billion-bushels-likely-to-keep-prices-low/" },
                  ]
                },
                {
                  category: "Harvest Progress & Crop Conditions",
                  color: "#6b7280",
                  sources: [
                    { title: "Brownfield: 96% of U.S. Corn Harvested -- Nov 24, 2025 (final crop progress)", url: "https://www.brownfieldagnews.com/news/96-of-u-s-corn-harvested-soybean-harvest-officially-complete/" },
                    { title: "DTN: Corn 91% Harvested -- Nov 18, 2025 (post-shutdown crop progress resume)", url: "https://www.dtnpf.com/agriculture/web/ag/news/article/2025/11/18/usda-crop-progress-corn-91-harvested" },
                  ]
                },
                {
                  category: "Acreage Decision Methodology Notes",
                  color: "#9ca3af",
                  sources: [
                    { title: "Soy/Corn Ratio = Nov soy Feb projected price / Dec corn Feb projected price (same prices RMA uses for crop insurance)" },
                    { title: "85% RP Guarantee = Projected price x National avg yield x 0.85 coverage level (proxy for typical enterprise unit)" },
                    { title: "Margin = (Feb projected price x National yield) - ISU total cost per acre (includes all variable + fixed + land)" },
                    { title: "ISU budget insurance premiums: 80% RP, enterprise units, central Iowa typical farm (from FM 1712 publication)" },
                    { title: "2026e planted acres: midpoint of USDA Baseline (95M corn) and industry consensus range (93-96M corn, 84-87M soy)" },
                    { title: "2026e Feb projected prices: month-to-date Feb 2026 averages of Dec 26 corn & Nov 26 soy CBOT daily settlements (~Feb 14)" },
                    { title: "Balance sheet: WASDE methodology. Begin stocks = prior yr ending. FSI = 1.42B (WASDE). Imports = 0.025B. Price est from S/U regression (1990-2025)." },
                    { title: "Yield trend: 1988-2025 OLS with 2.0 bpa/yr growth rate, weather scenarios weighted by climatological probabilities, -0.5 bpa stochastic adjustment per USDA/farmdoc methodology." },
                  ]
                },
              ].map((cat, ci) => (
                <div key={ci} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: cat.color, marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${cat.color}33` }}>{cat.category}</div>
                  {cat.sources.map((s, si) => (
                    s.url ? (
                    <a key={si} href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "block", padding: "8px 12px", marginBottom: 4, fontSize: 11, color: "#93c5fd", textDecoration: "none", background: "rgba(255,255,255,0.015)", borderRadius: 5, border: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", lineHeight: 1.4, transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(96,165,250,0.08)"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.015)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; }}>
                      {s.title}
                      <div style={{ fontSize: 9, color: "#4b5563", marginTop: 2, wordBreak: "break-all" }}>{s.url}</div>
                    </a>
                    ) : (
                    <div key={si} style={{ padding: "6px 12px", marginBottom: 3, fontSize: 10, color: "#9ca3af", borderLeft: `2px solid ${cat.color}33` }}>{s.title}</div>
                    )
                  ))}
                </div>
              ))}

              <div style={{ marginTop: 20, padding: 12, background: "rgba(251,191,36,0.04)", borderRadius: 6, border: "1px solid rgba(251,191,36,0.1)", fontSize: 10, color: "#6b7280", lineHeight: 1.5 }}>
                <strong style={{ color: "#fbbf24" }}>Source Quality Note:</strong> All data sourced from official government publications (USDA NASS, ERS, FAS, RMA, APHIS; EIA; EPA; NOAA; Federal Reserve), land-grant university research (Iowa State Ag Decision Maker, University of Illinois farmdoc), recognized industry organizations (NCGA, AFBF, RFA), and established agricultural media (DTN Progressive Farmer, Farm Progress, Pro Farmer, Brownfield Ag News). Competitor production data from official foreign sources (CONAB for Brazil, USDA FAS GAIN Reports for Argentina/Ukraine). No proprietary models or unverifiable sources used. All URLs verified as of Feb 18, 2026.
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 24, padding: 12, background: "rgba(255,255,255,0.015)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.03)", fontSize: 10, color: "#4b5563", lineHeight: 1.5 }}>
          <strong style={{ color: "#6b7280" }}>v2.0 Corrections:</strong> Harvested/Planted ratio now uses actual historical data (25yr avg 91.1%, not assumed 92.5%). 2025 final: 98.788M planted / 91.258M harvested = 92.3% (highest since 2007, per DTN). Added bridge payment effects ($44.36/ac corn, OBBBA ref price hikes). Industry projections from USDA Baseline (Dec '25), Advance Trading (Dec '25), Irwin/U of I (Feb '26 Pro Farmer interview), Texas A&M (Feb '26 outlook), FAPRI/Brown (Feb '26), NCGA Q1 2026 Outlook.
        </div>
      </div>
    </div>
  );
}
