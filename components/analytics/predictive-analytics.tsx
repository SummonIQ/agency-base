'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Shield, 
  Target, 
  Brain,
  Users,
  DollarSign,
  Calendar,
  ChevronRight
} from 'lucide-react';
import type { 
  PredictiveInsight, 
  RevenueProjection, 
  ChurnPrediction, 
  OpportunityPrediction 
} from '@/lib/analytics/predictive-analytics-service';

interface PredictiveAnalyticsProps {
  insights: PredictiveInsight[];
  projections: RevenueProjection[];
  churnPredictions: ChurnPrediction[];
  opportunities: OpportunityPrediction[];
}

export function PredictiveAnalyticsDashboard({ 
  insights, 
  projections, 
  churnPredictions, 
  opportunities 
}: PredictiveAnalyticsProps) {
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'churn': return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'risk': return <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default: return <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-200';
      case 'low': return 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Key Insights Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">AI Insights</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {insights.length}
            </div>
            <div className="text-xs text-gray-500">Generated insights</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">Revenue Forecast</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${projections[0]?.likely.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-500">Next month projection</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium">Churn Risk</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {churnPredictions.length}
            </div>
            <div className="text-xs text-gray-500">Clients at risk</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium">Opportunities</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${opportunities.reduce((sum, opp) => sum + opp.potential, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Potential revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Projections Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            6-Month Revenue Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={projections}>
              <defs>
                <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorLikely" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString()}`,
                  name.charAt(0).toUpperCase() + name.slice(1)
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="optimistic" 
                stackId="1"
                stroke="#059669"
                fill="url(#colorOptimistic)"
                name="Optimistic"
              />
              <Area 
                type="monotone" 
                dataKey="likely" 
                stackId="2"
                stroke="#2563eb"
                fill="url(#colorLikely)"
                name="Likely"
              />
              <Area 
                type="monotone" 
                dataKey="conservative" 
                stackId="3"
                stroke="#d97706"
                fill="url(#colorConservative)"
                name="Conservative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI-Generated Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h3 className="font-semibold">{insight.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact} impact
                    </Badge>
                    <Badge variant="outline">
                      <span className={getConfidenceColor(insight.confidence)}>
                        {insight.confidence}% confident
                      </span>
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timeframe: {insight.timeframe}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Churn Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              Client Churn Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {churnPredictions.map((prediction) => (
                <div key={prediction.clientId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{prediction.clientName}</h3>
                    <Badge variant="destructive">
                      {Math.round(prediction.churnProbability * 100)}% risk
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Churn Probability</span>
                      <span>{Math.round(prediction.churnProbability * 100)}%</span>
                    </div>
                    <Progress 
                      value={prediction.churnProbability * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Risk Factors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {prediction.riskFactors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Retention Actions:</span>
                      <ul className="text-xs mt-1 space-y-1">
                        {prediction.retentionActions.slice(0, 2).map((action, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <ChevronRight className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Badge className="mb-2 capitalize">
                        {opportunity.type.replace('_', ' ')}
                      </Badge>
                      <p className="font-medium">{opportunity.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${opportunity.potential.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round(opportunity.probability * 100)}% likely
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Probability</span>
                      <span>{Math.round(opportunity.probability * 100)}%</span>
                    </div>
                    <Progress 
                      value={opportunity.probability * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Timeline: {opportunity.timeline}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Action Items:</span>
                      <ul className="text-xs mt-1 space-y-1">
                        {opportunity.actions.slice(0, 2).map((action, actionIndex) => (
                          <li key={actionIndex} className="flex items-start gap-1">
                            <ChevronRight className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
