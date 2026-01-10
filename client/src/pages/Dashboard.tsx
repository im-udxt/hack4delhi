import { useState } from "react";
import { MapContainer, TileLayer, Polyline, Popup } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  X,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Building2,
  Truck,
  MapPin,
  Activity,
  Target,
  Gauge,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Route,
  CircleDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import "leaflet/dist/leaflet.css";

type StatusLevel = "good" | "moderate" | "poor" | "critical";
type TimeSlot = "morning" | "evening" | "night";

interface RouteData {
  id: string;
  name: string;
  ward: string;
  coordinates: [number, number][];
  status: StatusLevel;
  pmBefore: number;
  pmAfter: number | null;
  humidity: number;
  lastSprinkled: string | null;
  needsSprinkling: boolean;
  impactScore: number;
  contractor: string;
}

interface ContractorAlert {
  id: string;
  contractor: string;
  type: "ineffective" | "skipped" | "worsening";
  route: string;
  message: string;
  timestamp: string;
}

interface ActionPlan {
  slot: TimeSlot;
  routes: {
    id: string;
    name: string;
    priority: "high" | "medium" | "low";
    reason: string;
  }[];
}

const mockRoutes: RouteData[] = [
  {
    id: "r1",
    name: "MG Road - Sector 12",
    ward: "Ward 5",
    coordinates: [[28.6139, 77.209], [28.6189, 77.219], [28.6229, 77.229]],
    status: "critical",
    pmBefore: 285,
    pmAfter: null,
    humidity: 45,
    lastSprinkled: null,
    needsSprinkling: true,
    impactScore: 92,
    contractor: "ABC Contractors",
  },
  {
    id: "r2",
    name: "Industrial Belt Road",
    ward: "Ward 7",
    coordinates: [[28.6089, 77.199], [28.6039, 77.209], [28.5989, 77.219]],
    status: "poor",
    pmBefore: 198,
    pmAfter: 142,
    humidity: 52,
    lastSprinkled: "2 hours ago",
    needsSprinkling: true,
    impactScore: 78,
    contractor: "XYZ Services",
  },
  {
    id: "r3",
    name: "Construction Zone C",
    ward: "Ward 5",
    coordinates: [[28.6239, 77.199], [28.6289, 77.209]],
    status: "moderate",
    pmBefore: 156,
    pmAfter: 98,
    humidity: 58,
    lastSprinkled: "4 hours ago",
    needsSprinkling: false,
    impactScore: 45,
    contractor: "ABC Contractors",
  },
  {
    id: "r4",
    name: "Residential Sector 8",
    ward: "Ward 3",
    coordinates: [[28.6039, 77.229], [28.6089, 77.239], [28.6139, 77.249]],
    status: "good",
    pmBefore: 89,
    pmAfter: 52,
    humidity: 65,
    lastSprinkled: "1 hour ago",
    needsSprinkling: false,
    impactScore: 28,
    contractor: "Green Clean Ltd",
  },
  {
    id: "r5",
    name: "Highway Connector NH-48",
    ward: "Ward 9",
    coordinates: [[28.5939, 77.189], [28.5889, 77.179], [28.5839, 77.169]],
    status: "critical",
    pmBefore: 312,
    pmAfter: null,
    humidity: 42,
    lastSprinkled: null,
    needsSprinkling: true,
    impactScore: 95,
    contractor: "XYZ Services",
  },
  {
    id: "r6",
    name: "Market Road Central",
    ward: "Ward 3",
    coordinates: [[28.6189, 77.239], [28.6239, 77.249]],
    status: "moderate",
    pmBefore: 134,
    pmAfter: 89,
    humidity: 55,
    lastSprinkled: "3 hours ago",
    needsSprinkling: false,
    impactScore: 52,
    contractor: "Green Clean Ltd",
  },
];

const mockAlerts: ContractorAlert[] = [
  {
    id: "a1",
    contractor: "XYZ Services",
    type: "ineffective",
    route: "Industrial Belt Road",
    message: "3 consecutive sprinklings with <15% PM reduction",
    timestamp: "15 min ago",
  },
  {
    id: "a2",
    contractor: "ABC Contractors",
    type: "skipped",
    route: "MG Road - Sector 12",
    message: "High-impact route not sprinkled in 8 hours",
    timestamp: "1 hour ago",
  },
];

const mockActionPlans: ActionPlan[] = [
  {
    slot: "morning",
    routes: [
      { id: "r1", name: "MG Road - Sector 12", priority: "high", reason: "PM10 at 285 µg/m³" },
      { id: "r5", name: "Highway Connector NH-48", priority: "high", reason: "PM10 at 312 µg/m³" },
      { id: "r2", name: "Industrial Belt Road", priority: "medium", reason: "Needs re-sprinkle" },
    ],
  },
  {
    slot: "evening",
    routes: [
      { id: "r2", name: "Industrial Belt Road", priority: "high", reason: "Expected PM spike" },
      { id: "r3", name: "Construction Zone C", priority: "medium", reason: "Preventive action" },
    ],
  },
  {
    slot: "night",
    routes: [
      { id: "r1", name: "MG Road - Sector 12", priority: "medium", reason: "Overnight settlement" },
    ],
  },
];

const routeColors: Record<StatusLevel, string> = {
  good: "#22c55e",
  moderate: "#f59e0b",
  poor: "#f97316",
  critical: "#ef4444",
};

function StatusDot({ status, size = "md", pulse = false }: { status: StatusLevel; size?: "sm" | "md" | "lg"; pulse?: boolean }) {
  const sizeClasses = { sm: "w-2 h-2", md: "w-3 h-3", lg: "w-4 h-4" };
  const colorClasses: Record<StatusLevel, string> = {
    good: "bg-emerald-500",
    moderate: "bg-amber-500",
    poor: "bg-orange-500",
    critical: "bg-red-500",
  };
  return (
    <span className={`inline-block rounded-full ${colorClasses[status]} ${sizeClasses[size]} ${pulse ? "animate-pulse" : ""}`} />
  );
}

function StatCard({ icon: Icon, label, value, subValue, trend, trendDirection, color = "primary" }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendDirection?: "up" | "down";
  color?: "primary" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
  };
  
  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trendDirection === "down" ? "text-emerald-600" : "text-red-500"}`}>
            {trendDirection === "down" ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-display font-bold tracking-tight">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
      </div>
      <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

function OverviewStats({ routes }: { routes: RouteData[] }) {
  const avgPM = Math.round(routes.reduce((acc, r) => acc + r.pmBefore, 0) / routes.length);
  const routesNeedingAction = routes.filter(r => r.needsSprinkling).length;
  const sprinkledRoutes = routes.filter(r => r.pmAfter !== null);
  const avgEffectiveness = sprinkledRoutes.length > 0 
    ? Math.round(sprinkledRoutes.reduce((acc, r) => acc + ((r.pmBefore - (r.pmAfter || r.pmBefore)) / r.pmBefore) * 100, 0) / sprinkledRoutes.length)
    : 0;
  const avgHumidity = Math.round(routes.reduce((acc, r) => acc + r.humidity, 0) / routes.length);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Activity}
        label="Avg PM10 Level"
        value={avgPM}
        subValue="µg/m³"
        trend="12%"
        trendDirection="up"
        color={avgPM > 200 ? "danger" : avgPM > 100 ? "warning" : "success"}
      />
      <StatCard
        icon={AlertTriangle}
        label="Routes Need Action"
        value={routesNeedingAction}
        subValue={`of ${routes.length} total`}
        color={routesNeedingAction > 2 ? "danger" : routesNeedingAction > 0 ? "warning" : "success"}
      />
      <StatCard
        icon={Target}
        label="Avg Effectiveness"
        value={`${avgEffectiveness}%`}
        subValue="PM reduction"
        trend="5%"
        trendDirection="down"
        color={avgEffectiveness > 30 ? "success" : avgEffectiveness > 15 ? "warning" : "danger"}
      />
      <StatCard
        icon={Droplets}
        label="Avg Humidity"
        value={`${avgHumidity}%`}
        subValue="Favorable for sprinkling"
        color="primary"
      />
    </div>
  );
}

function EnvironmentBar() {
  return (
    <div className="flex items-center gap-6 px-4 py-2.5 bg-muted/50 rounded-xl border">
      <div className="flex items-center gap-2">
        <Thermometer className="w-4 h-4 text-orange-500" />
        <div>
          <p className="text-sm font-semibold">28°C</p>
          <p className="text-[10px] text-muted-foreground">Temperature</p>
        </div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex items-center gap-2">
        <Wind className="w-4 h-4 text-sky-500" />
        <div>
          <p className="text-sm font-semibold">12 km/h NW</p>
          <p className="text-[10px] text-muted-foreground">Wind</p>
        </div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex items-center gap-2">
        <Droplets className="w-4 h-4 text-blue-500" />
        <div>
          <p className="text-sm font-semibold">52%</p>
          <p className="text-[10px] text-muted-foreground">Humidity</p>
        </div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4 text-purple-500" />
        <div>
          <p className="text-sm font-semibold">Moderate</p>
          <p className="text-[10px] text-muted-foreground">Sprinkling Conditions</p>
        </div>
      </div>
    </div>
  );
}

function WardBreakdown({ routes }: { routes: RouteData[] }) {
  const wards = Array.from(new Set(routes.map(r => r.ward)));
  
  const getWardData = (ward: string) => {
    const wardRoutes = routes.filter(r => r.ward === ward);
    const avgPM = Math.round(wardRoutes.reduce((acc, r) => acc + r.pmBefore, 0) / wardRoutes.length);
    const needsAction = wardRoutes.filter(r => r.needsSprinkling).length;
    const status: StatusLevel = avgPM > 250 ? "critical" : avgPM > 150 ? "poor" : avgPM > 100 ? "moderate" : "good";
    return { avgPM, needsAction, total: wardRoutes.length, status };
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Ward Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {wards.map(ward => {
          const data = getWardData(ward);
          return (
            <div key={ward} className="flex items-center gap-3" data-testid={`ward-row-${ward.toLowerCase().replace(" ", "-")}`}>
              <StatusDot status={data.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{ward}</p>
                  <p className="text-sm font-semibold">{data.avgPM} µg/m³</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">{data.total} routes monitored</p>
                  {data.needsAction > 0 && (
                    <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                      {data.needsAction} need action
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ContractorPerformance({ routes, alerts }: { routes: RouteData[]; alerts: ContractorAlert[] }) {
  const contractors = Array.from(new Set(routes.map(r => r.contractor)));
  
  const getContractorData = (name: string) => {
    const contractorRoutes = routes.filter(r => r.contractor === name);
    const sprinkled = contractorRoutes.filter(r => r.pmAfter !== null);
    const effectiveness = sprinkled.length > 0
      ? Math.round(sprinkled.reduce((acc, r) => acc + ((r.pmBefore - (r.pmAfter || r.pmBefore)) / r.pmBefore) * 100, 0) / sprinkled.length)
      : 0;
    const alertCount = alerts.filter(a => a.contractor === name).length;
    return { routeCount: contractorRoutes.length, effectiveness, alertCount };
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Truck className="w-4 h-4 text-muted-foreground" />
          Contractor Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {contractors.map(contractor => {
          const data = getContractorData(contractor);
          return (
            <div key={contractor} className="space-y-1.5" data-testid={`contractor-${contractor.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{contractor}</p>
                {data.alertCount > 0 && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-red-300 text-red-600 bg-red-50">
                    {data.alertCount} alert{data.alertCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Progress value={data.effectiveness} className="h-2 flex-1" />
                <span className={`text-xs font-semibold min-w-[40px] text-right ${data.effectiveness > 30 ? "text-emerald-600" : data.effectiveness > 15 ? "text-amber-600" : "text-red-500"}`}>
                  {data.effectiveness}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{data.routeCount} routes assigned</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ActiveAlerts({ alerts }: { alerts: ContractorAlert[] }) {
  if (alerts.length === 0) return null;
  
  const alertStyles = {
    ineffective: { icon: TrendingDown, bg: "bg-amber-50 border-amber-200", iconColor: "text-amber-600" },
    skipped: { icon: AlertTriangle, bg: "bg-red-50 border-red-200", iconColor: "text-red-600" },
    worsening: { icon: TrendingUp, bg: "bg-red-50 border-red-200", iconColor: "text-red-600" },
  };

  return (
    <Card className="border shadow-sm border-l-4 border-l-red-500">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-600">
          <Zap className="w-4 h-4" />
          Active Alerts
          <Badge variant="destructive" className="ml-auto">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {alerts.map(alert => {
          const style = alertStyles[alert.type];
          const Icon = style.icon;
          return (
            <div key={alert.id} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${style.bg}`} data-testid={`alert-${alert.id}`}>
              <Icon className={`w-4 h-4 mt-0.5 ${style.iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.contractor}</p>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{alert.route} • {alert.timestamp}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ActionPlansCard({ plans }: { plans: ActionPlan[] }) {
  const slotConfig: Record<TimeSlot, { icon: React.ElementType; time: string; color: string }> = {
    morning: { icon: Sun, time: "6:00 - 10:00", color: "text-amber-500" },
    evening: { icon: Sunset, time: "16:00 - 19:00", color: "text-orange-500" },
    night: { icon: Moon, time: "22:00 - 02:00", color: "text-indigo-500" },
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Today's Action Plans
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-9 mb-3">
            {(["morning", "evening", "night"] as TimeSlot[]).map(slot => {
              const config = slotConfig[slot];
              const Icon = config.icon;
              return (
                <TabsTrigger key={slot} value={slot} className="text-xs gap-1.5" data-testid={`tab-${slot}`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                  <span className="capitalize">{slot}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {plans.map(plan => {
            const config = slotConfig[plan.slot];
            return (
              <TabsContent key={plan.slot} value={plan.slot} className="mt-0 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">{config.time}</p>
                {plan.routes.map(route => (
                  <div
                    key={route.id}
                    className={`flex items-center gap-2 p-2.5 rounded-lg text-sm border ${
                      route.priority === "high" ? "bg-red-50 border-red-200" : route.priority === "medium" ? "bg-amber-50 border-amber-200" : "bg-muted border-transparent"
                    }`}
                    data-testid={`plan-route-${route.id}`}
                  >
                    <CircleDot className={`w-3.5 h-3.5 flex-shrink-0 ${route.priority === "high" ? "text-red-500" : route.priority === "medium" ? "text-amber-500" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{route.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{route.reason}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function PriorityRoutesList({ routes }: { routes: RouteData[] }) {
  const priorityRoutes = routes.filter(r => r.needsSprinkling).sort((a, b) => b.impactScore - a.impactScore);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Route className="w-4 h-4 text-muted-foreground" />
          Priority Routes
          <Badge className="ml-auto bg-red-100 text-red-700 hover:bg-red-100">{priorityRoutes.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ScrollArea className="h-[180px]">
          <div className="space-y-2 pr-3">
            {priorityRoutes.map((route, idx) => (
              <div
                key={route.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                data-testid={`priority-route-${route.id}`}
              >
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{route.name}</p>
                  <p className="text-xs text-muted-foreground">{route.ward}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">{route.pmBefore}</p>
                  <p className="text-[10px] text-muted-foreground">µg/m³</p>
                </div>
              </div>
            ))}
            {priorityRoutes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm font-medium">All routes in good condition</p>
                <p className="text-xs text-muted-foreground">No immediate action required</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function RouteDetailPanel({ route, onClose }: { route: RouteData; onClose: () => void }) {
  const impactChange = route.pmAfter !== null ? Math.round(((route.pmBefore - route.pmAfter) / route.pmBefore) * 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-4 right-4 w-80 z-[1000]"
    >
      <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-md">
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-base font-display font-semibold">{route.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{route.ward}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} data-testid="button-close-detail">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <StatusDot status={route.status} size="md" pulse={route.status === "critical"} />
            <span className="text-sm font-medium capitalize">{route.status}</span>
            {route.needsSprinkling && <Badge variant="destructive" className="ml-auto text-xs">Needs Sprinkling</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Before</p>
              <p className="text-2xl font-display font-bold text-red-600">{route.pmBefore}</p>
              <p className="text-xs text-muted-foreground">µg/m³</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">After</p>
              {route.pmAfter !== null ? (
                <>
                  <p className="text-2xl font-display font-bold text-emerald-600">{route.pmAfter}</p>
                  <p className="text-xs text-muted-foreground">µg/m³</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-3">Not sprinkled</p>
              )}
            </div>
          </div>

          {impactChange !== null && (
            <div className={`flex items-center gap-3 p-3 rounded-lg ${impactChange > 30 ? "bg-emerald-50 border border-emerald-200" : impactChange > 15 ? "bg-amber-50 border border-amber-200" : "bg-red-50 border border-red-200"}`}>
              {impactChange > 30 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : impactChange > 15 ? <TrendingDown className="w-5 h-5 text-amber-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
              <div>
                <p className="text-sm font-semibold">{impactChange}% Reduction</p>
                <p className="text-xs text-muted-foreground">{impactChange > 30 ? "Highly effective" : impactChange > 15 ? "Moderately effective" : "Low effectiveness"}</p>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Humidity</span><span className="font-medium">{route.humidity}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Sprinkled</span><span className="font-medium">{route.lastSprinkled || "Never"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contractor</span><span className="font-medium">{route.contractor}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Impact Score</span><span className="font-bold text-primary">{route.impactScore}/100</span></div>
          </div>

          {route.needsSprinkling && (
            <Button className="w-full" data-testid="button-mark-sprinkled">
              <Droplets className="w-4 h-4 mr-2" />
              Mark as Sprinkled
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 shadow-md border">
      <p className="text-xs font-semibold text-muted-foreground mb-2">Route Status</p>
      <div className="flex flex-wrap gap-3">
        {(["good", "moderate", "poor", "critical"] as StatusLevel[]).map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="w-4 h-1 rounded-full" style={{ backgroundColor: routeColors[status] }} />
            <span className="text-xs capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RouteLines({ routes, onRouteClick }: { routes: RouteData[]; onRouteClick: (route: RouteData) => void }) {
  return (
    <>
      {routes.map(route => (
        <Polyline
          key={route.id}
          positions={route.coordinates}
          pathOptions={{
            color: routeColors[route.status],
            weight: route.needsSprinkling ? 6 : 4,
            opacity: 0.9,
            dashArray: route.needsSprinkling ? undefined : "10, 5",
          }}
          eventHandlers={{ click: () => onRouteClick(route) }}
        >
          <Popup>
            <div className="font-sans">
              <p className="font-semibold">{route.name}</p>
              <p className="text-sm text-gray-600">PM: {route.pmBefore} µg/m³</p>
            </div>
          </Popup>
        </Polyline>
      ))}
    </>
  );
}

export default function Dashboard() {
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-sky-600 flex items-center justify-center shadow-md">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold leading-tight">AQI Sprinkler Dashboard</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Municipal Dust Mitigation</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Data
            </Badge>
            <span className="text-xs text-muted-foreground">Updated 2 min ago</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <OverviewStats routes={mockRoutes} />
        
        <EnvironmentBar />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Card className="border shadow-sm overflow-hidden">
              <div className="relative h-[500px]">
                <MapContainer center={[28.6089, 77.209]} zoom={13} className="h-full w-full" zoomControl={false}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  <RouteLines routes={mockRoutes} onRouteClick={setSelectedRoute} />
                </MapContainer>
                <MapLegend />
                <AnimatePresence>
                  {selectedRoute && <RouteDetailPanel route={selectedRoute} onClose={() => setSelectedRoute(null)} />}
                </AnimatePresence>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <WardBreakdown routes={mockRoutes} />
              <ContractorPerformance routes={mockRoutes} alerts={mockAlerts} />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <ActiveAlerts alerts={mockAlerts} />
            <PriorityRoutesList routes={mockRoutes} />
            <ActionPlansCard plans={mockActionPlans} />
          </div>
        </div>
      </main>
    </div>
  );
}
