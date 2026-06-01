'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Settings,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface EmailProviderSetupProps {
  onSetupComplete?: () => void;
}

export function EmailProviderSetup({ onSetupComplete }: EmailProviderSetupProps) {
  const [provider, setProvider] = useState<'sendgrid' | 'mailgun' | null>(null);
  const [config, setConfig] = useState({
    apiKey: '',
    fromEmail: '',
    fromName: '',
    webhookUrl: ''
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const handleTestConnection = async () => {
    if (!config.apiKey || !config.fromEmail || !config.fromName) {
      setTestResult({
        success: false,
        message: 'Please fill in all required fields'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/email/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: config.apiKey,
          fromEmail: config.fromEmail,
          fromName: config.fromName
        })
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Connection successful! Email provider is configured correctly.',
          details: result.details
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Connection test failed',
          details: result.details
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Network error occurred while testing connection'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!testResult?.success) {
      setTestResult({
        success: false,
        message: 'Please test the connection first'
      });
      return;
    }

    try {
      const response = await fetch('/api/email/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          ...config
        })
      });

      if (response.ok) {
        onSetupComplete?.();
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const getWebhookUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com';
    return `${baseUrl}/api/email/webhook?provider=${provider}`;
  };

  if (!provider) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" />
          <h2 className="text-2xl font-bold">Choose Email Provider</h2>
          <p className="text-muted-foreground">
            Select an email service provider to enable automation features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
            onClick={() => setProvider('sendgrid')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                SendGrid
                <Badge className="ml-auto">Recommended</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Industry-leading email delivery platform with excellent deliverability rates
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    99%+ deliverability rate
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Easy setup and integration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Real-time analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Comprehensive webhook support
                  </li>
                </ul>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Pricing: $15-50/month • Free tier available
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-200"
            onClick={() => setProvider('mailgun')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-purple-600" />
                </div>
                Mailgun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Developer-friendly email service with powerful APIs and advanced features
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Developer-focused platform
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Advanced email validation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Detailed logging and analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Flexible API design
                  </li>
                </ul>
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Pricing: $35+/month • Free tier with limitations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setProvider(null)}
        >
          ← Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Configure {provider === 'sendgrid' ? 'SendGrid' : 'Mailgun'}</h2>
          <p className="text-muted-foreground">
            Set up your email provider to enable automation features
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={`Enter your ${provider} API key`}
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              {provider === 'sendgrid'
                ? 'Find your API key in SendGrid Settings > API Keys'
                : 'Find your API key in Mailgun Dashboard > Settings > API Keys'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email *</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="noreply@yourdomain.com"
                value={config.fromEmail}
                onChange={(e) => setConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name *</Label>
              <Input
                id="fromName"
                placeholder="Your Business Name"
                value={config.fromName}
                onChange={(e) => setConfig(prev => ({ ...prev, fromName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhookUrl"
                value={getWebhookUrl()}
                readOnly
                className="bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(getWebhookUrl())}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure this URL in your {provider} dashboard to enable tracking
            </p>
          </div>
        </CardContent>
      </Card>

      {provider === 'sendgrid' && (
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>SendGrid Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Go to <a href="https://app.sendgrid.com/settings/api_keys" target="_blank" className="text-blue-600 hover:underline">SendGrid API Keys</a></li>
              <li>Click "Create API Key" with "Full Access" permissions</li>
              <li>Copy the API key and paste it above</li>
              <li>Verify your sender email in SendGrid Authentication</li>
              <li>Configure the webhook URL in Mail Settings > Event Webhook</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {provider === 'mailgun' && (
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Mailgun Setup Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Go to <a href="https://app.mailgun.com/app/account/security/api_keys" target="_blank" className="text-blue-600 hover:underline">Mailgun API Keys</a></li>
              <li>Copy your Private API key</li>
              <li>Verify your domain in Mailgun Domains</li>
              <li>Configure webhooks in your domain settings</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleTestConnection}
          disabled={testing || !config.apiKey || !config.fromEmail || !config.fromName}
          className="flex items-center gap-2"
        >
          {testing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Settings className="h-4 w-4" />
          )}
          Test Connection
        </Button>

        {testResult?.success && (
          <Button
            onClick={handleSaveConfiguration}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Save Configuration
          </Button>
        )}
      </div>

      {testResult && (
        <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {testResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            <div className="space-y-1">
              <p className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                {testResult.message}
              </p>
              {testResult.details && (
                <p className="text-xs text-muted-foreground">
                  {testResult.details}
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}