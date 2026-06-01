import { getPortfolioProject } from '@/lib/portfolio';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  Globe,
  Github,
  Video,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Target,
  CheckCircle,
  Quote,
  Code,
  Palette,
  Settings,
  GraduationCap,
  Briefcase,
  Star
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

interface Props {
  params: { slug: string };
}

export default async function CaseStudyPage({ params }: Props) {
  const project = await getPortfolioProject(params.slug);
  
  if (!project || !project.isPublished) {
    notFound();
  }

  const ServiceIcon = project.serviceType 
    ? serviceTypeIcons[project.serviceType]
    : Briefcase;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <Link href="/showcase" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolio
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <ServiceIcon className="h-8 w-8" />
              <div className="flex items-center gap-3">
                {project.serviceType && (
                  <Badge className={serviceTypeColors[project.serviceType]}>
                    {project.serviceType.toLowerCase()}
                  </Badge>
                )}
                {project.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
            
            {project.clientName && (
              <p className="text-2xl text-muted-foreground mb-6">
                {project.clientName}
                {project.industry && ` • ${project.industry}`}
              </p>
            )}

            {project.description && (
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Project Links */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {project.liveUrl && (
                <a 
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg">
                    <Globe className="h-5 w-5 mr-2" />
                    View Live Site
                  </Button>
                </a>
              )}
              {project.githubUrl && (
                <a 
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    <Github className="h-5 w-5 mr-2" />
                    View Code
                  </Button>
                </a>
              )}
              {project.videoUrl && (
                <a 
                  href={project.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    <Video className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {project.featuredImage && (
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <img 
              src={project.featuredImage} 
              alt={project.title}
              className="w-full rounded-lg shadow-xl"
            />
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Challenge */}
              {project.challenge && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 flex items-center">
                    <Target className="h-8 w-8 mr-3 text-red-500" />
                    The Challenge
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {project.challenge}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Solution */}
              {project.solution && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 flex items-center">
                    <Code className="h-8 w-8 mr-3 text-blue-500" />
                    Our Solution
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {project.solution}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Results */}
              {project.results && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 flex items-center">
                    <CheckCircle className="h-8 w-8 mr-3 text-green-500" />
                    Results & Impact
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {project.results}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Testimonial */}
              {project.testimonial && (
                <section>
                  <h2 className="text-3xl font-bold mb-6 flex items-center">
                    <Quote className="h-8 w-8 mr-3 text-purple-500" />
                    Client Testimonial
                  </h2>
                  <div className="bg-purple-50 border border-purple-200 p-8 rounded-lg">
                    <Quote className="h-8 w-8 text-purple-400 mb-4" />
                    <blockquote className="text-xl italic text-gray-700 mb-6 leading-relaxed">
                      "{project.testimonial}"
                    </blockquote>
                    {(project.testimonialAuthor || project.testimonialRole) && (
                      <div className="flex items-center">
                        <div>
                          {project.testimonialAuthor && (
                            <div className="font-semibold text-gray-900">
                              {project.testimonialAuthor}
                            </div>
                          )}
                          {project.testimonialRole && (
                            <div className="text-sm text-gray-600">
                              {project.testimonialRole}
                              {project.clientName && ` at ${project.clientName}`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Additional Images */}
              {project.images && Array.isArray(project.images) && project.images.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-6">Project Gallery</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {project.images.map((image: string, index: number) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${project.title} - Image ${index + 1}`}
                        className="w-full rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Project Details */}
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                <div className="space-y-4 text-sm">
                  {project.duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-2 font-medium">{project.duration}</span>
                    </div>
                  )}
                  {project.teamSize && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Team Size:</span>
                      <span className="ml-2 font-medium">{project.teamSize} people</span>
                    </div>
                  )}
                  {project.budget && (
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="ml-2 font-medium">{project.budget}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-2">Like what you see?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Let's discuss how we can help with your next project
                </p>
                <Link href="/contact">
                  <Button className="w-full">
                    Start Your Project
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Let's create something amazing together. Get in touch to discuss your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Get In Touch
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/showcase">
              <Button size="lg" variant="ghost">
                View More Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}