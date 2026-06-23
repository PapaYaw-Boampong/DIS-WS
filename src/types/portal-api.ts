import type { PortalRole } from "@/types/portal";

export type PortalApiMethod = "GET" | "POST" | "PATCH" | "DELETE";

export type PortalApiDomain =
  | "auth"
  | "identity"
  | "academics"
  | "courses"
  | "finance"
  | "transport"
  | "files"
  | "notifications"
  | "reports";

export type PortalApiContractStatus =
  | "contracted"
  | "planned"
  | "blocked"
  | "mocked";

export type PortalApiEndpointSpec = {
  readonly id: string;
  readonly domain: PortalApiDomain;
  readonly method: PortalApiMethod;
  readonly path: string;
  readonly summary: string;
  readonly roles: readonly PortalRole[];
  readonly frontendRoutes: readonly string[];
  readonly status: PortalApiContractStatus;
  readonly auditRequired: boolean;
  readonly notes?: string;
};

export type PortalBackendServiceSpec = {
  readonly id: string;
  readonly name: string;
  readonly responsibility: string;
  readonly plannedHost: "Render" | "External provider" | "Vercel frontend";
  readonly status: PortalApiContractStatus;
  readonly requiredSecretTypes: readonly string[];
  readonly notes: string;
};

export type PortalDataEntitySpec = {
  readonly entity: string;
  readonly plannedStore: "PostgreSQL" | "Object storage" | "Payment provider";
  readonly currentMockSource: string;
  readonly containsSensitiveData: boolean;
  readonly auditRequired: boolean;
  readonly notes: string;
};

export type PortalReadinessCheck = {
  readonly id: string;
  readonly area: string;
  readonly status: "ready" | "needs_backend" | "needs_decision";
  readonly detail: string;
};

export type PortalApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type PortalApiError = {
  readonly code: PortalApiErrorCode;
  readonly message: string;
  readonly fieldErrors?: Record<string, readonly string[]>;
  readonly requestId: string;
};

export type PortalApiEnvelope<TData> =
  | {
      readonly ok: true;
      readonly data: TData;
      readonly requestId: string;
    }
  | {
      readonly ok: false;
      readonly error: PortalApiError;
    };

export type PortalPaginatedResponse<TItem> = {
  readonly items: readonly TItem[];
  readonly pageInfo: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalItems: number;
    readonly totalPages: number;
  };
};
