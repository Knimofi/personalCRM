
import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Contact } from '@/types/contact';
import { getWeeklyContactStats, getCountryStats } from '@/utils/statisticsUtils';

interface StatisticsChartsProps {
  contacts: Contact[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export const StatisticsCharts = ({ contacts }: StatisticsChartsProps) => {
  const weeklyStats = getWeeklyContactStats(contacts);
  const countryStats = getCountryStats(contacts).slice(0, 8); // Top 8 countries

  return (
    <div className="space-y-8">
      {/* Weekly Contacts Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">New Contacts by Week</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="contacts" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Country Distribution Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contacts by Country</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={countryStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ country, percentage }) => `${country} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="contacts"
              >
                {countryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
