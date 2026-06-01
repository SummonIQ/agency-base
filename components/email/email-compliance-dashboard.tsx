'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  FileText,
  Globe,
  Mail,
  UserMinus,
  AlertCircle,
  Settings,
  Download
} from 'lucide-react';

export interface ComplianceData {
  gdpr: {
    status: 'compliant' | 'partial' | 'non_compliant';
    consentRate: number;
    doubleOptInRate: number;
    dataRetentionCompliance: boolean;
    rightToErasureRequests: number;
    lastAudit: string;
  };
  canSpam: {
    status: 'compliant' | 'partial' | 'non_compliant';
    physicalAddressIncluded: boolean;
    unsubscribeLinkPresent: boolean;
    unsubscribeProcessing: number; // days to process
    identificationClear: boolean;
    lastCheck: string;
  };
  deliverability: {
    spfRecord: boolean;
    dkimRecord: boolean;
    dmarcRecord: boolean;
    reputation: number;
    blacklistStatus: 'clean' | 'listed' | 'unknown';
    warningUp: boolean;
  };
  suppressions: {
    totalSuppressed: number;
    bounces: number;
    unsubscribes: number;
    spamComplaints: number;
    globalSuppressions: number;
  };
  audits: Array<{
    id: string;
    type: 'gdpr' | 'can_spam' | 'deliverability' | 'full';
    date: string;
    score: number;
    issues: string[];
    status: 'pass' | 'warning' | 'fail';
  }>;
}

interface EmailComplianceDashboardProps {
  data: ComplianceData;
  onRunAudit: (type: string) => void;
  onExportReport: () => void;
}

export function EmailComplianceDashboard({ 
  data, 
  onRunAudit, 
  onExportReport 
}: EmailComplianceDashboardProps) {
  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'non_compliant': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5" />;
      case 'partial': return <AlertTriangle className="h-5 w-5" />;
      case 'non_compliant': return <AlertCircle className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const overallScore = Math.round(
    ((data.gdpr.status === 'compliant' ? 30 : data.gdpr.status === 'partial' ? 15 : 0) +
     (data.canSpam.status === 'compliant' ? 30 : data.canSpam.status === 'partial' ? 15 : 0) +
     (data.deliverability.spfRecord ? 10 : 0) +
     (data.deliverability.dkimRecord ? 10 : 0) +
     (data.deliverability.dmarcRecord ? 10 : 0) +
     (data.deliverability.reputation >= 80 ? 10 : data.deliverability.reputation >= 60 ? 5 : 0))
  );

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Overall Score</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {overallScore}%
            </div>
            <Progress value={overallScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className={getComplianceColor(data.gdpr.status)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {getComplianceIcon(data.gdpr.status)}
              <span className="text-sm font-medium">GDPR</span>
            </div>
            <div className="text-2xl font-bold capitalize">
              {data.gdpr.status.replace('_', ' ')}
            </div>
            <div className="text-sm opacity-75">
              {data.gdpr.consentRate}% consent rate
            </div>
          </CardContent>
        </Card>

        <Card className={getComplianceColor(data.canSpam.status)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              {getComplianceIcon(data.canSpam.status)}
              <span className="text-sm font-medium">CAN-SPAM</span>
            </div>
            <div className="text-2xl font-bold capitalize">
              {data.canSpam.status.replace('_', ' ')}
            </div>
            <div className="text-sm opacity-75">
              {data.canSpam.unsubscribeProcessing}d unsubscribe
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <UserMinus className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Suppressions</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {data.suppressions.totalSuppressed.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Total suppressed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GDPR Compliance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-6 w-6" />
              GDPR Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Consent Rate</span>
                <div className="flex items-center gap-2">
                  <Progress value={data.gdpr.consentRate} className="w-20 h-2" />
                  <span className="text-sm font-medium">{data.gdpr.consentRate}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Double Opt-in Rate</span>
                <div className="flex items-center gap-2">
                  <Progress value={data.gdpr.doubleOptInRate} className="w-20 h-2" />
                  <span className="text-sm font-medium">{data.gdpr.doubleOptInRate}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Data Retention Compliance</span>
                {data.gdpr.dataRetentionCompliance ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Right to Erasure Requests</span>
                <span className="text-sm font-medium">{data.gdpr.rightToErasureRequests}</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600">
                Last audit: {new Date(data.gdpr.lastAudit).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              CAN-SPAM Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Physical Address Included</span>
                {data.canSpam.physicalAddressIncluded ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Unsubscribe Link Present</span>
                {data.canSpam.unsubscribeLinkPresent ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Clear Identification</span>
                {data.canSpam.identificationClear ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Unsubscribe Processing</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{data.canSpam.unsubscribeProcessing} days</span>
                  {data.canSpam.unsubscribeProcessing <= 10 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="text-sm text-gray-600">
                Last check: {new Date(data.canSpam.lastCheck).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Email Authentication & Deliverability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`p-3 rounded-lg mb-2 ${data.deliverability.spfRecord ? 'bg-green-50' : 'bg-red-50'}`}>
                {data.deliverability.spfRecord ? (
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
                )}
              </div>
              <div className="font-semibold">SPF Record</div>
              <div className="text-sm text-gray-500">
                {data.deliverability.spfRecord ? 'Configured' : 'Missing'}
              </div>
            </div>

            <div className="text-center">
              <div className={`p-3 rounded-lg mb-2 ${data.deliverability.dkimRecord ? 'bg-green-50' : 'bg-red-50'}`}>
                {data.deliverability.dkimRecord ? (
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
                )}
              </div>
              <div className="font-semibold">DKIM Record</div>
              <div className="text-sm text-gray-500">
                {data.deliverability.dkimRecord ? 'Configured' : 'Missing'}
              </div>
            </div>

            <div className="text-center">
              <div className={`p-3 rounded-lg mb-2 ${data.deliverability.dmarcRecord ? 'bg-green-50' : 'bg-red-50'}`}>
                {data.deliverability.dmarcRecord ? (
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
                )}
              </div>
              <div className="font-semibold">DMARC Record</div>
              <div className="text-sm text-gray-500">
                {data.deliverability.dmarcRecord ? 'Configured' : 'Missing'}
              </div>
            </div>

            <div className="text-center">
              <div className="p-3 bg-blue-50 rounded-lg mb-2">
                <div className="text-2xl font-bold text-blue-600">
                  {data.deliverability.reputation}
                </div>
              </div>
              <div className="font-semibold">Sender Reputation</div>
              <div className="text-sm text-gray-500">
                {data.deliverability.reputation >= 80 ? 'Excellent' : 
                 data.deliverability.reputation >= 60 ? 'Good' : 'Needs Work'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suppression Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserMinus className="h-6 w-6" />
              Suppression Lists
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Lists
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {data.suppressions.bounces.toLocaleString()}
              </div>
              <div className="text-sm text-red-700">Hard Bounces</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {data.suppressions.unsubscribes.toLocaleString()}
              </div>
              <div className="text-sm text-yellow-700">Unsubscribes</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {data.suppressions.spamComplaints.toLocaleString()}
              </div>
              <div className="text-sm text-orange-700">Spam Reports</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {data.suppressions.globalSuppressions.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700">Global Suppressions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Audits */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Recent Audits
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onRunAudit('gdpr')}>
                GDPR Audit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onRunAudit('full')}>
                Full Audit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.audits.slice(0, 5).map((audit) => (
              <div key={audit.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={
                      audit.status === 'pass' ? 'bg-green-100 text-green-800' :
                      audit.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {audit.status}
                    </Badge>
                    <span className="font-semibold capitalize">{audit.type} Audit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(audit.date).toLocaleDateString()}
                    </span>
                    <div className="text-lg font-semibold">
                      {audit.score}%
                    </div>
                  </div>
                </div>

                {audit.issues.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Issues Found:</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {audit.issues.slice(0, 3).map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-yellow-600 mt-1 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                      {audit.issues.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{audit.issues.length - 3} more issues
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      <div className="space-y-4">
        {data.gdpr.status !== 'compliant' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              GDPR compliance issues detected. Consider implementing double opt-in and reviewing consent management processes.
            </AlertDescription>
          </Alert>
        )}

        {data.canSpam.status !== 'compliant' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              CAN-SPAM compliance issues found. Ensure all emails include physical address and functioning unsubscribe links.
            </AlertDescription>
          </Alert>
        )}

        {(!data.deliverability.spfRecord || !data.deliverability.dkimRecord || !data.deliverability.dmarcRecord) && (
          <Alert className="border-orange-200 bg-orange-50">
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Email authentication records are incomplete. Configure SPF, DKIM, and DMARC records to improve deliverability.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
