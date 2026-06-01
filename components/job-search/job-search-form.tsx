"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, History, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createJobSearch } from "@/lib/job-searches";
import { JobBoard } from "@prisma/client";

interface JobSearchFormProps {
  recentSearches?: Array<{
    id: string;
    query: string;
    location?: string;
    radius?: number;
  }>;
}

// Form validation schema
const formSchema = z.object({
  query: z.string().min(1, "Search term is required"),
  location: z.string().optional(),
  radius: z.coerce.number().optional(),
  jobType: z.enum(["any", "fulltime", "parttime", "contract", "internship", "temporary"]).nullable().default("any"),
  fromage: z.coerce.number().optional(),
  remote: z.boolean().default(false),
  sortBy: z.enum(["relevance", "date"]).default("relevance"),
  saveSearch: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function JobSearchForm({ recentSearches = [] }: JobSearchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
      location: "",
      radius: 25,
      jobType: "",
      fromage: 30,
      remote: false,
      sortBy: "relevance",
      saveSearch: true,
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create a job search using the Google SerpAPI integration
      const result = await createJobSearch({
        searchTerm: data.query,
        location: data.location || null,
        radius: data.radius || null,
        // Only pass jobType if it's not 'any'
        jobType: data.jobType === 'any' ? null : data.jobType || null,
        remote: data.remote,
        sortBy: data.sortBy,
        jobBoard: JobBoard.GOOGLE, // Always use the Google job board
        saveSearch: data.saveSearch,
      });
      
      if (result.success && result.jobSearchId) {
        toast({
          title: "Job Search Started",
          description: "Your search is now in progress. You'll see results as they come in.",
          duration: 5000, // Show for 5 seconds to ensure user sees it
        });
        
        // Add a slight delay to ensure the toast is seen
        setTimeout(() => {
          // Redirect to the job search results page where progress will be shown
          router.push(`/jobs/searches/${result.jobSearchId}`);
        }, 300);
      } else {
        toast({
          variant: "destructive",
          title: "Search Failed",
          description: result.error || "There was a problem starting your job search.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Search Failed",
        description: error instanceof Error 
          ? error.message 
          : "There was a problem starting your job search.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle loading a recent search
  const handleLoadRecentSearch = (search: typeof recentSearches[0]) => {
    form.setValue("query", search.query);
    if (search.location) form.setValue("location", search.location);
    if (search.radius) form.setValue("radius", search.radius);
    setShowRecentSearches(false);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {recentSearches.length > 0 && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRecentSearches(!showRecentSearches)}
              className="flex items-center gap-1 text-xs"
            >
              <History className="h-3.5 w-3.5" />
              Recent Searches
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Search Jobs</FormLabel>
                <FormControl>
                  <Input placeholder="Job title, skills or keywords" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, state, or zip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="radius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Radius</FormLabel>
                  <Select 
                    onValueChange={value => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString() || "25"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Distance" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="10">10 miles</SelectItem>
                      <SelectItem value="25">25 miles</SelectItem>
                      <SelectItem value="50">50 miles</SelectItem>
                      <SelectItem value="100">100 miles</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="fulltime">Full-time</SelectItem>
                      <SelectItem value="parttime">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fromage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posted Within</FormLabel>
                  <Select 
                    onValueChange={value => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString() || "30"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Last 24 hours</SelectItem>
                      <SelectItem value="3">Last 3 days</SelectItem>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="14">Last 14 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="remote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Remote Jobs Only
                    </FormLabel>
                    <FormDescription>
                      Only show jobs that allow remote work
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sortBy"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Sort By</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={field.value === "relevance"}
                          onChange={() => field.onChange("relevance")}
                        />
                        <span>Relevance</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={field.value === "date"}
                          onChange={() => field.onChange("date")}
                        />
                        <span>Date</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="saveSearch"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Save this search
                  </FormLabel>
                  <FormDescription>
                    Save this search for later use and enable job alerts
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </form>
      
      {showRecentSearches && recentSearches.length > 0 && (
        <div className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Recent Searches</CardTitle>
              <CardDescription>Select a previous search to load it</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <ul className="space-y-2">
                {recentSearches.map((search) => (
                  <li 
                    key={search.id}
                    className="flex items-start p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                    onClick={() => handleLoadRecentSearch(search)}
                  >
                    <Search className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{search.query}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {search.location && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="h-3 w-3 mr-1" /> {search.location}
                          </Badge>
                        )}
                        {search.radius && (
                          <Badge variant="outline" className="text-xs">
                            {search.radius} miles
                          </Badge>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => setShowRecentSearches(false)}
              >
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Form>
  );
}
