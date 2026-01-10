import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Droplets,
  Wind,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  Truck,
  MapPin,
  Activity,
  Target,
  Route,
  Building2,
  Zap,
  CircleDot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { delhiWards, getWardStatus, WardData } from "@/data/delhiWards";

interface RouteInfo {
  id: string;
  name: string;
  pmLevel: number;
  status: "good" | "moderate" | "poor" | "critical";
  needsSprinkling: boolean;
  lastSprinkled: string | null;
}

const generateRoutesForWard = (ward: WardData): RouteInfo[] => {
  const routes: RouteInfo[] = [];
  const routeNames = [
    "Main Street", "Highway Connector", "Industrial Road", "Market Lane",
    "Residential Block A", "Commercial Zone", "School Road", "Hospital Road",
    "Ring Road Section", "Metro Station Road", "Bus Depot Road", "Park Avenue",
    "Temple Street", "Bridge Approach", "Flyover Section", "Construction Zone"
  ];
  
  for (let i = 0; i < ward.routesCount; i++) {
    const pmVariation = Math.floor(Math.random() * 60) - 30;
    const pm = Math.max(50, ward.pmLevel + pmVariation);
    const status = getWardStatus(pm);
    const needsSprinkling = i < ward.routesNeedingAction;
    
    routes.push({
      id: `${ward.id}-r${i + 1}`,
      name: `${routeNames[i % routeNames.length]} - ${ward.name}`,
      pmLevel: pm,
      status,
      needsSprinkling,
      lastSprinkled: needsSprinkling ? null : `${Math.floor(Math.random() * 4) + 1} hours ago`
    });
  }
  
  return routes.sort((a, b) => b.pmLevel - a.pmLevel);
};

function StatCard({ icon: Icon, label, value, subValue, color = "primary" }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color?: "primary" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-600",
    warning: "bg-amber-500/10 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
  };
  
  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm">
      <div className={`p-2 rounded-lg ${colorClasses[color]} w-fit`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-3">
        <p className="text-2xl font-display font-bold">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
      </div>
      <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "good" | "moderate" | "poor" | "critical" }) {
  const config = {
    good: { bg: "bg-emerald-100 text-emerald-700", label: "Good" },
    moderate: { bg: "bg-amber-100 text-amber-700", label: "Moderate" },
    poor: { bg: "bg-orange-100 text-orange-700", label: "Poor" },
    critical: { bg: "bg-red-100 text-red-700", label: "Critical" },
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config[status].bg}`}>
      {config[status].label}
    </span>
  );
}

export default function WardDetails() {
  const params = useParams();
  const wardId = params.wardId as string;
  
  const ward = delhiWards.find(w => w.id === wardId);
  
  if (!ward) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-2">Ward Not Found</h1>
          <p className="text-muted-foreground mb-4">The ward you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const status = getWardStatus(ward.pmLevel);
  const routes = generateRoutesForWard(ward);

  return (
    <div className="min-h-screen bg-background" data-testid="ward-details">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm border" style={{ backgroundColor: ward.color }}>
              <Building2 className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold leading-tight">{ward.name} Ward</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Delhi Municipal Corporation</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <StatusBadge status={status} />
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Clock className="w-3 h-3" />
              {ward.lastUpdated}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Activity}
            label="Current PM10"
            value={ward.pmLevel}
            subValue="µg/m³"
            color={status === "critical" || status === "poor" ? "danger" : status === "moderate" ? "warning" : "success"}
          />
          <StatCard
            icon={AlertTriangle}
            label="Routes Need Action"
            value={ward.routesNeedingAction}
            subValue={`of ${ward.routesCount} total`}
            color={ward.routesNeedingAction > 3 ? "danger" : ward.routesNeedingAction > 0 ? "warning" : "success"}
          />
          <StatCard
            icon={Target}
            label="Effectiveness"
            value={`${ward.effectiveness}%`}
            subValue="PM reduction avg"
            color={ward.effectiveness > 50 ? "success" : ward.effectiveness > 30 ? "warning" : "danger"}
          />
          <StatCard
            icon={Droplets}
            label="Humidity"
            value={`${ward.humidity}%`}
            subValue="Current level"
            color="primary"
          />
          <StatCard
            icon={Route}
            label="Total Routes"
            value={ward.routesCount}
            subValue="Monitored"
            color="primary"
          />
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  All Routes in {ward.name}
                  <Badge className="ml-auto">{routes.length} routes</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {routes.map((route, idx) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${
                        route.needsSprinkling ? "bg-red-50 border-red-200" : "bg-card"
                      }`}
                      data-testid={`route-${route.id}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        route.status === "critical" ? "bg-red-100 text-red-600" :
                        route.status === "poor" ? "bg-orange-100 text-orange-600" :
                        route.status === "moderate" ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{route.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {route.lastSprinkled ? `Sprinkled ${route.lastSprinkled}` : "Not sprinkled yet"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          route.status === "critical" || route.status === "poor" ? "text-red-600" :
                          route.status === "moderate" ? "text-amber-600" : "text-emerald-600"
                        }`}>
                          {route.pmLevel}
                        </p>
                        <p className="text-[10px] text-muted-foreground">µg/m³</p>
                      </div>
                      {route.needsSprinkling && (
                        <Badge variant="destructive" className="text-[10px]">
                          <Zap className="w-3 h-3 mr-1" />
                          Action
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  Assigned Contractor
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="space-y-3">
                  <p className="font-semibold">{ward.contractor}</p>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Effectiveness</span>
                      <span className={`font-semibold ${ward.effectiveness > 50 ? "text-emerald-600" : ward.effectiveness > 30 ? "text-amber-600" : "text-red-600"}`}>
                        {ward.effectiveness}%
                      </span>
                    </div>
                    <Progress value={ward.effectiveness} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Routes Assigned</span>
                    <span className="font-medium">{ward.routesCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pending Actions</span>
                    <span className={`font-semibold ${ward.routesNeedingAction > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {ward.routesNeedingAction}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <Button className="w-full justify-start" variant="outline" data-testid="button-sprinkle-all">
                  <Droplets className="w-4 h-4 mr-2" />
                  Mark All as Sprinkled
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-generate-report">
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button className="w-full justify-start" variant="outline" data-testid="button-alert-contractor">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Alert Contractor
                </Button>
              </CardContent>
            </Card>

            <Card className="border shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {status === "good" || status === "moderate" ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {status === "good" || status === "moderate" ? "Ward Under Control" : "Immediate Action Required"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {status === "good" || status === "moderate" 
                        ? "PM levels are within acceptable range"
                        : `${ward.routesNeedingAction} routes need immediate sprinkling`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
