'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Plus,
  X,
  Save,
  Eye,
  Code,
  Globe,
  Github,
  Video,
  Image
} from 'lucide-react';
import Link from 'next/link';

interface PortfolioFormProps {
  userId: string;
  initialData?: any;
  isEditing?: boolean;
}

export default function PortfolioForm({ 
  userId, 
  initialData, 
  isEditing = false 
}: PortfolioFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [industry, setIndustry] = useState(initialData?.industry || '');
  const [serviceType, setServiceType] = useState(initialData?.serviceType || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [teamSize, setTeamSize] = useState(initialData?.teamSize || '');
  const [budget, setBudget] = useState(initialData?.budget || '');
  
  // Content
  const [challenge, setChallenge] = useState(initialData?.challenge || '');
  const [solution, setSolution] = useState(initialData?.solution || '');
  const [results, setResults] = useState(initialData?.results || '');
  const [testimonial, setTestimonial] = useState(initialData?.testimonial || '');
  const [testimonialAuthor, setTestimonialAuthor] = useState(initialData?.testimonialAuthor || '');
  const [testimonialRole, setTestimonialRole] = useState(initialData?.testimonialRole || '');
  
  // Media
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [liveUrl, setLiveUrl] = useState(initialData?.liveUrl || '');
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || '');
  
  // Technologies
  const [technologies, setTechnologies] = useState<string[]>(initialData?.technologies || []);
  const [newTechnology, setNewTechnology] = useState('');
  
  // Publishing
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEditing || !slug) {
      setSlug(generateSlug(value));
    }
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !technologies.includes(newTechnology.trim())) {
      setTechnologies([...technologies, newTechnology.trim()]);
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const projectData = {
        title,
        slug,
        description: description || undefined,
        clientName: clientName || undefined,
        industry: industry || undefined,
        serviceType: serviceType || undefined,
        duration: duration || undefined,
        teamSize: teamSize ? parseInt(teamSize) : undefined,
        budget: budget || undefined,
        challenge: challenge || undefined,
        solution: solution || undefined,
        results: results || undefined,
        testimonial: testimonial || undefined,
        testimonialAuthor: testimonialAuthor || undefined,
        testimonialRole: testimonialRole || undefined,
        featuredImage: featuredImage || undefined,
        images: images.length > 0 ? images : undefined,
        videoUrl: videoUrl || undefined,
        liveUrl: liveUrl || undefined,
        githubUrl: githubUrl || undefined,
        technologies,
        isPublished,
        isFeatured,
      };

      const response = await fetch('/api/portfolio', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? { id: initialData.id, ...projectData } : projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to save portfolio project');
      }

      const project = await response.json();
      router.push(`/portfolio/${project.slug}`);
    } catch (error) {
      console.error('Error saving portfolio project:', error);
      alert('Failed to save portfolio project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/portfolio">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={isLoading || !title || !slug}
          >
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details about your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., E-commerce Platform Redesign"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g., ecommerce-platform-redesign"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be used in the project URL
                </p>
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of the project..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Healthcare, Finance"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSULTING">Consulting</SelectItem>
                      <SelectItem value="DEVELOPMENT">Development</SelectItem>
                      <SelectItem value="DESIGN">Design</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="SUPPORT">Support</SelectItem>
                      <SelectItem value="TRAINING">Training</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 3 months"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget Range</Label>
                  <Input
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., $50k-$100k"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Case Study Content */}
          <Card>
            <CardHeader>
              <CardTitle>Case Study</CardTitle>
              <CardDescription>
                Tell the story of your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="challenge">Challenge</Label>
                <Textarea
                  id="challenge"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="What problem did the client face?"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="solution">Solution</Label>
                <Textarea
                  id="solution"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="How did you solve the problem?"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="results">Results</Label>
                <Textarea
                  id="results"
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  placeholder="What were the outcomes and metrics?"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Testimonial */}
          <Card>
            <CardHeader>
              <CardTitle>Client Testimonial</CardTitle>
              <CardDescription>
                Add social proof with a client testimonial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testimonial">Testimonial</Label>
                <Textarea
                  id="testimonial"
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  placeholder="What did the client say about your work?"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="testimonialAuthor">Author Name</Label>
                  <Input
                    id="testimonialAuthor"
                    value={testimonialAuthor}
                    onChange={(e) => setTestimonialAuthor(e.target.value)}
                    placeholder="e.g., John Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="testimonialRole">Author Role</Label>
                  <Input
                    id="testimonialRole"
                    value={testimonialRole}
                    onChange={(e) => setTestimonialRole(e.target.value)}
                    placeholder="e.g., CEO at Acme Corp"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Published</Label>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Media & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="liveUrl">Live URL</Label>
                <div className="flex gap-2">
                  <Globe className="h-4 w-4 mt-2 text-muted-foreground" />
                  <Input
                    id="liveUrl"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="githubUrl">GitHub URL</Label>
                <div className="flex gap-2">
                  <Github className="h-4 w-4 mt-2 text-muted-foreground" />
                  <Input
                    id="githubUrl"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="videoUrl">Video/Demo URL</Label>
                <div className="flex gap-2">
                  <Video className="h-4 w-4 mt-2 text-muted-foreground" />
                  <Input
                    id="videoUrl"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Technologies Used</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="Add technology..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnology();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTechnology}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}