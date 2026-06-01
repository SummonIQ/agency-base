import { auth } from '@/lib/auth/server';
import { getPortfolioProjects, getPortfolioStats } from '@/lib/portfolio';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassyContainer } from '@/components/ui/glassy-edge';
import { 
  Plus,
  Code,
  Palette,
  Users,
  Settings,
  GraduationCap,
  Briefcase,
  Eye,
  EyeOff,
  Star,
  Globe,
  Github,
  Video,
  Image,
  Layers
} from 'lucide-react';
import PortfolioActions from '@/components/portfolio/portfolio-actions';

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

export default async function PortfolioPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [projects, stats] = await Promise.all([
    getPortfolioProjects(session.user.id, true), // Include unpublished
    getPortfolioStats(session.user.id),
  ]);

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-2">Showcase your best work to potential clients</p>
        </div>
        <div className="flex gap-2">
          <Link href="/showcase">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View Public Portfolio
            </Button>
          </Link>
          <Link href="/portfolio/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total Projects</div>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </div>
          </div>
        </GlassyContainer>

        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Published</div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stats.publishedProjects}</div>
            </div>
          </div>
        </GlassyContainer>

        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Featured</div>
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stats.featuredProjects}</div>
            </div>
          </div>
        </GlassyContainer>

        <GlassyContainer edges={[]}>
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Technologies</div>
              <Code className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{stats.uniqueTechnologies}</div>
            </div>
          </div>
        </GlassyContainer>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <GlassyContainer edges={[]} className="md:col-span-2 lg:col-span-3">
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No portfolio projects yet</h2>
              <p className="text-muted-foreground mb-4 text-center">
                Add your best work to showcase your skills and experience
              </p>
              <Link href="/portfolio/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Project
                </Button>
              </Link>
            </div>
          </GlassyContainer>
        ) : (
          projects.map((project) => {
            const ServiceIcon = project.serviceType 
              ? serviceTypeIcons[project.serviceType]
              : Briefcase;
            
            return (
              <GlassyContainer key={project.id} edges={[]} className="hover:scale-[1.02] transition-transform overflow-hidden">
                {project.featuredImage && (
                  <div className="aspect-video relative bg-muted">
                    <img 
                      src={project.featuredImage} 
                      alt={project.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {project.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {!project.isPublished && (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <ServiceIcon className="h-5 w-5" />
                        <Link 
                          href={`/portfolio/${project.slug}`}
                          className="hover:underline"
                        >
                          {project.title}
                        </Link>
                      </div>
                      {project.clientName && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {project.clientName}
                          {project.industry && ` • ${project.industry}`}
                        </p>
                      )}
                    </div>
                    {project.serviceType && (
                      <Badge className={serviceTypeColors[project.serviceType]}>
                        {project.serviceType.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.technologies.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {/* Links */}
                  <div className="flex items-center gap-2 text-sm">
                    {project.liveUrl && (
                      <a 
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Globe className="h-4 w-4" />
                        Live
                      </a>
                    )}
                    {project.githubUrl && (
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <Github className="h-4 w-4" />
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
                        <Video className="h-4 w-4" />
                        Demo
                      </a>
                    )}
                  </div>
                  
                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex gap-2">
                        <PortfolioActions 
                          project={project} 
                          userId={session.user.id}
                        />
                      </div>
                      <Link href={`/portfolio/${project.slug}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </GlassyContainer>
            );
          })
        )}
      </div>
    </div>
  );
}