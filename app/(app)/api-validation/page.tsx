'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Key,
  Database,
  Mail,
  Linkedin,
  Search,
  TrendingUp,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import type { SystemValidation, APIValidationResult } from '@/lib/validation/api-validation-service';

interface EnvironmentVariable {
  variable: string;
  present: boolean;
  description: string;
}

export default function APIValidation() {
  const [validation, setValidation] = useState<SystemValidation | null>(null);
  const [environment, setEnvironment] = useState<EnvironmentVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadValidationData();
  }, []);

  const loadValidationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/validation/apis?include_env=true');
      const data = await response.json();
      
      if (data.success) {
        setValidation(data.validation);
        setEnvironment(data.environment || []);
      }
    } catch (error) {
      console.error('Failed to load validation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateAll = async () => {
    try {
      setValidating(true);
      const response = await fetch('/api/validation/apis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'validate_all' }),
      });
      const data = await response.json();
      
      if (data.success) {
        setValidation(data.validation);
      }
    } catch (error) {
      console.error('Failed to validate APIs:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleValidateService = async (serviceName: string) => {
    try {
      const response = await fetch('/api/validation/apis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'validate_service',
          service: serviceName 
        }),
      });
      const data = await response.json();
      
      if (data.success && validation) {
        // Update the specific service in the validation results
        const updatedServices = validation.services.map(service => 
          service.service === serviceName ? data.validation : service
        );
        
        setValidation({
          ...validation,
          services: updatedServices,
        });
      }
    } catch (error) {
      console.error(`Failed to validate ${serviceName}:`, error);
    }
  };

  const getStatusIcon = (result: APIValidationResult) => {
    if (result.isValid) {
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    
    switch (result.status) {
      case 'missing_key':
        return <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'invalid_key':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default:
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
    }
  };

  const getStatusBadge = (result: APIValidationResult) => {
    if (result.isValid) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200">Connected</Badge>;
    }
    
    switch (result.status) {
      case 'missing_key':
        return <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">Missing Key</Badge>;
      case 'invalid_key':
        return <Badge variant="destructive">Invalid Key</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-orange-600 dark:text-orange-400">Error</Badge>;
      default:
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'Apollo.io':
        return <Database className="h-6 w-6" />;
      case 'SendGrid':
        return <Mail className="h-6 w-6" />;
      case 'LinkedIn':
        return <Linkedin className="h-6 w-6" />;
      default:
        return <Settings className="h-6 w-6" />;
    }
  };

  const getOverallStatusColor = () => {
    if (!validation) return 'text-gray-500';
    
    switch (validation.overall.status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'partial':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading API validation data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              API Validation Dashboard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Monitor and validate all API integrations for your business system
          </p>
        </div>

        {/* Overall Status */}
        {validation && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  System Health Overview
                </span>
                <Button 
                  onClick={handleValidateAll}
                  disabled={validating}
                  size="sm"
                >
                  {validating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Validate All
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getOverallStatusColor()}`}>
                    {validation.overall.status.charAt(0).toUpperCase() + validation.overall.status.slice(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Status</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {validation.overall.connectedServices}/{validation.overall.totalServices}
                  </div>
                  <div className="text-sm text-muted-foreground">Services Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {Math.round((validation.overall.connectedServices / validation.overall.totalServices) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Integration Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">
                    {new Date(validation.overall.lastValidated).toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Last Validated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Status Cards */}
        {validation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {validation.services.map((service) => (
              <Card key={service.service} className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(service.service)}
                      <span>{service.service}</span>
                    </div>
                    {getStatusIcon(service)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    {getStatusBadge(service)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {service.message}
                  </div>

                  {service.details && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Details:</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {Object.entries(service.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {new Date(service.lastTested).toLocaleTimeString()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleValidateService(service.service)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-6 w-6" />
              Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {environment.map((env) => (
                <div key={env.variable} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{env.variable}</div>
                    <div className="text-sm text-muted-foreground">{env.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {env.present ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Present
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                        <XCircle className="h-3 w-3 mr-1" />
                        Missing
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {validation && validation.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-6 w-6" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validation.recommendations.map((recommendation, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{recommendation}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <ExternalLink className="h-6 w-6" />
                <span>Apollo.io Dashboard</span>
                <span className="text-xs text-muted-foreground">Manage API keys</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <ExternalLink className="h-6 w-6" />
                <span>SendGrid Console</span>
                <span className="text-xs text-muted-foreground">Configure email settings</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <ExternalLink className="h-6 w-6" />
                <span>LinkedIn Developers</span>
                <span className="text-xs text-muted-foreground">API documentation</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
