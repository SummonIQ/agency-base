'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Plus
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
}

interface SearchFilters {
  industry: string;
  location: string;
  company_size: string;
  title_keywords: string;
  revenue_range: string;
  keywords: string;
}

interface LeadSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsFound?: (leads: LeadData[]) => void;
}

export function LeadSearchModal({ isOpen, onClose, onLeadsFound }: LeadSearchModalProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    industry: '',
    location: '',
    company_size: '',
    title_keywords: '',
    revenue_range: '',
    keywords: '',
  });
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<LeadData[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [searchOptions, setSearchOptions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  // Load search options on mount
  useEffect(() => {
    if (isOpen) {
      loadSearchOptions();
    }
  }, [isOpen]);

  const loadSearchOptions = async () => {
    try {
      const response = await fetch('/api/leads/search');
      const data = await response.json();
      
      if (data.success) {
        setSearchOptions(data);
      }
    } catch (error) {
      console.error('Failed to load search options:', error);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'apollo',
          filters,
          page: 1,
          limit: 25,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
        setPagination(data.pagination);
        setSelectedLeads(new Set());
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search leads. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleAddSelectedLeads = () => {
    const selectedLeadData = results.filter(lead => selectedLeads.has(lead.id));
    onLeadsFound?.(selectedLeadData);
    onClose();
    
    // Reset state
    setResults([]);
    setSelectedLeads(new Set());
    setFilters({
      industry: '',
      location: '',
      company_size: '',
      title_keywords: '',
      revenue_range: '',
      keywords: '',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Leads with Apollo.io
          </DialogTitle>
          <DialogDescription>
            Find and add qualified prospects to your lead database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Filters */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions?.filters?.industries?.map((industry: string) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions?.filters?.locations?.map((location: string) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select value={filters.company_size} onValueChange={(value) => setFilters(prev => ({ ...prev, company_size: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions?.filters?.company_sizes?.map((size: string) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title Keywords</Label>
              <Input
                placeholder="e.g., CTO, VP Engineering"
                value={filters.title_keywords}
                onChange={(e) => setFilters(prev => ({ ...prev, title_keywords: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Revenue Range</Label>
              <Select value={filters.revenue_range} onValueChange={(value) => setFilters(prev => ({ ...prev, revenue_range: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions?.filters?.revenue_ranges?.map((range: string) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                placeholder="General search terms"
                value={filters.keywords}
                onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleSearch} 
              disabled={searching}
              className="flex items-center gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Leads
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Search Results ({pagination?.total_entries || results.length} found)
                </h3>
                <Badge variant="outline">
                  {selectedLeads.size} selected
                </Badge>
              </div>

              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {results.map((lead) => (
                  <Card 
                    key={lead.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedLeads.has(lead.id) 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectLead(lead.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{lead.name}</h4>
                            <Badge className={getScoreColor(lead.score)}>
                              {lead.score}% match
                            </Badge>
                          </div>
                          
                          <div className="grid gap-1 text-sm text-muted-foreground md:grid-cols-2">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {lead.title} at {lead.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {lead.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {lead.industry} • {lead.company_size} employees
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {lead.revenue} revenue
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <Mail className="h-3 w-3" />
                                Email
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <Phone className="h-3 w-3" />
                                Phone
                              </div>
                            )}
                            {lead.linkedin && (
                              <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                              </div>
                            )}
                            {lead.website && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                Website
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
                          {selectedLeads.has(lead.id) ? (
                            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-muted rounded-full" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {selectedLeads.size > 0 && (
            <Button onClick={handleAddSelectedLeads}>
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedLeads.size} Lead{selectedLeads.size !== 1 ? 's' : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
