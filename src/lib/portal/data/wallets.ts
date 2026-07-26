import "server-only";

import {
  mockFeedingBalances,
  mockTransportWalletBalances,
  mockWalletTransactions,
} from "@/data/portal/fees";
import { portalApiGet, useRealPortalAuth } from "@/lib/portal/data/api";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import type {
  FeedingBalance,
  TransportWalletBalance,
  WalletTransaction,
} from "@/types/portal";

export async function listFeedingBalances(): Promise<
  readonly FeedingBalance[]
> {
  if (!useRealPortalAuth) return mockFeedingBalances;
  return (
    await portalApiGet<{ balances?: FeedingBalance[] }>("/feeding-balances", {})
  ).balances ?? [];
}

export async function listTransportWalletBalances(): Promise<
  readonly TransportWalletBalance[]
> {
  if (!useRealPortalAuth) return mockTransportWalletBalances;
  return (
    await portalApiGet<{ balances?: TransportWalletBalance[] }>(
      "/transport-wallet-balances",
      {},
    )
  ).balances ?? [];
}

export async function listWalletTransactions(): Promise<
  readonly WalletTransaction[]
> {
  if (!useRealPortalAuth) return mockWalletTransactions;
  return (
    await portalApiGet<{ transactions?: WalletTransaction[] }>(
      "/wallet-transactions",
      {},
    )
  ).transactions ?? [];
}

export type ParentWallets = {
  readonly feeding: readonly FeedingBalance[];
  readonly transport: readonly TransportWalletBalance[];
  readonly transactions: readonly WalletTransaction[];
};

export async function getParentWallets(): Promise<ParentWallets> {
  if (useRealPortalAuth) {
    const data = await portalApiGet<ParentWallets>("/me/wallets", {
      feeding: [],
      transport: [],
      transactions: [],
    });
    return {
      feeding: data.feeding ?? [],
      transport: data.transport ?? [],
      transactions: data.transactions ?? [],
    };
  }

  const context = await getMockParentPortalContext();
  const ids = new Set((context?.students ?? []).map((student) => student.id));
  return {
    feeding: mockFeedingBalances.filter((item) => ids.has(item.studentId)),
    transport: mockTransportWalletBalances.filter((item) =>
      ids.has(item.studentId),
    ),
    transactions: mockWalletTransactions.filter((item) =>
      ids.has(item.studentId),
    ),
  };
}
