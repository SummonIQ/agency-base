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
import { Textarea } from "@/components/ui/textarea";
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Search, 
  History, 
  MapPin, 
  Building,
  DollarSign,
  Briefcase,
  GraduationCap,
  Calendar,
  Filter,
  Star,
  X
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createJobSearch } from "@/lib/job-searches";
import { JobBoard } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface JobSearchFormEnhancedProps {
  recentSearches?: Array<{
    id: string;
    query: string;
    location?: string;
    radius?: number;
  }>;
  userSkills?: string[];
  preferredCompanies?: string[];
  preferredLocations?: string[];
}

// Enhanced form validation schema
const formSchema = z.object({
  // Basic search
  query: z.string().min(1, "Search term is required"),
  location: z.string().optional(),
  radius: z.coerce.number().optional(),
  remote: z.boolean().default(false),
  
  // Job details
  jobType: z.array(z.string()).optional(),
  experienceLevel: z.array(z.string()).optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  
  // Advanced
  companies: z.array(z.string()).optional(),
  excludeCompanies: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  excludeKeywords: z.array(z.string()).optional(),
  
  // Preferences
  fromage: z.coerce.number().optional(),
  sortBy: z.enum(["relevance", "date"]).default("relevance"),
  saveSearch: z.boolean().default(true),
  searchName: z.string().optional(),
  enableAlerts: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior Level (5-8 years)" },
  { value: "lead", label: "Lead (8+ years)" },
  { value: "manager", label: "Manager/Executive" },
];

const jobTypes = [
  { value: "fulltime", label: "Full-time" },
  { value: "parttime", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
];

export function JobSearchFormEnhanced({ 
  recentSearches = [],
  userSkills = [],
  preferredCompanies = [],
  preferredLocations = []
}: JobSearchFormEnhancedProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
      location: "",
      radius: 25,
      remote: false,
      jobType: [],
      experienceLevel: [],
      salaryMin: 0,
      salaryMax: 200000,
      companies: [],
      excludeCompanies: [],
      keywords: [],
      excludeKeywords: [],
      fromage: 30,
      sortBy: "relevance",
      saveSearch: true,
      searchName: "",
      enableAlerts: false,
    },
  });

  const handleAddKeyword = (keyword: string) => {
    if (keyword.trim()) {
      const currentKeywords = form.getValues("keywords") || [];
      form.setValue("keywords", [...currentKeywords, keyword.trim()]);
      setCustomKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const currentKeywords = form.getValues("keywords") || [];
    form.setValue("keywords", currentKeywords.filter(k => k !== keyword));
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Build query with skills if selected
      let enhancedQuery = data.query;
      if (selectedSkills.length > 0) {
        enhancedQuery = `${data.query} ${selectedSkills.join(" ")}`;
      }

      const result = await createJobSearch({
        searchTerm: enhancedQuery,
        location: data.location || null,
        radius: data.radius || null,
        jobType: data.jobType?.join(",") || null,
        remote: data.remote,
        sortBy: data.sortBy,
        jobBoard: JobBoard.GOOGLE,
        saveSearch: data.saveSearch,
        metadata: {
          experienceLevel: data.experienceLevel,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          companies: data.companies,
          excludeCompanies: data.excludeCompanies,
          keywords: data.keywords,
          excludeKeywords: data.excludeKeywords,
          searchName: data.searchName,
          enableAlerts: data.enableAlerts,
        }
      });
      
      if (result.success && result.jobSearchId) {
        toast({
          title: "Job Search Started",
          description: data.saveSearch 
            ? "Your search is saved and running. You'll see results shortly."
            : "Your search is now in progress. You'll see results as they come in.",
          duration: 5000,
        });
        
        setTimeout(() => {
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
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic Search</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* Search Query with Skills */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What job are you looking for?</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="Job title, skills or keywords" 
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick skill selection */}
              {userSkills.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm">Include your skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {userSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill}
                        {selectedSkills.includes(skill) && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location and Remote */}
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder="City, state, or zip code" 
                          {...field}
                          className="pl-10"
                        />
                      </div>
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
                        <SelectItem value="5">5 miles</SelectItem>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                        <SelectItem value="100">100 miles</SelectItem>
                        <SelectItem value="200">Nationwide</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Type and Experience */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {jobTypes.map((type) => (
                        <Badge
                          key={type.value}
                          variant={field.value?.includes(type.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = field.value || [];
                            const updated = current.includes(type.value)
                              ? current.filter(t => t !== type.value)
                              : [...current, type.value];
                            field.onChange(updated);
                          }}
                        >
                          <Briefcase className="mr-1 h-3 w-3" />
                          {type.label}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {experienceLevels.map((level) => (
                        <Badge
                          key={level.value}
                          variant={field.value?.includes(level.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = field.value || [];
                            const updated = current.includes(level.value)
                              ? current.filter(l => l !== level.value)
                              : [...current, level.value];
                            field.onChange(updated);
                          }}
                        >
                          <GraduationCap className="mr-1 h-3 w-3" />
                          {level.label}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Remote Toggle */}
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
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 mt-4">
            {/* Salary Range */}
            <div className="space-y-2">
              <FormLabel>Salary Range</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            type="number"
                            placeholder="Min salary" 
                            {...field}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            type="number"
                            placeholder="Max salary" 
                            {...field}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Keywords */}
            <div className="space-y-2">
              <FormLabel>Must Have Keywords</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a keyword..."
                  value={customKeyword}
                  onChange={(e) => setCustomKeyword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword(customKeyword);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleAddKeyword(customKeyword)}
                >
                  Add
                </Button>
              </div>
              {form.watch("keywords")?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.watch("keywords").map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Company Preferences */}
            {preferredCompanies.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Preferred Companies</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {preferredCompanies.map((company) => (
                    <Badge
                      key={company}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      <Building className="mr-1 h-3 w-3" />
                      {company}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-4 mt-4">
            {/* Date Posted */}
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
                      <SelectItem value="0">Any time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sort By */}
            <FormField
              control={form.control}
              name="sortBy"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Sort Results By</FormLabel>
                  <FormControl>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={field.value === "relevance"}
                          onChange={() => field.onChange("relevance")}
                        />
                        <span>Relevance (Best Match)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={field.value === "date"}
                          onChange={() => field.onChange("date")}
                        />
                        <span>Date Posted (Newest First)</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Save Search Options */}
            <div className="space-y-4 border rounded-lg p-4">
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
                        Save this search for quick access later
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("saveSearch") && (
                <>
                  <FormField
                    control={form.control}
                    name="searchName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search Name (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Remote React Developer Jobs"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableAlerts"
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
                            Enable job alerts
                          </FormLabel>
                          <FormDescription>
                            Get notified when new jobs match this search
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" type="button" className="w-full">
                <History className="mr-2 h-4 w-4" />
                Recent Searches ({recentSearches.length})
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {recentSearches.map((search) => (
                      <div
                        key={search.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => {
                          form.setValue("query", search.query);
                          if (search.location) form.setValue("location", search.location);
                          if (search.radius) form.setValue("radius", search.radius);
                        }}
                      >
                        <div>
                          <p className="font-medium text-sm">{search.query}</p>
                          {search.location && (
                            <p className="text-xs text-muted-foreground">
                              <MapPin className="inline h-3 w-3 mr-1" />
                              {search.location}
                            </p>
                          )}
                        </div>
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Jobs
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}