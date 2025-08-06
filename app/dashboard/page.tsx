// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/orders') // You'll implement this endpoint next
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <ul className="space-y-4">
        {orders.map((order: any, index: number) => (
          <li key={index} className="p-4 border rounded">
            <p><strong>Customer:</strong> {order.customerNumber}</p>
            <p><strong>Items:</strong> {order.items.join(', ')}</p>
            <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
