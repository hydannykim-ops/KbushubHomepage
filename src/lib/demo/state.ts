import type {
  AdminVehicle,
  Agent,
  AssignmentHistory,
  Inquiry,
  Quote,
  SiteSettings,
  VehicleInternal,
  VehicleRequest,
} from "../domain/types";

export type DemoState = {
  settings: SiteSettings;
  vehicles: AdminVehicle[];
  inquiries: Inquiry[];
  quotes: Quote[];
  agents: Agent[];
  requests: VehicleRequest[];
  history: AssignmentHistory[];
};

export type { VehicleInternal };
