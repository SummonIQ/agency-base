import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { sendGridService } from '@/lib/email/sendgrid';
import { databaseEmailService } from '@/lib/email/database-template-service';

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
      case 'send_email': {
        const { to, templateId, subject, content, variables, tracking, scheduledFor } = data;

        if (!to || (!templateId && (!subject || !content))) {
          return NextResponse.json(
            { error: 'Recipient and either template ID or subject/content are required' },
            { status: 400 }
          );
        }

        let emailSubject = subject;
        let emailContent = content;
        let textContent = '';

        // If using a template, render it
        if (templateId) {
          try {
            const template = await databaseEmailService.getTemplate(templateId);
            if (!template) {
              return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
              );
            }

            const rendered = await databaseEmailService.renderTemplate(template, variables || {});

            if (rendered.missingVariables && rendered.missingVariables.length > 0) {
              return NextResponse.json(
                {
                  error: 'Missing required variables',
                  missingVariables: rendered.missingVariables
                },
                { status: 400 }
              );
            }

            emailSubject = rendered.subject || emailSubject;
            emailContent = rendered.htmlContent || emailContent;
            textContent = rendered.textContent || '';
          } catch (templateError) {
            console.log('Template rendering failed, using direct content');
            // Fall back to direct content if template rendering fails
          }
        }

        // Replace variables in subject and content if provided
        if (variables && Object.keys(variables).length > 0) {
          Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            emailSubject = emailSubject.replace(regex, value as string);
            emailContent = emailContent.replace(regex, value as string);
          });
          
          // Create text version from HTML if not provided
          if (!textContent) {
            textContent = emailContent.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n\n');
          }
        }

        // Create email send record in database
        const recipients = Array.isArray(to) ? to.map(email => email.trim()) : [to.trim()];
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';
        const fromName = process.env.SENDGRID_FROM_NAME || 'Your Business';

        // Send emails to all recipients
        const results = [];
        for (const recipientEmail of recipients) {
          // Create database record
          const emailSend = await databaseEmailService.createEmailSend({
            templateId,
            toEmail: recipientEmail,
            fromEmail,
            fromName,
            subject: emailSubject,
            htmlContent: emailContent,
            textContent: textContent,
            userId: session.user.id,
            metadata: { tracking }
          });

          // Send email using SendGrid
          const result = await sendGridService.sendEmail({
            to: [{ email: recipientEmail }],
            subject: emailSubject,
            htmlContent: emailContent,
            textContent: textContent,
            templateId,
            trackingSettings: {
              clickTracking: tracking?.enabled !== false,
              openTracking: tracking?.enabled !== false,
              subscriptionTracking: false
            }
          });

          // Update database record with send result
          if (result.success) {
            await databaseEmailService.updateEmailSendStatus(emailSend.id, 'SENT', {
              externalId: result.messageId,
              sentAt: new Date()
            });
          } else {
            await databaseEmailService.updateEmailSendStatus(emailSend.id, 'FAILED', {
              errorMessage: result.error
            });
          }

          results.push({
            email: recipientEmail,
            success: result.success,
            messageId: result.messageId,
            error: result.error
          });
        }

        const allSuccessful = results.every(r => r.success);

        return NextResponse.json({
          success: allSuccessful,
          results,
          messageId: results.map(r => r.messageId).filter(Boolean).join(','),
          error: allSuccessful ? undefined : 'Some emails failed to send'
        });
      }

      case 'send_sequence_email': {
        const { recipientEmail, sequenceId, customVariables } = data;

        if (!recipientEmail || !sequenceId) {
          return NextResponse.json(
            { error: 'Recipient email and sequence ID are required' },
            { status: 400 }
          );
        }

        // Add recipient to sequence
        const recipient = await databaseEmailService.addRecipient({
          sequenceId,
          email: recipientEmail,
          customFields: customVariables || {}
        });

        return NextResponse.json({
          success: true,
          recipient
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}