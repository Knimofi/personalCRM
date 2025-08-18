
import React from 'react';
import { Contact } from '@/types/contact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getWeeklyContactStats, getCountryStats } from '@/utils/statisticsUtils';
import { Calendar, MapPin } from 'lucide-react';

interface StatisticsChartsProps {
  contacts: Contact[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const StatisticsCharts = ({ contacts }: StatisticsChartsProps) => {
  const weeklyStats = getWeeklyContactStats(contacts);
  const countryStats = getCountryStats(contacts).slice(0, 6); // Show top 6 countries

  const chartConfig = {
    contacts: {
      label: 'Contacts',
      color: '#3B82F6',
    }
  };

  const pieChartConfig = countryStats.reduce((config, stat, index) => {
    config[stat.country] = {
      label: stat.country,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as any);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weekly Activity (Last 12 Weeks)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats}>
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="contacts" 
                  fill="var(--color-contacts)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Country Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Contacts by Country</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieChartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={countryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="contacts"
                  label={({ country, percentage }) => `${country} (${percentage}%)`}
                >
                  {countryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow">
                          <p className="font-medium">{data.country}</p>
                          <p className="text-sm text-gray-600">
                            Contacts: {data.contacts} ({data.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};
