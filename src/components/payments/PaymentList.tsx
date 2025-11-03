"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth/useAuthStore";

interface Payment {
  id: number;
  amount: number;
  due_date: string;
  status: string;
}

export default function PaymentList({ userId }: { userId: number }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const getAccessToken = useAuthStore((state) => state.getAccessToken);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    fetch(`/api/payments/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
      .then(async (res) => {
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `Failed to fetch payments: ${res.status}`);
        }
        return ct.includes("application/json") ? res.json() : res.text();
      })
      .then((data) => setPayments(Array.isArray(data) ? data : data?.data || []))
      .catch((err) => console.error("Payment fetch error:", err))
      .finally(() => setLoading(false));
  }, [userId, getAccessToken]);

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <p className="text-gray-500 text-sm">Loading payment schedule...</p>
      </div>
    );

  if (payments.length === 0)
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <p className="text-gray-500 text-sm">No payment records found.</p>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        Payment Schedule
      </h3>

      <ul className="divide-y divide-gray-200">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="py-3 flex justify-between items-center"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                Due: {new Date(payment.due_date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                Status: {payment.status}
              </p>
            </div>
            <p className="font-semibold text-blue-600">${payment.amount}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
