"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AccuracyChart({
  data,
}: {
  data: { date: string; accuracy: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) =>
            new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          }
        />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
