import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { emailComplianceService } from '@/lib/email/email-compliance';
import { emailDeliverabilityService } from '@/lib/email/email-deliverability';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const email = searchParams.get('email');

    switch (action) {
      case 'check_suppression': {
        if (!email) {
          return NextResponse.json(
            { error: 'Email parameter is required' },
            { status: 400 }
          );
        }

        const isSuppressed = emailComplianceService.isSuppressed(email);
        const entry = emailComplianceService.getSuppressionListEntry(email);

        return NextResponse.json({
          success: true,
          isSuppressed,
          suppressionEntry: entry
        });
      }

      case 'export_user_data': {
        if (!email) {
          return NextResponse.json(
            { error: 'Email parameter is required' },
            { status: 400 }
          );
        }

        const userData = await emailComplianceService.exportUserData(email);

        return NextResponse.json({
          success: true,
          userData
        });
      }

      case 'check_domain_reputation': {
        const domain = searchParams.get('domain');
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain parameter is required' },
            { status: 400 }
          );
        }

        const reputation = await emailDeliverabilityService.getDomainReputation(domain);
        const blacklistCheck = await emailDeliverabilityService.checkBlacklists(domain);

        return NextResponse.json({
          success: true,
          reputation,
          blacklistCheck
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, data } = body;

    switch (action) {
      case 'validate_email': {
        const { to, from, fromName, subject, html, text } = data;

        if (!to || !from || !subject || !html) {
          return NextResponse.json(
            { error: 'Missing required email fields' },
            { status: 400 }
          );
        }

        const emailMessage = { to, from, fromName, subject, html, text };
        const validation = await emailComplianceService.validateEmail(emailMessage);

        // Analyze content for deliverability
        const contentAnalysis = await emailDeliverabilityService.analyzeEmailContent(
          html,
          text || '',
          subject
        );

        const fromDomain = from.split('@')[1];
        const deliverabilityScore = await emailDeliverabilityService.getDeliverabilityScore(
          fromDomain,
          contentAnalysis,
          Array.isArray(to) ? to.length : 1
        );

        return NextResponse.json({
          success: true,
          compliance: validation,
          contentAnalysis,
          deliverabilityScore
        });
      }

      case 'add_to_suppression': {
        const { email, reason, source, metadata } = data;

        if (!email || !reason) {
          return NextResponse.json(
            { error: 'Email and reason are required' },
            { status: 400 }
          );
        }

        emailComplianceService.addToSuppressionList({
          email,
          reason,
          addedAt: new Date(),
          source: source || 'manual',
          metadata
        });

        return NextResponse.json({
          success: true,
          message: 'Email added to suppression list'
        });
      }

      case 'remove_from_suppression': {
        const { email } = data;

        if (!email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }

        emailComplianceService.removeFromSuppressionList(email);

        return NextResponse.json({
          success: true,
          message: 'Email removed from suppression list'
        });
      }

      case 'process_bounce': {
        const { email, bounceType, reason } = data;

        if (!email || !bounceType) {
          return NextResponse.json(
            { error: 'Email and bounce type are required' },
            { status: 400 }
          );
        }

        await emailComplianceService.processBounce(email, bounceType, reason);

        return NextResponse.json({
          success: true,
          message: 'Bounce processed successfully'
        });
      }

      case 'process_complaint': {
        const { email, reason } = data;

        if (!email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }

        await emailComplianceService.processComplaint(email, reason);

        return NextResponse.json({
          success: true,
          message: 'Complaint processed successfully'
        });
      }

      case 'delete_user_data': {
        const { email } = data;

        if (!email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }

        await emailComplianceService.deleteUserData(email);

        return NextResponse.json({
          success: true,
          message: 'User data deleted successfully'
        });
      }

      case 'warm_up_domain': {
        const { domain, warmUpPlan } = data;

        if (!domain || !warmUpPlan) {
          return NextResponse.json(
            { error: 'Domain and warm-up plan are required' },
            { status: 400 }
          );
        }

        const warmUpStatus = await emailDeliverabilityService.warmUpDomain(domain, warmUpPlan);

        return NextResponse.json({
          success: true,
          warmUpStatus
        });
      }

      case 'generate_deliverability_report': {
        const { fromDomain, html, text, subject, recipientCount } = data;

        if (!fromDomain || !html || !subject) {
          return NextResponse.json(
            { error: 'Missing required fields for report generation' },
            { status: 400 }
          );
        }

        const contentAnalysis = await emailDeliverabilityService.analyzeEmailContent(
          html,
          text || '',
          subject
        );

        const deliverabilityScore = await emailDeliverabilityService.getDeliverabilityScore(
          fromDomain,
          contentAnalysis,
          recipientCount || 1
        );

        const domainReputation = await emailDeliverabilityService.getDomainReputation(fromDomain);

        const report = emailDeliverabilityService.generateDeliverabilityReport(
          deliverabilityScore,
          contentAnalysis,
          domainReputation
        );

        return NextResponse.json({
          success: true,
          contentAnalysis,
          deliverabilityScore,
          domainReputation,
          report
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}