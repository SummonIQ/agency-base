'use client';

import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface RevenueChartProps {
  data: Array<{
    period: string;
    revenue: number;
    leads: number;
    conversion: number;
  }>;
}

interface PipelineChartProps {
  data: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
}

interface LeadSourceChartProps {
  data: Array<{
    source: string;
    leads: number;
    qualified: number;
    converted: number;
    conversionRate: number;
    revenue: number;
  }>;
}

interface ForecastChartProps {
  data: Array<{
    quarter: string;
    conservative: number;
    optimistic: number;
    actual?: number;
  }>;
}

// Color palette for charts
const COLORS = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0891b2',
  muted: '#6b7280'
};

const PIE_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];

export function RevenueLineChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="period" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            name === 'revenue' ? `$${value.toLocaleString()}` : value,
            name === 'revenue' ? 'Revenue' : name === 'leads' ? 'Leads' : 'Conversion %'
          ]}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke={COLORS.primary}
          strokeWidth={3}
          dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
          name="Revenue"
        />
        <Line 
          type="monotone" 
          dataKey="leads" 
          stroke={COLORS.secondary}
          strokeWidth={2}
          dot={{ fill: COLORS.secondary, strokeWidth: 2, r: 3 }}
          name="Leads"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RevenueAreaChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="period" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke={COLORS.primary}
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PipelineBarChart({ data }: PipelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="stage" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis
          yAxisId="left"
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#94a3b8"
          fontSize={12}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            name === 'value' ? `$${value.toLocaleString()}` : value,
            name === 'value' ? 'Total Value' : 'Deal Count'
          ]}
        />
        <Legend />
        <Bar
          dataKey="count"
          yAxisId="left"
          fill={COLORS.primary}
          name="Deal Count"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="value" 
          fill={COLORS.secondary}
          name="Total Value"
          yAxisId="right"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LeadSourcePieChart({ data }: LeadSourceChartProps) {
  const pieData = data.map(item => ({
    name: item.source,
    value: item.revenue,
    leads: item.leads,
    conversionRate: item.conversionRate
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string, props: any) => [
            `$${value.toLocaleString()}`,
            `Revenue (${props.payload.leads} leads, ${props.payload.conversionRate}% conversion)`
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ConversionFunnelChart({ data }: LeadSourceChartProps) {
  const funnelData = data.map(item => ({
    source: item.source,
    leads: item.leads,
    qualified: item.qualified,
    converted: item.converted,
    conversionRate: item.conversionRate
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        layout="horizontal"
        data={funnelData} 
        margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis type="number" stroke="#64748b" fontSize={12} />
        <YAxis 
          type="category" 
          dataKey="source" 
          stroke="#64748b"
          fontSize={12}
          width={100}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Bar 
          dataKey="leads" 
          fill={COLORS.info}
          name="Total Leads"
          radius={[0, 4, 4, 0]}
        />
        <Bar 
          dataKey="qualified" 
          fill={COLORS.warning}
          name="Qualified"
          radius={[0, 4, 4, 0]}
        />
        <Bar 
          dataKey="converted" 
          fill={COLORS.success}
          name="Converted"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ForecastChart({ data }: ForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="quarter" 
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            `$${value.toLocaleString()}`,
            name === 'conservative' ? 'Conservative' : 
            name === 'optimistic' ? 'Optimistic' : 'Actual'
          ]}
        />
        <Legend />
        <Bar 
          dataKey="conservative" 
          fill={COLORS.warning}
          name="Conservative"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="optimistic" 
          fill={COLORS.success}
          name="Optimistic"
          radius={[4, 4, 0, 0]}
        />
        {data.some(d => d.actual) && (
          <Bar 
            dataKey="actual" 
            fill={COLORS.primary}
            name="Actual"
            radius={[4, 4, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ActivityChart({ data }: { data: Array<{ activity: string; count: number; target: number; completion: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="activity" 
          stroke="#64748b"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            value,
            name === 'count' ? 'Completed' : 'Target'
          ]}
        />
        <Legend />
        <Bar 
          dataKey="count" 
          fill={COLORS.primary}
          name="Completed"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="target" 
          fill={COLORS.muted}
          name="Target"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
