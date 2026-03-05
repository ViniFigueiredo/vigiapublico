import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell } from
'recharts';
import { Party } from '../services/api';
import { formatCompactCurrency } from '../utils/formatters';
import { Card } from './ui/Card';
interface MiniBarChartProps {
  data: Party[];
}
export function MiniBarChart({ data }: MiniBarChartProps) {

  const chartData = data.slice(0, 8);
  return (
    <Card className="flex flex-col h-[400px]">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-navy-900">
          Distribuição de Gastos
        </h2>
        <p className="text-sm text-slate-500">Top 8 partidos por volume</p>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{
              top: 0,
              right: 30,
              left: 40,
              bottom: 0
            }}>

            <XAxis type="number" hide />
            <YAxis
              dataKey="abbr"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#64748B',
                fontSize: 12,
                fontWeight: 500
              }}
              width={50} />

            <Tooltip
              cursor={{
                fill: '#F1F5F9'
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [
              formatCompactCurrency(value),
              'Gasto Total']
              }
              labelStyle={{
                color: '#1B2A4A',
                fontWeight: 'bold'
              }} />

            <Bar dataKey="spent" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) =>
              <Cell key={`cell-${index}`} fill={entry.color} />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Menor: {chartData[chartData.length - 1].abbr}</span>
          <span>Maior: {chartData[0].abbr}</span>
        </div>
      </div>
    </Card>);

}