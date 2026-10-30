import React from 'react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarDataItem {
  name: string;
  ingresos: number;
}

interface EvolucionBarChartProps {
  data: BarDataItem[];
}

export const EvolucionBarChart: React.FC<
  EvolucionBarChartProps
> = ({ data }) => {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 0,
          left: -20,
          bottom: 0,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#f0f0f0"
        />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: '#9ca3af',
          }}
          dy={10}
        />

        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#8884d8"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 12,
            fill: '#9ca3af',
          }}
        />

        <Tooltip
          cursor={{
            fill: '#f9fafb',
          }}
          formatter={(value) => [
            `S/ ${Number(
              value ?? 0
            ).toFixed(2)}`,
            'Ingresos',
          ]}
        />

        <Bar
          yAxisId="left"
          dataKey="ingresos"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
          name="Ingresos (S/)"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};