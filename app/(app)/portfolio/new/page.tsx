import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import PortfolioForm from '@/components/portfolio/portfolio-form';

export default async function NewPortfolioPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Portfolio Project</h1>
          <p className="text-muted-foreground">
            Showcase your best work to potential clients
          </p>
        </div>

        <PortfolioForm userId={session.user.id} />
      </div>
    </div>
  );
}