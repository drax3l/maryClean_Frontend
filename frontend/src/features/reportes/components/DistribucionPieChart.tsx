import React from 'react';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PieDataItem {
  name: string;
  value: number;
}

interface DistribucionPieChartProps {
  data: PieDataItem[];
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#FFC658',
];

export const DistribucionPieChart: React.FC<
  DistribucionPieChartProps
> = ({ data }) => {
  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((item, index) => (
            <Cell
              key={`${item.name}-${index}`}
              fill={
                COLORS[
                  index % COLORS.length
                ]
              }
            />
          ))}
        </Pie>

        <Tooltip
          formatter={(value) =>
            `S/ ${Number(
              value ?? 0
            ).toFixed(2)}`
          }
        />

        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};