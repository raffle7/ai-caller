"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dailyData = [
  { name: "Mon", sales: 2400, orders: 24 },
  { name: "Tue", sales: 1398, orders: 18 },
  { name: "Wed", sales: 9800, orders: 42 },
  { name: "Thu", sales: 3908, orders: 28 },
  { name: "Fri", sales: 4800, orders: 32 },
  { name: "Sat", sales: 3800, orders: 26 },
  { name: "Sun", sales: 4300, orders: 30 },
];

const monthlyData = [
  { name: "Jan", sales: 24000, orders: 240 },
  { name: "Feb", sales: 13980, orders: 180 },
  { name: "Mar", sales: 98000, orders: 420 },
  { name: "Apr", sales: 39080, orders: 280 },
  { name: "May", sales: 48000, orders: 320 },
  { name: "Jun", sales: 38000, orders: 260 },
];

const topItems = [
  { name: "Pepperoni Pizza", sales: 12400, orders: 124 },
  { name: "Margherita Pizza", sales: 9800, orders: 98 },
  { name: "Buffalo Wings", sales: 7600, orders: 76 },
  { name: "Greek Salad", sales: 5400, orders: 54 },
  { name: "Garlic Knots", sales: 4200, orders: 42 },
];

export default function SalesPage() {
  const [timeframe, setTimeframe] = useState<"daily" | "monthly">("daily");
  const data = timeframe === "daily" ? dailyData : monthlyData;

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sales Analytics</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {timeframe === "daily" ? "Last 7 days" : "Last 6 months"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {timeframe === "daily" ? "Last 7 days" : "Last 6 months"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
