export function getMemberStatusVariant(status: string): "default" | "outline" | "secondary" {
  switch (status) {
    case "active":
      return "default";
    case "pending":
      return "outline";
    default:
      return "secondary";
  }
}

export function formatMemberStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
