import type { TransportRoute, TransportTrip } from "@/types/portal";

export const mockTransportRoutes = [
  {
    id: "route-east-legon",
    routeName: "East Legon Route",
    busName: "Bus A",
    driverName: "Kwame Asare",
    driverPhone: "+233 20 000 0002",
    stops: ["Lakeside Junction", "American House", "School Campus"],
  },
] satisfies readonly TransportRoute[];

export const mockTransportTrips = [
  {
    id: "trip-east-legon-001",
    routeId: "route-east-legon",
    date: "2026-06-22",
    status: "on_route",
    lastUpdated: "2026-06-22T07:15:00.000Z",
    currentLocationLabel: "American House",
    nextStop: "School Campus",
  },
] satisfies readonly TransportTrip[];
