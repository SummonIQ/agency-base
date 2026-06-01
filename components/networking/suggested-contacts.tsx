'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/use-toast';
import { Building, Briefcase, ExternalLink, UserPlus, Users } from 'lucide-react';
import { ContactSuggestion } from '@/lib/networking/suggest-contacts';
import { cn } from '@/lib/css';
import Link from 'next/link';

interface SuggestedContactsProps {
  jobLeadId: string;
  onContactAdded?: () => void;
}

export function SuggestedContacts({ jobLeadId, onContactAdded }: SuggestedContactsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ContactSuggestion[]>([]);
  const [addingContactId, setAddingContactId] = useState<string | null>(null);
  
  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/networking/suggest?jobLeadId=${jobLeadId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data || []);
      } else {
        console.error('Error fetching contact suggestions');
        toast({
          title: 'Error',
          description: 'Failed to load contact suggestions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching contact suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (jobLeadId) {
      fetchSuggestions();
    }
  }, [jobLeadId]);
  
  const handleAddContact = async (suggestion: ContactSuggestion) => {
    if (suggestion.alreadyInContacts) {
      toast({
        title: 'Contact already exists',
        description: `This contact is already in your network`,
        variant: 'default',
      });
      return;
    }
    
    setAddingContactId(suggestion.name || suggestion.company);
    
    try {
      const response = await fetch('/api/networking/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: suggestion.name,
          company: suggestion.company,
          position: suggestion.position,
          linkedinUrl: suggestion.linkedinUrl,
          jobLeadId: jobLeadId,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Contact added',
          description: `Added ${suggestion.name || suggestion.position || 'contact'} to your network`,
          variant: 'default',
        });
        
        if (onContactAdded) {
          onContactAdded();
        }
        
        // Update the suggestion to reflect that it's now in contacts
        setSuggestions(suggestions.map(s => {
          if (s.name === suggestion.name && s.company === suggestion.company) {
            return {
              ...s,
              alreadyInContacts: true,
              contactId: data.data.id,
            };
          }
          return s;
        }));
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add contact',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to add contact',
        variant: 'destructive',
      });
    } finally {
      setAddingContactId(null);
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Suggested Networking Contacts
          </CardTitle>
          <CardDescription>
            Finding networking contacts for this job lead...
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8 flex justify-center">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }
  
  if (suggestions.length === 0 && !isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Suggested Networking Contacts
          </CardTitle>
          <CardDescription>
            People who might help you with this job opportunity
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center text-muted-foreground">
          No suggested contacts found for this job lead.
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSuggestions}
            >
              Refresh Suggestions
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Suggested Networking Contacts
        </CardTitle>
        <CardDescription>
          People who might help you with this job opportunity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {suggestion.name || 'Unnamed Contact'}
                  </div>
                  
                  <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <Building className="h-3.5 w-3.5 mr-1" />
                    {suggestion.company}
                  </div>
                  
                  {suggestion.position && (
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                      <Briefcase className="h-3.5 w-3.5 mr-1" />
                      {suggestion.position}
                    </div>
                  )}
                </div>
                
                <Badge 
                  className={cn(
                    "ml-2",
                    suggestion.relevance >= 8 ? "bg-green-100 text-green-800" :
                    suggestion.relevance >= 5 ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  )}
                >
                  Relevance: {suggestion.relevance}/10
                </Badge>
              </div>
              
              <div className="mt-3 text-sm">
                <p>{suggestion.reason}</p>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex space-x-2">
                  {suggestion.linkedinUrl && (
                    <Link 
                      href={suggestion.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="flex items-center">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        LinkedIn
                      </Button>
                    </Link>
                  )}
                </div>
                
                {suggestion.alreadyInContacts ? (
                  <div className="flex items-center">
                    <Badge variant="outline">Already in contacts</Badge>
                    {suggestion.contactId && (
                      <Link href={`/networking/contacts/${suggestion.contactId}`}>
                        <Button variant="ghost" size="sm" className="ml-2">
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddContact(suggestion)}
                    disabled={addingContactId === (suggestion.name || suggestion.company)}
                    className="flex items-center"
                  >
                    {addingContactId === (suggestion.name || suggestion.company) ? (
                      <Spinner size="sm" className="mr-1" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                    )}
                    Add to Contacts
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={fetchSuggestions}>
          Refresh Suggestions
        </Button>
        
        <Link href="/networking/contacts">
          <Button variant="ghost" size="sm">
            View All Contacts
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
