import { getPublicPortfolioProjects } from '@/lib/portfolio';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code,
  Palette,
  Users,
  Settings,
  GraduationCap,
  Briefcase,
  Star,
  Globe,
  Github,
  Video,
  ArrowRight,
  Layers
} from 'lucide-react';

const serviceTypeIcons = {
  CONSULTING: Users,
  DEVELOPMENT: Code,
  DESIGN: Palette,
  MAINTENANCE: Settings,
  SUPPORT: Settings,
  TRAINING: GraduationCap,
  OTHER: Briefcase,
};

const serviceTypeColors = {
  CONSULTING: 'bg-green-100 text-green-800',
  DEVELOPMENT: 'bg-blue-100 text-blue-800',
  DESIGN: 'bg-purple-100 text-purple-800',
  MAINTENANCE: 'bg-orange-100 text-orange-800',
  SUPPORT: 'bg-yellow-100 text-yellow-800',
  TRAINING: 'bg-indigo-100 text-indigo-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export default async function PublicPortfolioPage() {
  const projects = await getPublicPortfolioProjects();
  
  const featuredProjects = projects.filter(p => p.isFeatured);
  const regularProjects = projects.filter(p => !p.isFeatured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Our Portfolio</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore our latest projects and see how we've helped businesses transform their digital presence
            </p>
            <Link href="/contact">
              <Button size="lg">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {projects.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Layers className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Portfolio Coming Soon</h2>
              <p className="text-muted-foreground text-center mb-6">
                We're currently updating our portfolio with our latest projects.
                Check back soon!
              </p>
              <Link href="/contact">
                <Button>
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-8 text-center">Featured Projects</h2>
                <div className="grid gap-8 lg:grid-cols-2">
                  {featuredProjects.map((project) => {
                    const ServiceIcon = project.serviceType 
                      ? serviceTypeIcons[project.serviceType]
                      : Briefcase;
                    
                    return (
                      <Card key={project.id} className="hover:shadow-xl transition-shadow overflow-hidden">
                        {project.featuredImage && (
                          <div className="aspect-video relative bg-muted">
                            <img 
                              src={project.featuredImage} 
                              alt={project.title}
                              className="object-cover w-full h-full"
                            />
                            <Badge className="absolute top-4 right-4 bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2 text-2xl">
                                <ServiceIcon className="h-6 w-6" />
                                <Link 
                                  href={`/showcase/${project.slug}`}
                                  className="hover:underline"
                                >
                                  {project.title}
                                </Link>
                              </CardTitle>
                              {project.clientName && (
                                <CardDescription className="mt-2 text-lg">
                                  {project.clientName}
                                  {project.industry && ` • ${project.industry}`}
                                </CardDescription>
                              )}
                            </div>
                            {project.serviceType && (
                              <Badge className={serviceTypeColors[project.serviceType]}>
                                {project.serviceType.toLowerCase()}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {project.description && (
                            <p className="text-muted-foreground">
                              {project.description}
                            </p>
                          )}
                          
                          {/* Technologies */}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.slice(0, 6).map((tech) => (
                                <Badge key={tech} variant="outline">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 6 && (
                                <Badge variant="outline">
                                  +{project.technologies.length - 6}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Links & CTA */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-3">
                              {project.liveUrl && (
                                <a 
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Globe className="h-5 w-5" />
                                  Live Site
                                </a>
                              )}
                              {project.githubUrl && (
                                <a 
                                  href={project.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Github className="h-5 w-5" />
                                  Code
                                </a>
                              )}
                              {project.videoUrl && (
                                <a 
                                  href={project.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Video className="h-5 w-5" />
                                  Demo
                                </a>
                              )}
                            </div>
                            <Link href={`/showcase/${project.slug}`}>
                              <Button variant="outline">
                                View Case Study
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Regular Projects */}
            {regularProjects.length > 0 && (
              <div>
                {featuredProjects.length > 0 && (
                  <h2 className="text-3xl font-bold mb-8 text-center">More Projects</h2>
                )}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {regularProjects.map((project) => {
                    const ServiceIcon = project.serviceType 
                      ? serviceTypeIcons[project.serviceType]
                      : Briefcase;
                    
                    return (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                        {project.featuredImage && (
                          <div className="aspect-video relative bg-muted">
                            <img 
                              src={project.featuredImage} 
                              alt={project.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="flex items-center gap-2">
                                <ServiceIcon className="h-5 w-5" />
                                <Link 
                                  href={`/showcase/${project.slug}`}
                                  className="hover:underline"
                                >
                                  {project.title}
                                </Link>
                              </CardTitle>
                              {project.clientName && (
                                <CardDescription className="mt-2">
                                  {project.clientName}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          
                          {/* Technologies */}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <Link href={`/showcase/${project.slug}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              View Project
                              <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center py-12 border-t">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help transform your ideas into reality
          </p>
          <Link href="/contact">
            <Button size="lg">
              Get In Touch
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}