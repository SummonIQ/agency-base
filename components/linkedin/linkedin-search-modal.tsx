'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, User, Building, MapPin, CheckCircle, ExternalLink } from 'lucide-react';
import { LinkedInProfile } from '@/lib/linkedin/linkedin-service';

interface LinkedInSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProspectsFound: (prospects: LinkedInProfile[]) => void;
}

interface SearchFilters {
  keywords: string;
  location: string;
  industry: string;
  company: string;
  companySize: string;
  seniority: string;
  function: string;
}

interface SearchOptions {
  industries: string[];
  locations: string[];
  companySizes: string[];
  seniorities: string[];
  functions: string[];
}

export function LinkedInSearchModal({ isOpen, onClose, onProspectsFound }: LinkedInSearchModalProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    location: '',
    industry: '',
    company: '',
    companySize: '',
    seniority: '',
    function: '',
  });

  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    industries: [],
    locations: [],
    companySizes: [],
    seniorities: [],
    functions: [],
  });

  const [results, setResults] = useState<LinkedInProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load search options on mount
  useEffect(() => {
    if (isOpen) {
      loadSearchOptions();
    }
  }, [isOpen]);

  const loadSearchOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/linkedin/search');
      const data = await response.json();

      if (data.success) {
        setSearchOptions(data.filters);
      }
    } catch (error) {
      console.error('Failed to load search options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (page = 1) => {
    try {
      setSearching(true);
      
      const searchPayload = {
        ...filters,
        page,
        limit: 10,
      };

      // Remove empty filters
      Object.keys(searchPayload).forEach(key => {
        if (!searchPayload[key as keyof typeof searchPayload]) {
          delete searchPayload[key as keyof typeof searchPayload];
        }
      });

      const response = await fetch('/api/linkedin/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload),
      });

      const data = await response.json();

      if (data.success) {
        if (page === 1) {
          setResults(data.data);
          setSelectedProfiles(new Set());
        } else {
          setResults(prev => [...prev, ...data.data]);
        }
        
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.total_pages);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleProfileSelect = (profileId: string) => {
    const newSelected = new Set(selectedProfiles);
    if (newSelected.has(profileId)) {
      newSelected.delete(profileId);
    } else {
      newSelected.add(profileId);
    }
    setSelectedProfiles(newSelected);
  };

  const handleAddSelected = () => {
    const selectedProfilesData = results.filter(profile => 
      selectedProfiles.has(profile.id)
    );
    
    onProspectsFound(selectedProfilesData);
    onClose();
  };

  const resetSearch = () => {
    setFilters({
      keywords: '',
      location: '',
      industry: '',
      company: '',
      companySize: '',
      seniority: '',
      function: '',
    });
    setResults([]);
    setSelectedProfiles(new Set());
    setCurrentPage(1);
    setTotalPages(1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            LinkedIn Prospect Search
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="e.g., software engineer, CTO"
                value={filters.keywords}
                onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions.locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={filters.industry} onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions.industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="e.g., Google, Microsoft"
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Select value={filters.companySize} onValueChange={(value) => setFilters(prev => ({ ...prev, companySize: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions.companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seniority">Seniority</Label>
              <Select value={filters.seniority} onValueChange={(value) => setFilters(prev => ({ ...prev, seniority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select seniority" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions.seniorities.map((seniority) => (
                    <SelectItem key={seniority} value={seniority}>
                      {seniority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={() => handleSearch(1)} disabled={searching || loading}>
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search LinkedIn
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetSearch}>
              Clear Filters
            </Button>
            {selectedProfiles.size > 0 && (
              <Button onClick={handleAddSelected} className="ml-auto">
                Add Selected ({selectedProfiles.size})
              </Button>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="flex-1 overflow-auto">
              <div className="space-y-3">
                {results.map((profile) => (
                  <Card key={profile.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center">
                          <Checkbox
                            checked={selectedProfiles.has(profile.id)}
                            onCheckedChange={() => handleProfileSelect(profile.id)}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {profile.firstName} {profile.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {profile.headline}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={profile.connectionDegree === '1st' ? 'default' : 'secondary'}>
                                {profile.connectionDegree}
                              </Badge>
                              {profile.premium && (
                                <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {profile.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {profile.location}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{profile.industry}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(profile.profileUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Load More */}
                {currentPage < totalPages && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSearch(currentPage + 1)}
                      disabled={searching}
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Load More Results
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !searching && results.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Results Yet</h3>
                <p className="text-muted-foreground">
                  Enter your search criteria and click "Search LinkedIn" to find prospects.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
