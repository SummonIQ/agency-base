'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Building,
  Users,
  MapPin,
  Code,
  TrendingUp,
  Star,
  Plus,
  Filter,
  Loader2,
  Mail,
  Linkedin,
  ExternalLink
} from 'lucide-react';

interface ProspectResult {
  company: any;
  contact: any;
  score: {
    overall: number;
    factors: any;
    reasoning: string[];
  };
}

export default function ProspectSearchClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [results, setResults] = useState<ProspectResult[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Search form state
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    industry: '',
    size: '',
    location: '',
    techStack: '',
    revenue: '',
    jobTitle: '',
    seniority: ''
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/lead-generation/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...searchParams,
          contactFilters: {
            ...(searchParams.jobTitle && { jobTitles: [searchParams.jobTitle] }),
            ...(searchParams.seniority && { seniority: searchParams.seniority })
          },
          limit: 20
        })
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearchPerformed(true);

      if (data.results.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try adjusting your search criteria',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search for prospects. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLead = async (prospect: ProspectResult) => {
    const tempId = `${prospect.company.id}-${prospect.contact.id}`;
    setSavingLeadId(tempId);

    try {
      const response = await fetch('/api/lead-generation/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: prospect.company,
          contact: prospect.contact,
          score: prospect.score.overall,
          source: 'COLD_OUTREACH'
        })
      });

      if (!response.ok) {
        if (response.status === 409) {
          toast({
            title: 'Lead already exists',
            description: 'This lead is already in your database',
            variant: 'default'
          });
          return;
        }
        throw new Error('Failed to save lead');
      }

      const lead = await response.json();
      toast({
        title: 'Lead saved',
        description: `${prospect.company.name} has been added to your leads`,
        variant: 'default'
      });

      // Navigate to the leads page
      router.push('/leads');
    } catch (error) {
      console.error('Save lead error:', error);
      toast({
        title: 'Failed to save lead',
        description: 'There was an error saving this lead. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSavingLeadId(null);
    }
  };

  const handleAddAllToCampaign = async () => {
    // TODO: Implement bulk campaign addition
    toast({
      title: 'Coming soon',
      description: 'Bulk campaign management will be available soon',
      variant: 'default'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Prospect Search</h1>
          <p className="text-muted-foreground">Find and qualify potential clients</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Search Filters */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., SaaS, fintech, startup"
                  value={searchParams.keywords}
                  onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={searchParams.industry}
                  onValueChange={(value) => setSearchParams({ ...searchParams, industry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Fintech">Fintech</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-size">Company Size</Label>
                <Select
                  value={searchParams.size}
                  onValueChange={(value) => setSearchParams({ ...searchParams, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Size</SelectItem>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="50-200">50-200 employees</SelectItem>
                    <SelectItem value="200-500">200-500 employees</SelectItem>
                    <SelectItem value="500-1000">500-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tech-stack">Technology Stack</Label>
                <Input
                  id="tech-stack"
                  placeholder="e.g., React, Node.js, AWS"
                  value={searchParams.techStack}
                  onChange={(e) => setSearchParams({ ...searchParams, techStack: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue Range</Label>
                <Select
                  value={searchParams.revenue}
                  onValueChange={(value) => setSearchParams({ ...searchParams, revenue: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Revenue</SelectItem>
                    <SelectItem value="0-1m">$0 - $1M</SelectItem>
                    <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                    <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                    <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                    <SelectItem value="50m+">$50M+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Contact Filters</Label>
                <Select
                  value={searchParams.jobTitle}
                  onValueChange={(value) => setSearchParams({ ...searchParams, jobTitle: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Job title contains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Title</SelectItem>
                    <SelectItem value="CTO">CTO</SelectItem>
                    <SelectItem value="VP Engineering">VP Engineering</SelectItem>
                    <SelectItem value="Head of Product">Head of Product</SelectItem>
                    <SelectItem value="Founder">Founder</SelectItem>
                    <SelectItem value="CEO">CEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Select
                  value={searchParams.seniority}
                  onValueChange={(value) => setSearchParams({ ...searchParams, seniority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seniority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Level</SelectItem>
                    <SelectItem value="c-level">C-Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="mid">Mid-level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Prospects
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:col-span-2 space-y-4">
          {results.length > 0 && (
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Search Results</h2>
                <p className="text-sm text-muted-foreground">{results.length} companies found</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAddAllToCampaign}>
                  Add All to Campaign
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {results.map((result, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {result.company.name}
                      <Badge variant="outline" className="ml-2">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {result.score.overall.toFixed(1)}/10
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {result.company.domain} • {result.company.industry} • {result.company.size || result.company.employees + ' employees'} • {result.company.location}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveLead(result)}
                      disabled={savingLeadId === `${result.company.id}-${result.contact.id}`}
                    >
                      {savingLeadId === `${result.company.id}-${result.contact.id}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Save Lead
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Contact Info */}
                  {result.contact && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {result.contact.firstName} {result.contact.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.contact.jobTitle}
                          </div>
                        </div>
                      </div>
                      {result.contact.email && (
                        <div className="text-sm text-muted-foreground">
                          {result.contact.email}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tech Stack */}
                  {result.company.techStack && result.company.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Code className="h-4 w-4 text-muted-foreground mt-1" />
                      {result.company.techStack.map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Score Reasoning */}
                  {result.score.reasoning.length > 0 && (
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-1" />
                      <div className="text-sm">
                        <div className="font-medium text-green-600 mb-1">Why this is a good fit:</div>
                        <ul className="text-muted-foreground space-y-1">
                          {result.score.reasoning.map((reason, i) => (
                            <li key={i}>• {reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Revenue */}
                  {result.company.revenue && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      Revenue: {result.company.revenue}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {searchPerformed && results.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Try adjusting your search criteria or broadening your filters
                </p>
              </CardContent>
            </Card>
          )}

          {/* Initial State */}
          {!searchPerformed && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start your search</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Use the filters on the left to find potential clients that match your criteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}