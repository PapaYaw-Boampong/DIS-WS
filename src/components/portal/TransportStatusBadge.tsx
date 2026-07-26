import { StatusBadge } from "@/components/portal/StatusBadge";
import { formatTransportStatus } from "@/lib/portal/format";
import type { TransportTripStatus } from "@/types/portal";

type TransportStatusBadgeProps = {
  readonly status: TransportTripStatus;
};

export function TransportStatusBadge({
  status,
}: TransportStatusBadgeProps) {
  if (
    status === "arrived" ||
    status === "picked_up" ||
    status === "dropped_off"
  ) {
    return (
      <StatusBadge variant="success">
        {formatTransportStatus(status)}
      </StatusBadge>
    );
  }

  if (status === "delayed") {
    return (
      <StatusBadge variant="warning">
        {formatTransportStatus(status)}
      </StatusBadge>
    );
  }

  if (status === "cancelled") {
    return (
      <StatusBadge variant="danger">
        {formatTransportStatus(status)}
      </StatusBadge>
    );
  }

  if (status === "on_route" || status === "departed") {
    return (
      <StatusBadge variant="info">
        {formatTransportStatus(status)}
      </StatusBadge>
    );
  }

  return <StatusBadge>{formatTransportStatus(status)}</StatusBadge>;
}
