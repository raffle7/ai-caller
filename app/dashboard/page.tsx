// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Order {
  id: string;
  customerNumber: string;
  items: string[];
  total: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  popularItems: Array<{
    name: string;
    count: number;
  }>;
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    popularItems: [],
  });

  useEffect(() => {
    // Fetch orders
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        
        // Calculate statistics
        const totalRevenue = data.reduce((sum: number, order: any) => sum + order.total, 0);
        const popularItems = data.reduce((acc: any, order: any) => {
          order.items.forEach((item: any) => {
            acc[item] = (acc[item] || 0) + 1;
          });
          return acc;
        }, {});

        setStatistics({
          totalOrders: data.length,
          totalRevenue,
          avgOrderValue: totalRevenue / data.length,
          popularItems: Object.entries(popularItems)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([name, count]) => ({ name, count: count as number })),
        });
      });
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statistics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statistics.avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+12.3% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.popularItems[0]?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Ordered {statistics.popularItems[0]?.count || 0} times</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Popular Items</h2>
          <ul className="space-y-2">
            {statistics.popularItems.map((item: any, index: number) => (
              <li key={item.name} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.count} orders</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{order.customerNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="font-medium">${order.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Time</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Items</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Total</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">{order.customerNumber}</td>
                  <td className="px-6 py-4 text-sm">{order.items.join(", ")}</td>
                  <td className="px-6 py-4 text-sm">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === "completed" 
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
