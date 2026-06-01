import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { recruitingService } from '@/lib/recruiting/recruiting-service';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = session.user.id;

    switch (action) {
      case 'candidates':
        const candidateFilters = {
          status: searchParams.get('status') || undefined,
          skills: searchParams.get('skills')?.split(',') || undefined,
          location: searchParams.get('location') || undefined,
          rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
          search: searchParams.get('search') || undefined,
          talentPoolId: searchParams.get('talentPoolId') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        };
        const candidates = await recruitingService.getCandidates(userId, candidateFilters);
        return NextResponse.json({ success: true, candidates });

      case 'candidate':
        const candidateId = searchParams.get('candidateId');
        if (!candidateId) {
          return NextResponse.json({ success: false, error: 'Candidate ID required' }, { status: 400 });
        }
        const candidate = await recruitingService.getCandidate(candidateId, userId);
        return NextResponse.json({ success: true, candidate });

      case 'applications':
        const applicationFilters = {
          status: searchParams.get('status') || undefined,
          candidateId: searchParams.get('candidateId') || undefined,
          company: searchParams.get('company') || undefined,
          position: searchParams.get('position') || undefined,
          search: searchParams.get('search') || undefined,
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        };
        const applications = await recruitingService.getApplications(userId, applicationFilters);
        return NextResponse.json({ success: true, applications });

      case 'talent_pools':
        const talentPools = await recruitingService.getTalentPools(userId);
        return NextResponse.json({ success: true, talentPools });

      case 'interviews':
        const interviewFilters = {
          candidateId: searchParams.get('candidateId') || undefined,
          applicationId: searchParams.get('applicationId') || undefined,
          status: searchParams.get('status') || undefined,
          type: searchParams.get('type') || undefined,
          upcoming: searchParams.get('upcoming') === 'true',
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
        };
        const interviews = await recruitingService.getInterviews(userId, interviewFilters);
        return NextResponse.json({ success: true, interviews });

      case 'stats':
        const stats = await recruitingService.getRecruitingStats(userId);
        return NextResponse.json({ success: true, stats });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Recruiting API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;
    const userId = session.user.id;

    switch (action) {
      case 'create_candidate':
        const candidate = await recruitingService.createCandidate({
          ...data,
          userId,
        });
        return NextResponse.json({ success: true, candidate });

      case 'update_candidate':
        const { candidateId, ...candidateUpdateData } = data;
        const updatedCandidate = await recruitingService.updateCandidate(candidateId, userId, candidateUpdateData);
        return NextResponse.json({ success: true, candidate: updatedCandidate });

      case 'delete_candidate':
        await recruitingService.deleteCandidate(data.candidateId, userId);
        return NextResponse.json({ success: true });

      case 'create_application':
        const application = await recruitingService.createApplication({
          ...data,
          userId,
        });
        return NextResponse.json({ success: true, application });

      case 'update_application':
        const { applicationId, ...applicationUpdateData } = data;
        const updatedApplication = await recruitingService.updateApplication(applicationId, userId, applicationUpdateData);
        return NextResponse.json({ success: true, application: updatedApplication });

      case 'create_talent_pool':
        const talentPool = await recruitingService.createTalentPool({
          ...data,
          userId,
        });
        return NextResponse.json({ success: true, talentPool });

      case 'add_candidate_to_pool':
        await recruitingService.addCandidateToTalentPool(data.talentPoolId, data.candidateId, data.notes);
        return NextResponse.json({ success: true });

      case 'remove_candidate_from_pool':
        await recruitingService.removeCandidateFromTalentPool(data.talentPoolId, data.candidateId);
        return NextResponse.json({ success: true });

      case 'create_interview':
        const interview = await recruitingService.createInterview({
          ...data,
          scheduledAt: new Date(data.scheduledAt),
          userId,
        });
        return NextResponse.json({ success: true, interview });

      case 'update_interview':
        const { interviewId, ...interviewUpdateData } = data;
        if (interviewUpdateData.scheduledAt) {
          interviewUpdateData.scheduledAt = new Date(interviewUpdateData.scheduledAt);
        }
        const updatedInterview = await recruitingService.updateInterview(interviewId, userId, interviewUpdateData);
        return NextResponse.json({ success: true, interview: updatedInterview });

      case 'add_candidate_note':
        await recruitingService.addCandidateNote(data.candidateId, userId, data.content, data.type);
        return NextResponse.json({ success: true });

      case 'add_application_note':
        await recruitingService.addApplicationNote(data.applicationId, userId, data.content, data.type);
        return NextResponse.json({ success: true });

      case 'import_candidates':
        const importResult = await recruitingService.importCandidates(userId, data.candidates);
        return NextResponse.json({ success: true, result: importResult });

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Recruiting API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
