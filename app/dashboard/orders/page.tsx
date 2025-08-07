"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { 
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface Order {
  id: string;
  customer: string;
  items: string[];
  total: number;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => {
      return (row.getValue("items") as string[]).join(", ");
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      return `$${row.getValue("total")}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === "completed"
              ? "bg-green-100 text-green-800"
              : status === "failed"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    // Fetch orders
    fetch("/api/orders")
      .then((res) => res.json())
      .then(setOrders);
  }, []);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Orders</h2>
        <Button variant="outline" onClick={() => window.print()}>
          Export
        </Button>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left text-sm font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
