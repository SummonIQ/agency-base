import { auth } from '@/lib/auth/server';
import { getPortfolioProject } from '@/lib/portfolio';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassyContainer } from '@/components/ui/glassy-edge';
import { 
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  Globe,
  Github,
  Video,
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
  Star,
  Share2,
  Download
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

export default async function PortfolioDetailPage({ params }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const project = await getPortfolioProject(params.slug, session.user.id);
  
  if (!project) {
    notFound();
  }

  const ServiceIcon = project.serviceType 
    ? serviceTypeIcons[project.serviceType]
    : Briefcase;

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Link href="/portfolio" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ServiceIcon className="h-6 w-6" />
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <div className="flex items-center gap-2">
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
                {project.isPublished ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Eye className="h-3 w-3 mr-1" />
                    Published
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                )}
              </div>
            </div>
            {project.clientName && (
              <p className="text-muted-foreground">
                {project.clientName}
                {project.industry && ` • ${project.industry}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {project.isPublished && (
            <Link href={`/showcase/${project.slug}`} target="_blank">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                View Public
              </Button>
            </Link>
          )}
          <Link href={`/portfolio/${project.slug}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Image */}
      {project.featuredImage && (
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <img 
              src={project.featuredImage} 
              alt={project.title}
              className="w-full rounded-lg"
            />
          </div>
        </GlassyContainer>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          {project.description && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>
            </GlassyContainer>
          )}

          {/* Challenge */}
          {project.challenge && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-red-500" />
                  The Challenge
                </h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="whitespace-pre-line text-gray-700">
                    {project.challenge}
                  </div>
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Solution */}
          {project.solution && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Code className="h-5 w-5 mr-2 text-blue-500" />
                  Our Solution
                </h2>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="whitespace-pre-line text-gray-700">
                    {project.solution}
                  </div>
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Results */}
          {project.results && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Results & Impact
                </h2>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                  <div className="whitespace-pre-line text-gray-700">
                    {project.results}
                  </div>
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Testimonial */}
          {project.testimonial && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Quote className="h-5 w-5 mr-2 text-purple-500" />
                  Client Testimonial
                </h2>
                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <Quote className="h-6 w-6 text-purple-400 mb-3" />
                  <blockquote className="text-lg italic text-gray-700 mb-4">
                    "{project.testimonial}"
                  </blockquote>
                  {(project.testimonialAuthor || project.testimonialRole) && (
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
                  )}
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Additional Images */}
          {project.images && Array.isArray(project.images) && project.images.length > 0 && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Project Gallery</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {project.images.map((image: string, index: number) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`${project.title} - Image ${index + 1}`}
                      className="w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </GlassyContainer>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Details */}
          <GlassyContainer edges={[]}>
            <div className="p-6">
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
          </GlassyContainer>

          {/* Project Links */}
          <GlassyContainer edges={[]}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Links</h3>
              <div className="space-y-3">
                {project.liveUrl && (
                  <a 
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Live Site
                  </a>
                )}
                {project.githubUrl && (
                  <a 
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    Source Code
                  </a>
                )}
                {project.videoUrl && (
                  <a 
                    href={project.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Video className="h-4 w-4" />
                    Demo Video
                  </a>
                )}
              </div>
            </div>
          </GlassyContainer>

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <GlassyContainer edges={[]}>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </GlassyContainer>
          )}

          {/* Actions */}
          <GlassyContainer edges={[]}>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Link href={`/portfolio/${project.slug}/edit`}>
                  <Button className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Project
                  </Button>
                </Link>
                {project.isPublished && (
                  <Link href={`/showcase/${project.slug}`} target="_blank">
                    <Button variant="outline" className="w-full">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Publicly
                    </Button>
                  </Link>
                )}
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
          </GlassyContainer>
        </div>
      </div>
    </div>
  );
}