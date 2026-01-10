export interface WardData {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][];
  pmLevel: number;
  humidity: number;
  routesCount: number;
  routesNeedingAction: number;
  lastUpdated: string;
  contractor: string;
  effectiveness: number;
}

export const delhiWards: WardData[] = [
  {
    id: "north",
    name: "North",
    color: "#fce7f3",
    coordinates: [
      [28.75, 77.15], [28.78, 77.18], [28.80, 77.22], [28.78, 77.28],
      [28.74, 77.30], [28.70, 77.28], [28.68, 77.22], [28.70, 77.16], [28.75, 77.15]
    ],
    pmLevel: 178,
    humidity: 48,
    routesCount: 12,
    routesNeedingAction: 4,
    lastUpdated: "5 min ago",
    contractor: "ABC Contractors",
    effectiveness: 42
  },
  {
    id: "north-west",
    name: "North West",
    color: "#e0e7ff",
    coordinates: [
      [28.72, 77.02], [28.76, 77.08], [28.75, 77.15], [28.70, 77.16],
      [28.66, 77.12], [28.64, 77.06], [28.68, 77.02], [28.72, 77.02]
    ],
    pmLevel: 156,
    humidity: 52,
    routesCount: 8,
    routesNeedingAction: 2,
    lastUpdated: "3 min ago",
    contractor: "Green Clean Ltd",
    effectiveness: 58
  },
  {
    id: "north-east",
    name: "North East",
    color: "#dbeafe",
    coordinates: [
      [28.74, 77.30], [28.72, 77.34], [28.68, 77.36], [28.64, 77.34],
      [28.66, 77.28], [28.70, 77.28], [28.74, 77.30]
    ],
    pmLevel: 245,
    humidity: 44,
    routesCount: 6,
    routesNeedingAction: 4,
    lastUpdated: "2 min ago",
    contractor: "XYZ Services",
    effectiveness: 28
  },
  {
    id: "west",
    name: "West",
    color: "#fef3c7",
    coordinates: [
      [28.66, 77.02], [28.68, 77.02], [28.64, 77.06], [28.66, 77.12],
      [28.64, 77.16], [28.60, 77.14], [28.56, 77.10], [28.58, 77.04], [28.66, 77.02]
    ],
    pmLevel: 134,
    humidity: 56,
    routesCount: 10,
    routesNeedingAction: 1,
    lastUpdated: "4 min ago",
    contractor: "ABC Contractors",
    effectiveness: 62
  },
  {
    id: "central",
    name: "Central",
    color: "#fed7aa",
    coordinates: [
      [28.68, 77.22], [28.70, 77.28], [28.66, 77.28], [28.64, 77.24],
      [28.64, 77.20], [28.68, 77.22]
    ],
    pmLevel: 198,
    humidity: 50,
    routesCount: 14,
    routesNeedingAction: 5,
    lastUpdated: "1 min ago",
    contractor: "XYZ Services",
    effectiveness: 45
  },
  {
    id: "new-delhi",
    name: "New Delhi",
    color: "#fef9c3",
    coordinates: [
      [28.64, 77.16], [28.64, 77.20], [28.64, 77.24], [28.60, 77.26],
      [28.56, 77.24], [28.56, 77.18], [28.60, 77.14], [28.64, 77.16]
    ],
    pmLevel: 112,
    humidity: 58,
    routesCount: 16,
    routesNeedingAction: 2,
    lastUpdated: "2 min ago",
    contractor: "Green Clean Ltd",
    effectiveness: 71
  },
  {
    id: "south-west",
    name: "South West",
    color: "#d9f99d",
    coordinates: [
      [28.56, 77.04], [28.58, 77.04], [28.56, 77.10], [28.56, 77.18],
      [28.52, 77.16], [28.48, 77.12], [28.46, 77.06], [28.50, 77.02], [28.56, 77.04]
    ],
    pmLevel: 98,
    humidity: 62,
    routesCount: 9,
    routesNeedingAction: 0,
    lastUpdated: "6 min ago",
    contractor: "ABC Contractors",
    effectiveness: 78
  },
  {
    id: "south",
    name: "South",
    color: "#e9d5ff",
    coordinates: [
      [28.56, 77.18], [28.56, 77.24], [28.54, 77.28], [28.50, 77.30],
      [28.46, 77.26], [28.48, 77.20], [28.52, 77.16], [28.56, 77.18]
    ],
    pmLevel: 142,
    humidity: 54,
    routesCount: 11,
    routesNeedingAction: 2,
    lastUpdated: "3 min ago",
    contractor: "Green Clean Ltd",
    effectiveness: 55
  },
  {
    id: "south-east",
    name: "South East",
    color: "#a5f3fc",
    coordinates: [
      [28.60, 77.26], [28.64, 77.28], [28.62, 77.34], [28.58, 77.36],
      [28.54, 77.32], [28.54, 77.28], [28.60, 77.26]
    ],
    pmLevel: 167,
    humidity: 51,
    routesCount: 7,
    routesNeedingAction: 2,
    lastUpdated: "4 min ago",
    contractor: "XYZ Services",
    effectiveness: 48
  },
  {
    id: "east",
    name: "East",
    color: "#99f6e4",
    coordinates: [
      [28.66, 77.28], [28.68, 77.36], [28.64, 77.38], [28.62, 77.34],
      [28.64, 77.28], [28.66, 77.28]
    ],
    pmLevel: 212,
    humidity: 46,
    routesCount: 8,
    routesNeedingAction: 3,
    lastUpdated: "2 min ago",
    contractor: "XYZ Services",
    effectiveness: 35
  },
  {
    id: "shahdara",
    name: "Shahdara",
    color: "#fecaca",
    coordinates: [
      [28.68, 77.36], [28.72, 77.34], [28.74, 77.38], [28.72, 77.42],
      [28.68, 77.40], [28.66, 77.38], [28.68, 77.36]
    ],
    pmLevel: 289,
    humidity: 42,
    routesCount: 5,
    routesNeedingAction: 4,
    lastUpdated: "1 min ago",
    contractor: "ABC Contractors",
    effectiveness: 22
  }
];

export const getWardStatus = (pmLevel: number): "good" | "moderate" | "poor" | "critical" => {
  if (pmLevel > 250) return "critical";
  if (pmLevel > 150) return "poor";
  if (pmLevel > 100) return "moderate";
  return "good";
};
