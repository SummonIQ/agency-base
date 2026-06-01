'use client';

import { useState } from 'react';
import { LeadSearchModal } from '@/components/leads/lead-search-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Database, 
  Search, 
  Users, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Download,
  Upload,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';

interface LeadData {
  id: string;
  name: string;
  email: string;
  company: string;
  title: string;
  location: string;
  industry: string;
  company_size: string;
  revenue: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  source: 'apollo' | 'zoominfo' | 'manual';
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  score: number;
  last_contact?: string;
}

interface SearchFilter {
  industry: string;
  location: string;
  company_size: string;
  title_keywords: string;
  revenue_range: string;
}

export default function LeadDataIntegration() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [enrichEmail, setEnrichEmail] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilter>({
    industry: '',
    location: '',
    company_size: '',
    title_keywords: '',
    revenue_range: ''
  });

  const [leads, setLeads] = useState<LeadData[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      company: 'TechCorp Solutions',
      title: 'VP of Engineering',
      location: 'San Francisco, CA',
      industry: 'Software',
      company_size: '100-500',
      revenue: '$10M-50M',
      phone: '+1 (555) 123-4567',
      linkedin: 'linkedin.com/in/sarahjohnson',
      website: 'techcorp.com',
      source: 'apollo',
      status: 'new',
      score: 85,
      last_contact: undefined
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'mchen@innovatetech.io',
      company: 'InnovateTech',
      title: 'CTO',
      location: 'Austin, TX',
      industry: 'Technology',
      company_size: '50-100',
      revenue: '$5M-10M',
      phone: '+1 (555) 987-6543',
      linkedin: 'linkedin.com/in/michaelchen',
      website: 'innovatetech.io',
      source: 'zoominfo',
      status: 'contacted',
      score: 92,
      last_contact: '2024-01-15'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily@startupxyz.com',
      company: 'StartupXYZ',
      title: 'Head of Product',
      location: 'New York, NY',
      industry: 'Fintech',
      company_size: '20-50',
      revenue: '$1M-5M',
      linkedin: 'linkedin.com/in/emilyrodriguez',
      website: 'startupxyz.com',
      source: 'apollo',
      status: 'qualified',
      score: 78,
      last_contact: '2024-01-12'
    }
  ]);

  const [isSearching, setIsSearching] = useState(false);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'apollo': return 'bg-blue-100 text-blue-800';
      case 'zoominfo': return 'bg-green-100 text-green-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
    }, 2000);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Company', 'Title', 'Location', 'Industry', 'Company Size', 'Revenue', 'Phone', 'LinkedIn', 'Website', 'Source', 'Status', 'Score'],
      ...leads.map(lead => [
        lead.name,
        lead.email,
        lead.company,
        lead.title,
        lead.location,
        lead.industry,
        lead.company_size,
        lead.revenue,
        lead.phone || '',
        lead.linkedin || '',
        lead.website || '',
        lead.source,
        lead.status,
        lead.score.toString()
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
  };

  const handleEnrichContact = async () => {
    if (!enrichEmail) return;
    
    setEnriching(true);
    try {
      const response = await fetch('/api/leads/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: enrichEmail,
          provider: 'apollo'
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setLeads(prev => [data.data, ...prev]);
        setEnrichEmail('');
        alert('Contact enriched and added successfully!');
      } else {
        alert(data.error || 'Failed to enrich contact');
      }
    } catch (error) {
      console.error('Enrich error:', error);
      alert('Failed to enrich contact');
    } finally {
      setEnriching(false);
    }
  };

  const handleLeadsFound = (newLeads: LeadData[]) => {
    setLeads(prev => [...newLeads, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Lead Data Integration
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find, enrich, and manage prospects with Apollo.io and ZoomInfo integration
          </p>
        </div>

        {/* API Setup Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                Apollo.io Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Connect Apollo.io for lead discovery and email enrichment
                </p>
                <div className="space-y-2">
                  <Label htmlFor="apollo-key">API Key</Label>
                  <Input 
                    id="apollo-key" 
                    type="password" 
                    placeholder="Enter Apollo.io API key"
                  />
                </div>
                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Connect Apollo.io
                </Button>
                <p className="text-sm text-gray-600">
                  Pricing: $49-99/month • 1,000-5,000 credits
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                ZoomInfo Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Connect ZoomInfo for comprehensive B2B data
                </p>
                <div className="space-y-2">
                  <Label htmlFor="zoominfo-key">API Key</Label>
                  <Input 
                    id="zoominfo-key" 
                    type="password" 
                    placeholder="Enter ZoomInfo API key"
                  />
                </div>
                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Connect ZoomInfo
                </Button>
                <p className="text-sm text-gray-600">
                  Pricing: $99-299/month • Premium data access
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="enrichment" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Enrichment
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setSearchModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Search Apollo.io
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={searchFilters.industry} onValueChange={(value) => 
                      setSearchFilters({...searchFilters, industry: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="fintech">Fintech</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={searchFilters.location} onValueChange={(value) => 
                      setSearchFilters({...searchFilters, location: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="san-francisco">San Francisco, CA</SelectItem>
                        <SelectItem value="new-york">New York, NY</SelectItem>
                        <SelectItem value="austin">Austin, TX</SelectItem>
                        <SelectItem value="seattle">Seattle, WA</SelectItem>
                        <SelectItem value="boston">Boston, MA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select value={searchFilters.company_size} onValueChange={(value) => 
                      setSearchFilters({...searchFilters, company_size: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-1000">201-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Title Keywords</Label>
                    <Input 
                      placeholder="e.g. CTO, VP Engineering, Head of Product"
                      value={searchFilters.title_keywords}
                      onChange={(e) => setSearchFilters({...searchFilters, title_keywords: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Revenue Range</Label>
                    <Select value={searchFilters.revenue_range} onValueChange={(value) => 
                      setSearchFilters({...searchFilters, revenue_range: value})
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select revenue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5M">$1M - $5M</SelectItem>
                        <SelectItem value="5-10M">$5M - $10M</SelectItem>
                        <SelectItem value="10-50M">$10M - $50M</SelectItem>
                        <SelectItem value="50-100M">$50M - $100M</SelectItem>
                        <SelectItem value="100M+">$100M+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={handleSearch} 
                      disabled={isSearching}
                      className="w-full"
                    >
                      {isSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Search Leads
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Search Results Preview</CardTitle>
                <p className="text-sm text-gray-600">
                  Configure API integration to see live results
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Connect Apollo.io or ZoomInfo to start searching for leads</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lead Database</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{lead.name}</CardTitle>
                        <p className="text-sm text-gray-600">{lead.title}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className={getSourceColor(lead.source)}>
                          {lead.source}
                        </Badge>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{lead.company}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{lead.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{lead.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{lead.industry} • {lead.company_size}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{lead.revenue}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`font-semibold ${getScoreColor(lead.score)}`}>
                            {lead.score}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enrichment Tab */}
          <TabsContent value="enrichment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Enrichment</CardTitle>
                <p className="text-sm text-gray-600">
                  Enhance your existing leads with additional data points
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Upload Lead List</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drop CSV file here or click to upload
                        </p>
                        <Button variant="outline" size="sm">
                          Choose File
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Enrichment Options</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Email addresses</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Phone numbers</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Social profiles</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Company data</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Technographics</span>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Database className="h-4 w-4 mr-2" />
                    Start Enrichment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Total Leads</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">1,247</div>
                  <div className="text-sm text-green-600">+23 this week</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Qualified</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">342</div>
                  <div className="text-sm text-green-600">27% conversion</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Contacted</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">156</div>
                  <div className="text-sm text-blue-600">12% this month</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600">Avg. Score</span>
                  </div>
                  <div className="text-3xl font-bold text-foreground">78</div>
                  <div className="text-sm text-green-600">+5 points</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lead Sources Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <span className="font-medium">Apollo.io</span>
                      <p className="text-sm text-gray-600">847 leads • 82% accuracy</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Primary</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <span className="font-medium">ZoomInfo</span>
                      <p className="text-sm text-gray-600">312 leads • 91% accuracy</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Premium</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Manual Entry</span>
                      <p className="text-sm text-gray-600">88 leads • 95% accuracy</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">Manual</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lead Search Modal */}
      <LeadSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onLeadsFound={handleLeadsFound}
      />
    </div>
  );
}
