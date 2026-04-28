import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_COLORS } from '../constants'
import type { Expense } from '../types/expense'

type ExpenseChartsProps = {
  expenses: Expense[]
}

function aggregateByCategory(expenses: Expense[]) {
  const map = new Map<string, number>()
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.price)
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }))
}

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  const data = aggregateByCategory(expenses)
  const hasData = data.some((d) => d.value > 0)

  if (!hasData) {
    return (
      <div className="charts-grid">
        <section className="chart-card" aria-labelledby="summary-heading">
          <h3 id="summary-heading" className="chart-card-title">
            Expense Summary
          </h3>
          <p className="chart-placeholder">Add expenses to see category breakdown.</p>
        </section>
        <section className="chart-card" aria-labelledby="trends-heading">
          <h3 id="trends-heading" className="chart-card-title">
            Expense Trends
          </h3>
          <p className="chart-placeholder">Spending by category will appear here.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="charts-grid">
      <section className="chart-card" aria-labelledby="summary-heading">
        <h3 id="summary-heading" className="chart-card-title">
          Expense Summary
        </h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {data.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  typeof value === 'number'
                    ? value.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })
                    : String(value ?? '')
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card" aria-labelledby="trends-heading">
        <h3 id="trends-heading" className="chart-card-title">
          Expense Trends
        </h3>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 12 }}
                width={48}
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === 'number'
                    ? value.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })
                    : String(value ?? '')
                }
              />
              <Bar dataKey="value" name="Spent" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => (
                  <Cell
                    key={`bar-${i}`}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
