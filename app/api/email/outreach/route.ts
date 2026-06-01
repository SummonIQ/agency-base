import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { outreachAutomationEngine } from '@/lib/email/email-outreach';

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
    const campaignId = searchParams.get('campaignId');

    switch (action) {
      case 'get_campaign_stats': {
        if (!campaignId) {
          return NextResponse.json(
            { error: 'Campaign ID is required' },
            { status: 400 }
          );
        }

        const stats = await outreachAutomationEngine.getCampaignStats(campaignId);

        if (!stats) {
          return NextResponse.json(
            { error: 'Campaign not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          stats
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Outreach API error:', error);
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
      case 'create_campaign': {
        const campaignData = {
          ...data,
          createdBy: session.user.id
        };

        const campaign = await outreachAutomationEngine.createCampaign(campaignData);

        return NextResponse.json({
          success: true,
          campaign
        });
      }

      case 'start_campaign': {
        const { campaignId } = data;

        if (!campaignId) {
          return NextResponse.json(
            { error: 'Campaign ID is required' },
            { status: 400 }
          );
        }

        await outreachAutomationEngine.startCampaign(campaignId);

        return NextResponse.json({
          success: true,
          message: 'Campaign started successfully'
        });
      }

      case 'create_workflow': {
        const workflow = await outreachAutomationEngine.createWorkflow(data);

        return NextResponse.json({
          success: true,
          workflow
        });
      }

      case 'trigger_workflow': {
        const { workflowId, triggerData } = data;

        if (!workflowId || !triggerData) {
          return NextResponse.json(
            { error: 'Workflow ID and trigger data are required' },
            { status: 400 }
          );
        }

        await outreachAutomationEngine.triggerWorkflow(workflowId, triggerData);

        return NextResponse.json({
          success: true,
          message: 'Workflow triggered successfully'
        });
      }

      case 'update_campaign_stats': {
        const { campaignId, event } = data;

        if (!campaignId || !event) {
          return NextResponse.json(
            { error: 'Campaign ID and event data are required' },
            { status: 400 }
          );
        }

        await outreachAutomationEngine.updateCampaignStats(campaignId, event);

        return NextResponse.json({
          success: true,
          message: 'Campaign stats updated successfully'
        });
      }

      case 'create_audience_segment': {
        const {
          name,
          description,
          contacts,
          filters,
          customFields
        } = data;

        if (!name || !contacts) {
          return NextResponse.json(
            { error: 'Segment name and contacts are required' },
            { status: 400 }
          );
        }

        // Validate and format contacts
        const formattedContacts = contacts.map((contact: any) => ({
          ...contact,
          addedAt: new Date(),
          status: contact.status || 'active'
        }));

        const segment = {
          id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          description,
          contacts: formattedContacts,
          customFields: customFields || {}
        };

        return NextResponse.json({
          success: true,
          segment
        });
      }

      case 'validate_campaign_setup': {
        const { targetAudience, sequenceId, personalization, scheduling } = data;

        const validationResults = {
          isValid: true,
          errors: [] as string[],
          warnings: [] as string[]
        };

        // Validate audience
        if (!targetAudience?.segments?.length) {
          validationResults.errors.push('At least one audience segment is required');
          validationResults.isValid = false;
        }

        // Validate sequence
        if (!sequenceId) {
          validationResults.errors.push('Email sequence is required');
          validationResults.isValid = false;
        }

        // Validate scheduling
        if (scheduling?.batchSize && scheduling.batchSize > 1000) {
          validationResults.warnings.push('Large batch sizes may impact deliverability');
        }

        // Validate personalization
        if (personalization?.enabled && personalization.customFields?.some((f: any) => f.required && !f.key)) {
          validationResults.errors.push('Required personalization fields must have keys');
          validationResults.isValid = false;
        }

        return NextResponse.json({
          success: true,
          validation: validationResults
        });
      }

      case 'generate_campaign_preview': {
        const { templateId, sampleContact, personalization } = data;

        if (!templateId || !sampleContact) {
          return NextResponse.json(
            { error: 'Template ID and sample contact are required' },
            { status: 400 }
          );
        }

        // This would integrate with the template engine to show a preview
        // For now, return a mock preview
        const preview = {
          subject: 'Personalized subject for ' + (sampleContact.firstName || 'there'),
          previewText: 'This is how your email will look...',
          html: '<p>Hello ' + (sampleContact.firstName || 'there') + ',</p><p>Sample email content...</p>',
          personalizationData: {
            firstName: sampleContact.firstName,
            company: sampleContact.company,
            customGreeting: 'Hope you are doing well!'
          }
        };

        return NextResponse.json({
          success: true,
          preview
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Outreach API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}