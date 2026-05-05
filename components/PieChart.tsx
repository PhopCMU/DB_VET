"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

interface DataItem {
  name: string;
  value: number;
}

const COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6"];

export default function BarChartComponent({ data }: { data: DataItem[] }) {
  // Calculate total for percentage calculation
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="w-full h-[150px]">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <XAxis
            dataKey="name"
            tick={{
              fill: "#4B5563",
              fontSize: 12,
            }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            tick={{
              fill: "#4B5563",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "8px",
              color: "#1F2937",
              fontSize: "12px",
              padding: "10px",
            }}
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
          />
          <Legend
            verticalAlign="top"
            height={24}
            formatter={(value) => (
              <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                {value ? value : "Unknown"}
              </span>
            )}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            animationDuration={800}
            animationEasing="ease-out"
            label={{
              position: "top",
              formatter: (value: number) =>
                `${value ? ((value / total) * 100).toFixed(0) : "0"}%`,
              fill: "#1F2937",
              fontSize: 12,

              offset: 8,
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
