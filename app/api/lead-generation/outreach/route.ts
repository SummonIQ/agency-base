import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { outreachTemplateEngine } from '@/lib/lead-generation/outreach-templates';
import { outreachService } from '@/lib/lead-generation/outreach-service';
import { emailService } from '@/lib/email/service';

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
      case 'generate_message': {
        const { templateId, company, contact, senderInfo } = data;

        // Get the template
        const templates = outreachTemplateEngine.getTemplates();
        const template = templates.find(t => t.id === templateId);

        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }

        // Generate variables
        const variables = outreachTemplateEngine.generateVariablesFromProspect(
          company,
          contact,
          senderInfo
        );

        // Generate message
        const message = outreachTemplateEngine.generateMessage(template, variables);

        return NextResponse.json(message);
      }

      case 'send_email': {
        const { leadId, templateId, customSubject, customContent } = data;

        // Verify lead exists and belongs to user
        const lead = await db.agencyLead.findFirst({
          where: {
            id: leadId,
            userId: session.user.id
          }
        });

        if (!lead) {
          return NextResponse.json(
            { error: 'Lead not found' },
            { status: 404 }
          );
        }

        if (!lead.contactEmail) {
          return NextResponse.json(
            { error: 'Lead has no email address' },
            { status: 400 }
          );
        }

        let subject = customSubject;
        let content = customContent;

        // If using a template, generate the message
        if (templateId && !customContent) {
          const templates = outreachTemplateEngine.getTemplates();
          const template = templates.find(t => t.id === templateId);

          if (!template) {
            return NextResponse.json(
              { error: 'Template not found' },
              { status: 404 }
            );
          }

          const senderInfo = {
            name: `${session.user.firstName} ${session.user.lastName}`,
            agencyName: 'Your Agency',
            similarClient: 'a similar company'
          };

          const company = {
            name: lead.companyName || 'your company',
            industry: 'Software',
            techStack: ['React', 'Node.js']
          };

          const contact = {
            firstName: lead.contactName?.split(' ')[0] || 'there',
            lastName: lead.contactName?.split(' ').slice(1).join(' ') || '',
            jobTitle: 'Decision Maker'
          };

          const variables = outreachTemplateEngine.generateVariablesFromProspect(
            company,
            contact,
            senderInfo
          );

          const message = outreachTemplateEngine.generateMessage(template, variables);
          subject = message.subject || 'Partnership Opportunity';
          content = message.content;
        }

        // Send email using email service
        const emailResult = await emailService.sendEmail({
          to: lead.contactEmail,
          from: session.user.email,
          subject: subject || 'Partnership Opportunity',
          html: content.replace(/\n/g, '<br>'),
          text: content,
          trackingEnabled: true,
          tags: ['outreach', 'lead-generation', templateId || 'custom'],
          replyTo: session.user.email
        });

        if (!emailResult.success) {
          return NextResponse.json(
            { error: emailResult.error || 'Failed to send email' },
            { status: 500 }
          );
        }

        // Create outreach activity record
        const activity = await db.outreachActivity.create({
          data: {
            userId: session.user.id,
            leadId,
            templateId,
            type: 'email',
            subject,
            content,
            status: 'sent',
            sentAt: new Date()
          }
        });

        // Update lead status
        await db.agencyLead.update({
          where: { id: leadId },
          data: {
            status: 'CONTACTED',
            lastContactDate: new Date()
          }
        });

        // Create communication record
        await db.communication.create({
          data: {
            userId: session.user.id,
            leadId,
            type: 'EMAIL',
            subject,
            content,
            direction: 'outbound',
            sentAt: new Date()
          }
        });

        return NextResponse.json({
          success: true,
          messageId: emailResult.messageId,
          activity
        });
      }

      case 'create_campaign': {
        const { name, description, leadIds, config } = data;

        if (!leadIds || leadIds.length === 0) {
          return NextResponse.json(
            { error: 'No leads selected for campaign' },
            { status: 400 }
          );
        }

        const campaignConfig = {
          name,
          description,
          sequence: config.sequence || [],
          targetAudience: config.targetAudience || {},
          senderInfo: {
            name: `${session.user.firstName} ${session.user.lastName}`,
            email: session.user.email,
            agencyName: config.agencyName || 'Your Agency'
          },
          schedule: {
            timezone: config.timezone || 'America/New_York',
            businessHoursOnly: config.businessHoursOnly ?? true,
            startHour: config.startHour || 9,
            endHour: config.endHour || 17,
            weekdaysOnly: config.weekdaysOnly ?? true
          }
        };

        const results = await outreachService.createCampaign(
          session.user.id,
          campaignConfig,
          leadIds
        );

        return NextResponse.json({
          success: true,
          results,
          totalLeads: leadIds.length,
          successCount: results.filter(r => r.success).length
        });
      }

      case 'handle_response': {
        const { leadId, responseType } = data;

        await outreachService.handleEmailResponse(
          session.user.id,
          leadId,
          responseType
        );

        return NextResponse.json({ success: true });
      }

      case 'get_metrics': {
        const { startDate, endDate } = data;

        const dateRange = startDate && endDate ? {
          start: new Date(startDate),
          end: new Date(endDate)
        } : undefined;

        const metrics = await outreachService.getCampaignMetrics(
          session.user.id,
          dateRange
        );

        return NextResponse.json(metrics);
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Outreach error:', error);
    return NextResponse.json(
      { error: 'Failed to process outreach action' },
      { status: 500 }
    );
  }
}