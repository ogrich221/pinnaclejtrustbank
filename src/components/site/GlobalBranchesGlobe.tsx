import React, { useEffect, useRef, useState, useMemo } from "react";
import { Globe as GlobeIcon, MapPin, Building2, Clock, CheckCircle2, RotateCw, Pause, Play, Compass, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface BranchLocation {
  id: string;
  city: string;
  country: string;
  region: "Americas" | "Europe" | "Asia-Pacific" | "Middle East";
  lat: number;
  lng: number;
  timezone: string;
  address: string;
  division: string;
  clearanceCode: string;
  features: string[];
}

export const BRANCH_LOCATIONS: BranchLocation[] = [
  {
    id: "new-york",
    city: "New York",
    country: "United States",
    region: "Americas",
    lat: 40.7128,
    lng: -74.006,
    timezone: "America/New_York",
    address: "28 Wall Street, Financial District, New York, NY 10005",
    division: "Americas Regional HQ & Capital Markets",
    clearanceCode: "PJTB-US-NYC",
    features: ["Private Wealth Custody", "Cross-Border Clearing", "Treasury Services"],
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    lat: 51.5074,
    lng: -0.1278,
    timezone: "Europe/London",
    address: "100 Bishopsgate, City of London, EC2N 4AG",
    division: "European Commercial & Trust Operations",
    clearanceCode: "PJTB-GB-LON",
    features: ["Foreign Exchange Desk", "Syndicated Lending", "Family Office Trust"],
  },
  {
    id: "zurich",
    city: "Zurich",
    country: "Switzerland",
    region: "Europe",
    lat: 47.3769,
    lng: 8.5417,
    timezone: "Europe/Zurich",
    address: "Paradeplatz 8, 8001 Zürich",
    division: "Global Private Banking & Asset Preservation",
    clearanceCode: "PJTB-CH-ZRH",
    features: ["Swiss Vault Depository", "Discretionary Portfolios", "Multi-Currency Escrow"],
  },
  {
    id: "frankfurt",
    city: "Frankfurt",
    country: "Germany",
    region: "Europe",
    lat: 50.1109,
    lng: 8.6821,
    timezone: "Europe/Berlin",
    address: "Taunusanlage 12, 60325 Frankfurt am Main",
    division: "Continental European Clearing Branch",
    clearanceCode: "PJTB-DE-FRA",
    features: ["TARGET2 Settlement", "Institutional Liquidity", "Corporate Trade Finance"],
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    region: "Europe",
    lat: 48.8566,
    lng: 2.3522,
    timezone: "Europe/Paris",
    address: "15 Place Vendôme, 75001 Paris",
    division: "European Luxury & Corporate Advisory",
    clearanceCode: "PJTB-FR-PAR",
    features: ["Bespoke Financing", "Structured Trade", "Commercial Credit"],
  },
  {
    id: "luxembourg",
    city: "Luxembourg City",
    country: "Luxembourg",
    region: "Europe",
    lat: 49.6116,
    lng: 6.1319,
    timezone: "Europe/Luxembourg",
    address: "42 Boulevard Royal, 2449 Luxembourg",
    division: "International Fund Administration",
    clearanceCode: "PJTB-LU-LUX",
    features: ["UCITS Structuring", "Global Custody Services", "Tax-Efficient Pooling"],
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    lat: 25.2048,
    lng: 55.2708,
    timezone: "Asia/Dubai",
    address: "DIFC Gate Precinct 4, Level 9, Dubai",
    division: "Middle East & Gulf Capital Center",
    clearanceCode: "PJTB-AE-DXB",
    features: ["Sukuk & Islamic Finance", "Sovereign Advisory", "Real Estate Capital"],
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    region: "Asia-Pacific",
    lat: 1.3521,
    lng: 103.8198,
    timezone: "Asia/Singapore",
    address: "Marina Bay Financial Centre, Tower 2, Singapore 018983",
    division: "Asia-Pacific Regional Headquarters",
    clearanceCode: "PJTB-SG-SIN",
    features: ["Asian Currency Unit (ACU)", "Fintech Gateway", "Commodity Settlement"],
  },
  {
    id: "hong-kong",
    city: "Hong Kong",
    country: "Hong Kong",
    region: "Asia-Pacific",
    lat: 22.3193,
    lng: 114.1694,
    timezone: "Asia/Hong_Kong",
    address: "Two International Finance Centre, Central, Hong Kong",
    division: "Greater Bay & International Markets",
    clearanceCode: "PJTB-HK-HKG",
    features: ["Offshore RMB Clearing", "Equity Underwriting", "Securities Custody"],
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    region: "Asia-Pacific",
    lat: 35.6762,
    lng: 139.6503,
    timezone: "Asia/Tokyo",
    address: "Marunouchi Park Building, Chiyoda-ku, Tokyo 100-0005",
    division: "East Asia Institutional Division",
    clearanceCode: "PJTB-JP-TYO",
    features: ["Yen Clearing Desk", "Cross-Border M&A", "Government Bond Trading"],
  },
  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    region: "Asia-Pacific",
    lat: -33.8688,
    lng: 151.2093,
    timezone: "Australia/Sydney",
    address: "1 Martin Place, Sydney NSW 2000",
    division: "Oceania & Pacific Corporate Office",
    clearanceCode: "PJTB-AU-SYD",
    features: ["Natural Resources Finance", "Superannuation Advisory", "Syndication"],
  },
  {
    id: "toronto",
    city: "Toronto",
    country: "Canada",
    region: "Americas",
    lat: 43.6532,
    lng: -79.3832,
    timezone: "America/Toronto",
    address: "Bay Adelaide Centre, 333 Bay Street, Toronto, ON M5H 2R2",
    division: "North American Cross-Border Trust",
    clearanceCode: "PJTB-CA-TOR",
    features: ["Cross-Border Commercial", "Infrastructure Debt", "Institutional Cash"],
  },
];

// Simplified outline polygons for world landmasses for the 3D globe canvas
const CONTINENTS_DATA: [number, number][][] = [
  // North America
  [
    [70, -165], [72, -130], [60, -140], [55, -130], [48, -125], [37, -122], [32, -117],
    [23, -110], [18, -105], [15, -92], [20, -87], [29, -82], [25, -80], [35, -75],
    [45, -65], [52, -55], [60, -64], [62, -75], [55, -82], [65, -90], [70, -95], [72, -125]
  ],
  // South America
  [
    [10, -75], [5, -77], [-5, -80], [-18, -70], [-35, -72], [-52, -70], [-55, -65],
    [-45, -65], [-35, -57], [-23, -43], [-10, -36], [-5, -35], [5, -52], [10, -62], [10, -75]
  ],
  // Europe
  [
    [71, 28], [60, 30], [55, 21], [54, 14], [52, 5], [48, -4], [43, -9], [37, -9],
    [36, -5], [38, 0], [43, 3], [44, 8], [40, 18], [37, 24], [41, 29], [46, 30],
    [55, 37], [60, 40], [68, 44], [70, 30]
  ],
  // UK
  [
    [58, -5], [54, -3], [51, 1], [50, -5], [55, -6], [58, -5]
  ],
  // Asia
  [
    [70, 44], [68, 70], [72, 100], [75, 130], [65, 170], [60, 160], [50, 140], [40, 130],
    [30, 122], [22, 115], [10, 105], [1, 104], [10, 99], [22, 90], [20, 80], [8, 77],
    [22, 70], [25, 60], [30, 50], [40, 50], [55, 60], [60, 50], [70, 44]
  ],
  // Middle East / Arabia
  [
    [31, 35], [30, 48], [24, 57], [15, 54], [12, 45], [20, 40], [28, 34], [31, 35]
  ],
  // Africa outline (geographical continent reference on globe)
  [
    [35, -5], [37, 10], [32, 25], [30, 32], [12, 44], [5, 48], [-5, 40], [-25, 33],
    [-34, 18], [-33, 27], [-20, 12], [0, 9], [5, 1], [5, -10], [15, -17], [25, -15], [35, -5]
  ],
  // Australia
  [
    [-12, 130], [-15, 136], [-12, 142], [-20, 148], [-32, 153], [-38, 145], [-35, 135],
    [-35, 117], [-22, 114], [-15, 124], [-12, 130]
  ],
  // Japan
  [
    [45, 142], [38, 141], [33, 132], [35, 135], [43, 145], [45, 142]
  ]
];

export function GlobalBranchesGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Globe rotation states
  const [rotationLng, setRotationLng] = useState(20);
  const [tiltLat, setTiltLat] = useState(15);
  const [isRotating, setIsRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; rot: number; tilt: number }>({ x: 0, y: 0, rot: 0, tilt: 0 });
  const [activeBranchId, setActiveBranchId] = useState<string>("new-york");
  const [hoveredBranchId, setHoveredBranchId] = useState<string | null>(null);

  // Real-time branch clocks
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeBranch = useMemo(() => {
    return BRANCH_LOCATIONS.find((b) => b.id === activeBranchId) || BRANCH_LOCATIONS[0];
  }, [activeBranchId]);

  // Target rotation animation for smooth centering when clicking a branch
  const targetRotationRef = useRef<number | null>(null);

  const focusBranch = (branch: BranchLocation) => {
    setActiveBranchId(branch.id);
    // Center the branch on the globe: longitude should face camera (0 angle offset)
    let target = branch.lng;
    while (target - rotationLng > 180) target -= 360;
    while (target - rotationLng < -180) target += 360;
    targetRotationRef.current = target;
    setTiltLat(Math.max(-20, Math.min(30, branch.lat * 0.4)));
  };

  // Continuous animation loop for globe rendering & blinking points
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Handle smooth centering if target rotation exists
      if (targetRotationRef.current !== null) {
        setRotationLng((prev) => {
          const target = targetRotationRef.current!;
          const diff = target - prev;
          if (Math.abs(diff) < 0.2) {
            targetRotationRef.current = null;
            return target;
          }
          return prev + diff * 0.08;
        });
      } else if (isRotating && !isDragging) {
        setRotationLng((prev) => (prev + 9 * dt) % 360);
      }

      drawGlobe(time / 1000);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isRotating, isDragging, rotationLng, tiltLat, activeBranchId, hoveredBranchId]);

  // 3D Spherical projection helper
  const project3D = (lat: number, lng: number, rotLng: number, tLat: number, radius: number, cx: number, cy: number) => {
    const phi = (lat * Math.PI) / 180;
    const theta = ((lng - rotLng) * Math.PI) / 180;
    const tilt = (tLat * Math.PI) / 180;

    // Standard 3D spherical coordinates
    // X axis: right
    const x = radius * Math.cos(phi) * Math.sin(theta);
    // Y axis: up/down with tilt
    const y = -radius * (Math.sin(phi) * Math.cos(tilt) - Math.cos(phi) * Math.cos(theta) * Math.sin(tilt));
    // Z axis: depth toward viewer (positive is visible hemisphere)
    const z = radius * (Math.sin(phi) * Math.sin(tilt) + Math.cos(phi) * Math.cos(theta) * Math.cos(tilt));

    return {
      x: cx + x,
      y: cy + y,
      z,
      visible: z > 0,
    };
  };

  const drawGlobe = (sec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;

    // 1. FLOOR REFLECTION & AMBIENT SHADOW
    const floorY = cy + radius * 0.98;
    const shadowGrad = ctx.createRadialGradient(cx, floorY, 10, cx, floorY, radius * 1.15);
    shadowGrad.addColorStop(0, "rgba(212, 175, 55, 0.28)");
    shadowGrad.addColorStop(0.35, "rgba(10, 25, 47, 0.6)");
    shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(cx, floorY, radius * 0.95, radius * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. ATMOSPHERIC OUTER GLOW (Deep blue & gold reflection)
    const atmoGrad = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.25);
    atmoGrad.addColorStop(0, "rgba(212, 175, 55, 0.25)");
    atmoGrad.addColorStop(0.4, "rgba(30, 60, 110, 0.3)");
    atmoGrad.addColorStop(0.85, "rgba(15, 23, 42, 0.15)");
    atmoGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    // 3. GLOBE OCEAN BASE (Rich illuminated deep navy sphere)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Primary sphere shading with light coming from top-left (specular base)
    const oceanGrad = ctx.createRadialGradient(
      cx - radius * 0.35,
      cy - radius * 0.35,
      radius * 0.05,
      cx,
      cy,
      radius * 1.05
    );
    oceanGrad.addColorStop(0, "#19355E"); // illuminated ocean
    oceanGrad.addColorStop(0.3, "#0E2140"); // rich midnight navy
    oceanGrad.addColorStop(0.75, "#081326"); // deep abyss
    oceanGrad.addColorStop(1, "#030811"); // shadow rim
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // 4. 3D GRATICULE LINES (Latitude parallels & Longitude meridians)
    ctx.strokeStyle = "rgba(212, 175, 55, 0.16)"; // subtle gold grid
    ctx.lineWidth = 1;

    // Latitudes (-60° to +60°)
    for (let lat = -60; lat <= 60; lat += 20) {
      ctx.beginPath();
      let started = false;
      for (let lng = -180; lng <= 180; lng += 4) {
        const p = project3D(lat, lng, rotationLng, tiltLat, radius, cx, cy);
        if (p.visible) {
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }

    // Longitudes (every 30°)
    for (let lng = -180; lng < 180; lng += 30) {
      ctx.beginPath();
      let started = false;
      for (let lat = -80; lat <= 80; lat += 4) {
        const p = project3D(lat, lng, rotationLng, tiltLat, radius, cx, cy);
        if (p.visible) {
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }

    // 5. DRAW CONTINENTS (3D projected landmass polygons with subtle gold glow)
    CONTINENTS_DATA.forEach((poly) => {
      ctx.beginPath();
      let visiblePoints = 0;
      let first = true;

      poly.forEach(([cLat, cLng]) => {
        const p = project3D(cLat, cLng, rotationLng, tiltLat, radius, cx, cy);
        if (p.visible) {
          visiblePoints++;
          if (first) {
            ctx.moveTo(p.x, p.y);
            first = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
      });

      if (visiblePoints > 2) {
        ctx.closePath();
        ctx.fillStyle = "rgba(212, 175, 55, 0.12)"; // reflective gold land fill
        ctx.fill();
        ctx.strokeStyle = "rgba(235, 195, 90, 0.4)"; // bright gold coastline
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });

    // 6. DRAW FLIGHT/CLEARANCE ROUTES BETWEEN GLOBAL BRANCHES
    // Connecting key hub branches with arc curves
    const keyConnections: [string, string][] = [
      ["new-york", "london"],
      ["london", "zurich"],
      ["london", "frankfurt"],
      ["zurich", "dubai"],
      ["dubai", "singapore"],
      ["singapore", "hong-kong"],
      ["hong-kong", "tokyo"],
      ["singapore", "sydney"],
      ["new-york", "toronto"],
      ["frankfurt", "luxembourg"],
      ["london", "paris"],
    ];

    keyConnections.forEach(([srcId, dstId]) => {
      const b1 = BRANCH_LOCATIONS.find((b) => b.id === srcId);
      const b2 = BRANCH_LOCATIONS.find((b) => b.id === dstId);
      if (!b1 || !b2) return;

      const p1 = project3D(b1.lat, b1.lng, rotationLng, tiltLat, radius, cx, cy);
      const p2 = project3D(b2.lat, b2.lng, rotationLng, tiltLat, radius, cx, cy);

      if (p1.visible && p2.visible) {
        // Draw curved arc between branches
        ctx.beginPath();
        const midLat = (b1.lat + b2.lat) / 2 + 10;
        const midLng = (b1.lng + b2.lng) / 2;
        const pMid = project3D(midLat, midLng, rotationLng, tiltLat, radius * 1.04, cx, cy);

        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(pMid.x, pMid.y, p2.x, p2.y);
        ctx.strokeStyle = "rgba(212, 175, 55, 0.28)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 7. SPECULAR REFLECTION OVERLAY ("color of the reflecting")
    // Top-left glossy glass light reflection
    const glossGrad = ctx.createRadialGradient(
      cx - radius * 0.42,
      cy - radius * 0.42,
      radius * 0.05,
      cx - radius * 0.35,
      cy - radius * 0.35,
      radius * 0.85
    );
    glossGrad.addColorStop(0, "rgba(255, 255, 255, 0.75)"); // mirror light glare
    glossGrad.addColorStop(0.2, "rgba(244, 212, 120, 0.35)"); // warm gold light reflection
    glossGrad.addColorStop(0.55, "rgba(64, 150, 255, 0.12)"); // cool sky blue sheen
    glossGrad.addColorStop(0.9, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glossGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // Inner rim shadow for true 3D spherical depth
    const innerRimGrad = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius);
    innerRimGrad.addColorStop(0, "rgba(0,0,0,0)");
    innerRimGrad.addColorStop(0.7, "rgba(3, 8, 20, 0.3)");
    innerRimGrad.addColorStop(1, "rgba(1, 4, 10, 0.85)");
    ctx.fillStyle = innerRimGrad;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

    // End clipping mask of globe
    ctx.restore();

    // 8. GLOBE RIM LIGHTING (Crisp glowing glass border)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(212, 175, 55, 0.65)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 9. THE 12 BLINKING BRANCH LOCATIONS ("blinking 12 locations where i have branches at")
    BRANCH_LOCATIONS.forEach((b, index) => {
      const p = project3D(b.lat, b.lng, rotationLng, tiltLat, radius, cx, cy);
      if (!p.visible) return; // on hidden far side of earth

      const isCurrentActive = b.id === activeBranchId;
      const isHovered = b.id === hoveredBranchId;

      // Calculate smooth pulsing wave (blinking cycle ~1.4s per wave, staggered per branch)
      const phase = (sec * 1.2 + index * 0.18) % 1;
      const pulseRadius = 5 + phase * 22;
      const pulseAlpha = Math.max(0, 1 - phase);

      // Blinking outer ring 1
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isCurrentActive
        ? `rgba(255, 230, 120, ${pulseAlpha * 0.95})`
        : `rgba(212, 175, 55, ${pulseAlpha * 0.75})`;
      ctx.lineWidth = isCurrentActive ? 2 : 1.5;
      ctx.stroke();

      // Blinking outer ring 2 (secondary phase)
      const phase2 = (phase + 0.5) % 1;
      const pulseRadius2 = 4 + phase2 * 16;
      const pulseAlpha2 = Math.max(0, 1 - phase2);
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseRadius2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 220, 255, ${pulseAlpha2 * 0.6})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Solid central beacon dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, isCurrentActive ? 5 : 3.8, 0, Math.PI * 2);
      ctx.fillStyle = isCurrentActive ? "#FFF9D2" : "#F4C430";
      ctx.shadowColor = "#F4C430";
      ctx.shadowBlur = isCurrentActive ? 16 : 8;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // White-hot center
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      // Branch Label tag if active, hovered, or prominent
      if (isCurrentActive || isHovered) {
        ctx.save();
        const labelText = `${b.city}`;
        ctx.font = "bold 11px system-ui, sans-serif";
        const metrics = ctx.measureText(labelText);
        const tagW = metrics.width + 16;
        const tagH = 22;
        const tagX = p.x + 10;
        const tagY = p.y - 11;

        // Connecting pin line
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(tagX, tagY + 11);
        ctx.strokeStyle = "#F4C430";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tag background
        ctx.fillStyle = "rgba(10, 25, 47, 0.92)";
        ctx.strokeStyle = "rgba(212, 175, 55, 0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 4);
        ctx.fill();
        ctx.stroke();

        // Tag text
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(labelText, tagX + 8, tagY + 15);
        ctx.restore();
      }
    });

    ctx.restore();
  };

  // Mouse & Touch interaction handlers for manual globe spinning
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    targetRotationRef.current = null;
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      rot: rotationLng,
      tilt: tiltLat,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setRotationLng((dragStart.rot - dx * 0.4 + 360) % 360);
      setTiltLat(Math.max(-35, Math.min(45, dragStart.tilt + dy * 0.3)));
    } else {
      // Check if mouse is hovering over a branch
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.42;

      let found: string | null = null;
      for (const b of BRANCH_LOCATIONS) {
        const p = project3D(b.lat, b.lng, rotationLng, tiltLat, radius, cx, cy);
        if (p.visible) {
          const dist = Math.hypot(p.x - mx, p.y - my);
          if (dist < 14) {
            found = b.id;
            break;
          }
        }
      }
      setHoveredBranchId(found);
      if (found) {
        canvas.style.cursor = "pointer";
      } else {
        canvas.style.cursor = isDragging ? "grabbing" : "grab";
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;

    for (const b of BRANCH_LOCATIONS) {
      const p = project3D(b.lat, b.lng, rotationLng, tiltLat, radius, cx, cy);
      if (p.visible) {
        const dist = Math.hypot(p.x - mx, p.y - my);
        if (dist < 16) {
          focusBranch(b);
          break;
        }
      }
    }
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      targetRotationRef.current = null;
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        rot: rotationLng,
        tilt: tiltLat,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isDragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      setRotationLng((dragStart.rot - dx * 0.4 + 360) % 360);
      setTiltLat(Math.max(-35, Math.min(45, dragStart.tilt + dy * 0.3)));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Format local time for any branch
  const getBranchTime = (tz: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(currentTime);
    } catch {
      return "--:--";
    }
  };

  return (
    <section
      id="global-branches"
      className="relative overflow-hidden bg-navy-deep py-24 text-ivory border-t border-ivory/10"
      ref={containerRef}
    >
      {/* Background glow and subtle grid */}
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gold/15 blur-3xl animate-drift" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
            <GlobeIcon className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "14s" }} />
            Worldwide Network · 12 Global Branches
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-ivory">
            Our Global Presence.<br />
            <span className="text-gold italic font-display">Reflecting Continuous Liquidity.</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-ivory/70 leading-relaxed">
            Connected across the world&apos;s preeminent financial centers. Explore our 12 active banking branches
            blinking in real-time across the globe with 24/7 cross-border clearing and custodial excellence.
          </p>
        </div>

        {/* Globe Stage & Active Branch Card Grid */}
        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12">
          {/* 3D Canvas Globe (Lg: 7 cols) */}
          <div className="relative flex flex-col items-center justify-center lg:col-span-7">
            {/* Interactive Control Pill */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 w-full max-w-lg px-3">
              <div className="flex items-center gap-2 text-xs text-ivory/70">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
                </span>
                <span>12 Active Branch Beacons</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRotating(!isRotating)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-navy/70 px-3 py-1 text-xs text-ivory/80 hover:border-gold hover:text-gold transition-colors"
                  aria-label={isRotating ? "Pause globe rotation" : "Play globe rotation"}
                >
                  {isRotating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isRotating ? "Pause Rotation" : "Auto-Spin"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRotationLng(20);
                    setTiltLat(15);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ivory/20 bg-navy/70 px-3 py-1 text-xs text-ivory/80 hover:border-gold hover:text-gold transition-colors"
                  aria-label="Reset globe view"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Canvas Container with Reflective Sheen Styling */}
            <div className="relative h-[380px] w-full max-w-[480px] sm:h-[460px] sm:max-w-[520px] md:h-[500px] md:max-w-[560px]">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={handleCanvasClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="h-full w-full select-none"
                style={{ touchAction: "none" }}
              />

              {/* Instructions Overlay */}
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-ivory/10 bg-navy-deep/80 px-3 py-1 text-[11px] text-ivory/60 backdrop-blur-sm whitespace-nowrap">
                <Compass className="inline h-3 w-3 mr-1 text-gold" /> Drag to spin globe · Click any blinking dot
              </div>
            </div>
          </div>

          {/* Active Branch Inspector (Lg: 5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-gold/30 bg-navy/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold/20 via-gold to-gold/20" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                    Branch Operational · Online
                  </span>
                </div>
                <span className="rounded bg-gold/15 px-2.5 py-1 text-xs font-mono font-medium text-gold border border-gold/30">
                  {activeBranch.clearanceCode}
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-display text-ivory">{activeBranch.city}</h3>
                  <span className="text-sm text-gold font-medium">{activeBranch.country}</span>
                </div>
                <p className="mt-1 text-xs text-ivory/60 uppercase tracking-widest">{activeBranch.region} Region</p>
                <p className="mt-3 text-sm text-ivory/80 font-medium">{activeBranch.division}</p>
              </div>

              {/* Live Timezone & Address */}
              <div className="mt-6 space-y-3 rounded-xl border border-ivory/10 bg-navy-deep/60 p-4 text-xs">
                <div className="flex items-center justify-between border-b border-ivory/10 pb-2.5">
                  <span className="flex items-center gap-2 text-ivory/60">
                    <Clock className="h-3.5 w-3.5 text-gold" /> Local Branch Time:
                  </span>
                  <span className="font-mono text-sm font-semibold text-gold">
                    {getBranchTime(activeBranch.timezone)}
                  </span>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <MapPin className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                  <span className="text-ivory/80 leading-relaxed">{activeBranch.address}</span>
                </div>
              </div>

              {/* Branch Specialized Services */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold mb-2">Specialized Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {activeBranch.features.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1 rounded-lg border border-ivory/10 bg-navy-deep px-2.5 py-1 text-[11px] text-ivory/80"
                    >
                      <CheckCircle2 className="h-3 w-3 text-gold" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="btn-gold flex-1 text-center !py-2.5 !text-xs justify-center"
                >
                  Contact {activeBranch.city} Desk
                </Link>
                <Link
                  to="/open-account"
                  className="btn-outline-light !py-2.5 !text-xs flex items-center justify-center gap-1"
                >
                  Open Branch Account <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Branch Interactive Directory Grid */}
        <div className="mt-16 border-t border-ivory/10 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-display text-ivory">Direct Branch Directory</h3>
              <p className="text-xs text-ivory/60">Select any branch to center and illuminate its blinking coordinates</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gold">
              <Building2 className="h-3.5 w-3.5" /> 12 Tier-1 Jurisdictions
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BRANCH_LOCATIONS.map((b) => {
              const isActive = b.id === activeBranchId;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => focusBranch(b)}
                  className={`group relative flex flex-col rounded-xl border p-3.5 text-left transition-all duration-300 ${
                    isActive
                      ? "border-gold bg-gold/15 shadow-lg shadow-gold/10 -translate-y-1"
                      : "border-ivory/10 bg-navy/60 hover:border-gold/40 hover:bg-navy hover:-translate-y-0.5"
                  }`}
                >
                  {/* Blinking indicator inside card */}
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
                      {b.region.split("-")[0]}
                    </span>
                    <span className="relative flex h-2 w-2">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isActive ? "bg-gold" : "bg-gold/60"
                        }`}
                      ></span>
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          isActive ? "bg-gold" : "bg-gold/80"
                        }`}
                      ></span>
                    </span>
                  </div>

                  <span className={`text-sm font-semibold tracking-wide ${isActive ? "text-gold" : "text-ivory"}`}>
                    {b.city}
                  </span>
                  <span className="text-[11px] text-ivory/60 truncate">{b.country}</span>

                  <span className="mt-2 text-[10px] font-mono text-gold/90 font-medium">
                    {getBranchTime(b.timezone)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
