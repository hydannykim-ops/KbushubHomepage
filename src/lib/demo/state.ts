import type {
  AdminVehicle,
  Agent,
  AssignmentHistory,
  Inquiry,
  Member,
  Quote,
  SiteSettings,
  VehicleInternal,
  VehicleRequest,
} from "../domain/types";

export type StoredMember = Member & { passwordHash: string };

export type DemoState = {
  settings: SiteSettings;
  vehicles: AdminVehicle[];
  inquiries: Inquiry[];
  quotes: Quote[];
  agents: Agent[];
  requests: VehicleRequest[];
  history: AssignmentHistory[];
  members: StoredMember[];
};

export type { VehicleInternal };
