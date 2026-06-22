import type { ReactNode } from "react";

export type DataTableRow = {
  readonly id: string;
  readonly cells: readonly ReactNode[];
};

type DataTableProps = {
  readonly caption: string;
  readonly columns: readonly string[];
  readonly rows: readonly DataTableRow[];
  readonly emptyMessage?: string;
};

export function DataTable({
  caption,
  columns,
  rows,
  emptyMessage = "No records are available.",
}: DataTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-soft-cream text-xs tracking-[0.08em] text-charcoal uppercase">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-5 py-4 font-bold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, index) => (
                  <td
                    key={`${row.id}-${columns[index] ?? index}`}
                    className="px-5 py-4 text-charcoal"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-center text-muted-grey"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
