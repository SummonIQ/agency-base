'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Database, 
  Linkedin, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Key,
  Globe,
  Zap,
  Shield,
  ExternalLink
} from 'lucide-react';

interface IntegrationConfig {
  name: string;
  description: string;
  icon: any;
  status: 'connected' | 'disconnected' | 'error';
  fields: {
    label: string;
    key: string;
    type: 'text' | 'password' | 'url';
    placeholder: string;
    required: boolean;
  }[];
  testEndpoint?: string;
  documentation?: string;
}

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState('email');
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const integrations: Record<string, IntegrationConfig> = {
    sendgrid: {
      name: 'SendGrid',
      description: 'Email delivery and automation platform',
      icon: Mail,
      status: 'disconnected',
      fields: [
        {
          label: 'API Key',
          key: 'apiKey',
          type: 'password',
          placeholder: 'SG.xxxxxxxxxx',
          required: true
        },
        {
          label: 'From Email',
          key: 'fromEmail',
          type: 'text',
          placeholder: 'noreply@yourdomain.com',
          required: true
        },
        {
          label: 'From Name',
          key: 'fromName',
          type: 'text',
          placeholder: 'Your Business Name',
          required: true
        }
      ],
      testEndpoint: '/api/email/test-connection',
      documentation: 'https://docs.sendgrid.com/for-developers/sending-email/api-getting-started'
    },
    apollo: {
      name: 'Apollo.io',
      description: 'B2B lead generation and data enrichment',
      icon: Database,
      status: 'disconnected',
      fields: [
        {
          label: 'API Key',
          key: 'apiKey',
          type: 'password',
          placeholder: 'apollo_api_key_xxxxxxxxxx',
          required: true
        },
        {
          label: 'Base URL',
          key: 'baseUrl',
          type: 'url',
          placeholder: 'https://api.apollo.io/v1',
          required: true
        }
      ],
      testEndpoint: '/api/leads/test-apollo',
      documentation: 'https://apolloio.github.io/apollo-api-docs/'
    },
    zoominfo: {
      name: 'ZoomInfo',
      description: 'Premium B2B contact and company database',
      icon: Globe,
      status: 'disconnected',
      fields: [
        {
          label: 'API Key',
          key: 'apiKey',
          type: 'password',
          placeholder: 'zi_api_key_xxxxxxxxxx',
          required: true
        },
        {
          label: 'Username',
          key: 'username',
          type: 'text',
          placeholder: 'your-username',
          required: true
        }
      ],
      testEndpoint: '/api/leads/test-zoominfo',
      documentation: 'https://api-docs.zoominfo.com/'
    },
    linkedin: {
      name: 'LinkedIn Sales Navigator',
      description: 'Professional networking and lead generation',
      icon: Linkedin,
      status: 'disconnected',
      fields: [
        {
          label: 'Client ID',
          key: 'clientId',
          type: 'text',
          placeholder: 'linkedin_client_id',
          required: true
        },
        {
          label: 'Client Secret',
          key: 'clientSecret',
          type: 'password',
          placeholder: 'linkedin_client_secret',
          required: true
        },
        {
          label: 'Redirect URI',
          key: 'redirectUri',
          type: 'url',
          placeholder: 'https://yourdomain.com/auth/linkedin/callback',
          required: true
        }
      ],
      testEndpoint: '/api/linkedin/test-connection',
      documentation: 'https://docs.microsoft.com/en-us/linkedin/marketing/getting-started'
    }
  };

  const handleConfigChange = (integration: string, field: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        [field]: value
      }
    }));
  };

  const handleTestConnection = async (integration: string) => {
    setTesting(prev => ({ ...prev, [integration]: true }));
    
    try {
      const config = configs[integration];
      const endpoint = integrations[integration].testEndpoint;
      
      if (!endpoint) {
        throw new Error('Test endpoint not configured');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      
      if (result.success) {
        // Update integration status
        integrations[integration].status = 'connected';
        alert('Connection successful!');
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      alert(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      integrations[integration].status = 'error';
    } finally {
      setTesting(prev => ({ ...prev, [integration]: false }));
    }
  };

  const handleSaveConfig = async (integration: string) => {
    try {
      const config = configs[integration];
      
      const response = await fetch('/api/settings/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          integration,
          config
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Configuration saved successfully!');
      } else {
        throw new Error(result.error || 'Save failed');
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Not Connected</Badge>;
    }
  };

  const renderIntegrationCard = (key: string, integration: IntegrationConfig) => (
    <Card key={key} className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
              <integration.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </div>
          </div>
          {getStatusBadge(integration.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {integration.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`${key}-${field.key}`}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Input
                id={`${key}-${field.key}`}
                type={field.type}
                placeholder={field.placeholder}
                value={configs[key]?.[field.key] || ''}
                onChange={(e) => handleConfigChange(key, field.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {integration.documentation && (
              <Button variant="outline" size="sm" asChild>
                <a href={integration.documentation} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Docs
                </a>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestConnection(key)}
              disabled={testing[key]}
            >
              {testing[key] ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleSaveConfig(key)}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              API Integrations
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect your business tools to unlock automation and data enrichment capabilities
          </p>
        </div>

        {/* Setup Instructions */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Note:</strong> API keys are encrypted and stored securely. Never share your API keys or commit them to version control.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Lead Data
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              Social
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-6">
            <div className="grid gap-6">
              {renderIntegrationCard('sendgrid', integrations.sendgrid)}
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {renderIntegrationCard('apollo', integrations.apollo)}
              {renderIntegrationCard('zoominfo', integrations.zoominfo)}
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <div className="grid gap-6">
              {renderIntegrationCard('linkedin', integrations.linkedin)}
            </div>
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>
                  Configure automation rules and safety limits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Email Automation</Label>
                    <p className="text-sm text-muted-foreground">Allow automated email sequences</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable LinkedIn Automation</Label>
                    <p className="text-sm text-muted-foreground">Allow automated LinkedIn outreach</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Daily Send Limit</Label>
                    <p className="text-sm text-muted-foreground">Maximum emails per day</p>
                  </div>
                  <Input type="number" placeholder="50" className="w-20" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
