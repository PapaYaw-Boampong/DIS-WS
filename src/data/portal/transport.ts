import type {
  TransportAssignment,
  TransportNotice,
  TransportRoute,
  TransportTrip,
} from "@/types/portal";

export const mockTransportRoutes = [
  {
    id: "route-east-legon",
    routeName: "East Legon Route",
    busName: "Bus A",
    vehicleRegistration: "GW 2046-26",
    capacity: 32,
    driverName: "Kwame Asare",
    driverPhone: "+233 20 000 0002",
    stops: ["Lakeside Junction", "American House", "School Campus"],
  },
  {
    id: "route-adenta",
    routeName: "Adenta Route",
    busName: "Bus B",
    vehicleRegistration: "GT 1138-25",
    capacity: 28,
    driverName: "Esi Tetteh",
    driverPhone: "+233 20 000 0003",
    stops: ["Adenta Barrier", "Frafraha", "School Campus"],
  },
  {
    id: "route-spintex",
    routeName: "Spintex Route",
    busName: "Bus C",
    vehicleRegistration: "GN 8801-24",
    capacity: 30,
    driverName: "Joseph Nartey",
    driverPhone: "+233 20 000 0004",
    stops: ["Baatsona", "Flower Pot", "School Campus"],
  },
] satisfies readonly TransportRoute[];

export const mockTransportTrips = [
  {
    id: "trip-east-legon-001",
    routeId: "route-east-legon",
    date: "2026-06-23",
    direction: "morning",
    status: "on_route",
    lastUpdated: "2026-06-23T07:15:00.000Z",
    currentLocationLabel: "American House",
    nextStop: "School Campus",
  },
  {
    id: "trip-adenta-001",
    routeId: "route-adenta",
    date: "2026-06-23",
    direction: "morning",
    status: "arrived",
    lastUpdated: "2026-06-23T07:35:00.000Z",
    currentLocationLabel: "School Campus",
  },
  {
    id: "trip-spintex-001",
    routeId: "route-spintex",
    date: "2026-06-23",
    direction: "morning",
    status: "delayed",
    lastUpdated: "2026-06-23T07:10:00.000Z",
    currentLocationLabel: "Flower Pot",
    nextStop: "School Campus",
  },
] satisfies readonly TransportTrip[];

export const mockTransportAssignments = [
  {
    id: "transport-assignment-001",
    studentId: "student-001",
    routeId: "route-east-legon",
    pickupPoint: "Lakeside Junction",
    dropOffPoint: "Lakeside Junction",
    estimatedPickupTime: "06:45",
    estimatedDropOffTime: "16:20",
    feeStatus: "partially_paid",
  },
] satisfies readonly TransportAssignment[];

export const mockTransportNotices = [
  {
    id: "transport-notice-001",
    title: "Morning pickup window",
    description:
      "Families should arrive at assigned pickup points five minutes before the estimated time.",
    publishedAt: "2026-06-23",
  },
  {
    id: "transport-notice-002",
    title: "Spintex route delay",
    description:
      "The mock Spintex trip is marked delayed because of traffic near Flower Pot.",
    publishedAt: "2026-06-23",
    routeId: "route-spintex",
  },
] satisfies readonly TransportNotice[];
