import "server-only";

import { mockConversations } from "@/data/portal/messages";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import { getMockPortalSession } from "@/lib/portal/mock-session";
import type { PortalConversation } from "@/types/portal";

export async function listConversations(): Promise<
  readonly PortalConversation[]
> {
  if (useRealPortalAuth) {
    return (
      await portalApiGet<{ conversations?: PortalConversation[] }>(
        "/me/conversations",
        {},
      )
    ).conversations ?? [];
  }

  const session = await getMockPortalSession();
  const role = session?.user.role;
  return mockConversations.filter(
    (conversation) => conversation.audience === role,
  );
}

export async function getConversation(
  id: string,
): Promise<PortalConversation | null> {
  const conversations = await listConversations();
  return conversations.find((conversation) => conversation.id === id) ?? null;
}
