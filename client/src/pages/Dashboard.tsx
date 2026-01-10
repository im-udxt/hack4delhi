import { useState } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Polyline } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
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
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Route,
  CircleDot,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { delhiWards, getWardStatus, WardData } from "@/data/delhiWards";
import "leaflet/dist/leaflet.css";

type StatusLevel = "good" | "moderate" | "poor" | "critical";
type TimeSlot = "morning" | "evening" | "night";

interface ActionPlan {
  slot: TimeSlot;
  routes: { id: string; name: string; priority: "high" | "medium" | "low"; reason: string; }[];
}

const mockActionPlans: ActionPlan[] = [
  {
    slot: "morning",
    routes: [
      { id: "r1", name: "Shahdara Main Road", priority: "high", reason: "PM10 at 289 µg/m³" },
      { id: "r5", name: "North East Highway", priority: "high", reason: "PM10 at 245 µg/m³" },
      { id: "r2", name: "East Industrial Belt", priority: "medium", reason: "Needs re-sprinkle" },
    ],
  },
  {
    slot: "evening",
    routes: [
      { id: "r2", name: "Central Market Road", priority: "high", reason: "Expected PM spike" },
      { id: "r3", name: "North Construction Zone", priority: "medium", reason: "Preventive action" },
    ],
  },
  {
    slot: "night",
    routes: [
      { id: "r1", name: "South Residential Area", priority: "medium", reason: "Overnight settlement" },
    ],
  },
];

const statusColors: Record<StatusLevel, string> = {
  good: "#22c55e",
  moderate: "#f59e0b", 
  poor: "#f97316",
  critical: "#ef4444",
};

function StatusDot({ status, size = "md", pulse = false }: { status: StatusLevel; size?: "sm" | "md" | "lg"; pulse?: boolean }) {
  const sizeClasses = { sm: "w-2 h-2", md: "w-3 h-3", lg: "w-4 h-4" };
  const colorClasses: Record<StatusLevel, string> = {
    good: "bg-emerald-500", moderate: "bg-amber-500", poor: "bg-orange-500", critical: "bg-red-500",
  };
  return <span className={`inline-block rounded-full ${colorClasses[status]} ${sizeClasses[size]} ${pulse ? "animate-pulse" : ""}`} />;
}

function StatCard({ icon: Icon, label, value, subValue, trend, trendDirection, color = "primary" }: {
  icon: React.ElementType; label: string; value: string | number; subValue?: string;
  trend?: string; trendDirection?: "up" | "down"; color?: "primary" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary", success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600", danger: "bg-red-500/10 text-red-600",
  };
  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}><Icon className="w-4 h-4" /></div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trendDirection === "down" ? "text-emerald-600" : "text-red-500"}`}>
            {trendDirection === "down" ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}{trend}
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

function OverviewStats() {
  const totalRoutes = delhiWards.reduce((acc, w) => acc + w.routesCount, 0);
  const routesNeedingAction = delhiWards.reduce((acc, w) => acc + w.routesNeedingAction, 0);
  const avgPM = Math.round(delhiWards.reduce((acc, w) => acc + w.pmLevel, 0) / delhiWards.length);
  const avgEffectiveness = Math.round(delhiWards.reduce((acc, w) => acc + w.effectiveness, 0) / delhiWards.length);
  const avgHumidity = Math.round(delhiWards.reduce((acc, w) => acc + w.humidity, 0) / delhiWards.length);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard icon={Activity} label="Avg PM10 Level" value={avgPM} subValue="µg/m³" trend="8%" trendDirection="up"
        color={avgPM > 200 ? "danger" : avgPM > 100 ? "warning" : "success"} />
      <StatCard icon={AlertTriangle} label="Routes Need Action" value={routesNeedingAction} subValue={`of ${totalRoutes} total`}
        color={routesNeedingAction > 15 ? "danger" : routesNeedingAction > 5 ? "warning" : "success"} />
      <StatCard icon={Target} label="Avg Effectiveness" value={`${avgEffectiveness}%`} subValue="PM reduction" trend="3%" trendDirection="down"
        color={avgEffectiveness > 50 ? "success" : avgEffectiveness > 30 ? "warning" : "danger"} />
      <StatCard icon={Droplets} label="Avg Humidity" value={`${avgHumidity}%`} subValue="Favorable conditions" color="primary" />
    </div>
  );
}

function EnvironmentBar() {
  return (
    <div className="flex items-center gap-6 px-4 py-2.5 bg-muted/50 rounded-xl border">
      <div className="flex items-center gap-2">
        <Thermometer className="w-4 h-4 text-orange-500" />
        <div><p className="text-sm font-semibold">28°C</p><p className="text-[10px] text-muted-foreground">Temperature</p></div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex items-center gap-2">
        <Wind className="w-4 h-4 text-sky-500" />
        <div><p className="text-sm font-semibold">12 km/h NW</p><p className="text-[10px] text-muted-foreground">Wind</p></div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex items-center gap-2">
        <Droplets className="w-4 h-4 text-blue-500" />
        <div><p className="text-sm font-semibold">52%</p><p className="text-[10px] text-muted-foreground">Humidity</p></div>
      </div>
      <div className="w-px h-8 bg-border" />
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4 text-purple-500" />
        <div><p className="text-sm font-semibold">Moderate</p><p className="text-[10px] text-muted-foreground">Sprinkling Conditions</p></div>
      </div>
    </div>
  );
}

function WardInfoPanel({ ward, onClose }: { ward: WardData; onClose: () => void }) {
  const status = getWardStatus(ward.pmLevel);
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute top-4 right-4 w-80 z-[1000]">
      <Card className="border-0 shadow-xl bg-card/95 backdrop-blur-md">
        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border" style={{ backgroundColor: ward.color }}>
              <Building2 className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <CardTitle className="text-base font-display font-semibold">{ward.name}</CardTitle>
              <p className="text-xs text-muted-foreground">Delhi Ward</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} data-testid="button-close-ward"><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <StatusDot status={status} size="md" pulse={status === "critical"} />
            <span className="text-sm font-medium capitalize">{status}</span>
            {ward.routesNeedingAction > 0 && <Badge variant="destructive" className="ml-auto text-xs">{ward.routesNeedingAction} need action</Badge>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">PM10 Level</p>
              <p className={`text-2xl font-display font-bold ${status === "critical" || status === "poor" ? "text-red-600" : status === "moderate" ? "text-amber-600" : "text-emerald-600"}`}>{ward.pmLevel}</p>
              <p className="text-xs text-muted-foreground">µg/m³</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Effectiveness</p>
              <p className={`text-2xl font-display font-bold ${ward.effectiveness > 50 ? "text-emerald-600" : ward.effectiveness > 30 ? "text-amber-600" : "text-red-600"}`}>{ward.effectiveness}%</p>
              <p className="text-xs text-muted-foreground">avg reduction</p>
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Routes</span><span className="font-medium">{ward.routesCount}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Routes Need Action</span><span className="font-semibold text-red-600">{ward.routesNeedingAction}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Humidity</span><span className="font-medium">{ward.humidity}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contractor</span><span className="font-medium">{ward.contractor}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Updated</span><span className="font-medium">{ward.lastUpdated}</span></div>
          </div>
          <Link href={`/ward/${ward.id}`}>
            <Button className="w-full" data-testid="button-view-ward-details">
              View All Routes <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WardPolygons({ onWardClick }: { onWardClick: (ward: WardData) => void }) {
  return (
    <>
      {delhiWards.map(ward => {
        const status = getWardStatus(ward.pmLevel);
        return (
          <Polygon
            key={ward.id}
            positions={ward.coordinates}
            pathOptions={{
              color: statusColors[status],
              fillColor: ward.color,
              fillOpacity: 0.6,
              weight: 2,
            }}
            eventHandlers={{ click: () => onWardClick(ward) }}
          >
            <Popup>
              <div className="font-sans text-center">
                <p className="font-bold text-base">{ward.name}</p>
                <p className="text-sm">PM10: <span className="font-semibold">{ward.pmLevel} µg/m³</span></p>
                <p className="text-xs text-gray-500">{ward.routesNeedingAction} routes need action</p>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}

function WardsList() {
  const sortedWards = [...delhiWards].sort((a, b) => b.pmLevel - a.pmLevel);
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          All Wards
          <Badge className="ml-auto">{delhiWards.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ScrollArea className="h-[280px]">
          <div className="space-y-2 pr-3">
            {sortedWards.map(ward => {
              const status = getWardStatus(ward.pmLevel);
              return (
                <Link key={ward.id} href={`/ward/${ward.id}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" data-testid={`ward-link-${ward.id}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: ward.color }}>
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ward.name}</p>
                      <p className="text-xs text-muted-foreground">{ward.routesCount} routes</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${status === "critical" || status === "poor" ? "text-red-600" : status === "moderate" ? "text-amber-600" : "text-emerald-600"}`}>{ward.pmLevel}</p>
                      <p className="text-[10px] text-muted-foreground">µg/m³</p>
                    </div>
                    <StatusDot status={status} size="sm" pulse={status === "critical"} />
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CriticalWardsAlert() {
  const criticalWards = delhiWards.filter(w => getWardStatus(w.pmLevel) === "critical" || getWardStatus(w.pmLevel) === "poor");
  if (criticalWards.length === 0) return null;
  return (
    <Card className="border shadow-sm border-l-4 border-l-red-500">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-600">
          <Zap className="w-4 h-4" />Priority Wards<Badge variant="destructive" className="ml-auto">{criticalWards.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        {criticalWards.slice(0, 4).map(ward => (
          <Link key={ward.id} href={`/ward/${ward.id}`}>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-red-50 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors" data-testid={`critical-ward-${ward.id}`}>
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{ward.name}</p>
                <p className="text-xs text-muted-foreground">{ward.routesNeedingAction} routes need immediate action</p>
              </div>
              <span className="text-sm font-bold text-red-600">{ward.pmLevel}</span>
            </div>
          </Link>
        ))}
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
        <CardTitle className="text-sm font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" />Today's Action Plans</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Tabs defaultValue="morning" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-9 mb-3">
            {(["morning", "evening", "night"] as TimeSlot[]).map(slot => {
              const config = slotConfig[slot];
              const Icon = config.icon;
              return <TabsTrigger key={slot} value={slot} className="text-xs gap-1.5" data-testid={`tab-${slot}`}><Icon className={`w-3.5 h-3.5 ${config.color}`} /><span className="capitalize">{slot}</span></TabsTrigger>;
            })}
          </TabsList>
          {plans.map(plan => {
            const config = slotConfig[plan.slot];
            return (
              <TabsContent key={plan.slot} value={plan.slot} className="mt-0 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">{config.time}</p>
                {plan.routes.map(route => (
                  <div key={route.id} className={`flex items-center gap-2 p-2.5 rounded-lg text-sm border ${route.priority === "high" ? "bg-red-50 border-red-200" : route.priority === "medium" ? "bg-amber-50 border-amber-200" : "bg-muted border-transparent"}`} data-testid={`plan-route-${route.id}`}>
                    <CircleDot className={`w-3.5 h-3.5 flex-shrink-0 ${route.priority === "high" ? "text-red-500" : route.priority === "medium" ? "text-amber-500" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0"><p className="font-medium truncate">{route.name}</p><p className="text-xs text-muted-foreground truncate">{route.reason}</p></div>
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

function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 shadow-md border">
      <p className="text-xs font-semibold text-muted-foreground mb-2">Ward PM Status</p>
      <div className="flex flex-wrap gap-3">
        {(["good", "moderate", "poor", "critical"] as StatusLevel[]).map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: statusColors[status] }} />
            <span className="text-xs capitalize">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedWard, setSelectedWard] = useState<WardData | null>(null);
  const totalRoutesNeedingAction = delhiWards.reduce((acc, w) => acc + w.routesNeedingAction, 0);

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
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Delhi Municipal Corporation</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5" data-testid="badge-action-count">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />{totalRoutesNeedingAction} routes need action
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Live Data</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <OverviewStats />
        <EnvironmentBar />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Delhi Ward Map
                  <span className="text-xs text-muted-foreground font-normal ml-2">Click a ward for details</span>
                </CardTitle>
              </CardHeader>
              <div className="relative h-[500px]">
                <MapContainer center={[28.62, 77.22]} zoom={11} className="h-full w-full" zoomControl={false}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  <WardPolygons onWardClick={setSelectedWard} />
                </MapContainer>
                <MapLegend />
                <AnimatePresence>{selectedWard && <WardInfoPanel ward={selectedWard} onClose={() => setSelectedWard(null)} />}</AnimatePresence>
              </div>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <CriticalWardsAlert />
            <WardsList />
            <ActionPlansCard plans={mockActionPlans} />
          </div>
        </div>
      </main>
    </div>
  );
}
