import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { automationSequenceService } from '@/lib/automation/sequence-service';
import { AutomationStatus, AutomationTrigger } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'EMAIL' | 'LINKEDIN' | 'MIXED' || undefined;
    const status = searchParams.get('status') as AutomationStatus || undefined;
    const trigger = searchParams.get('trigger') as AutomationTrigger || undefined;

    const sequences = await automationSequenceService.listSequences(session.user.id, {
      type,
      status,
      trigger
    });

    return NextResponse.json({
      success: true,
      sequences
    });

  } catch (error) {
    console.error('Sequences API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
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
      case 'create_sequence': {
        const { name, description, type, trigger, targetAudience } = data;

        if (!name || !type || !trigger) {
          return NextResponse.json(
            { error: 'Name, type, and trigger are required' },
            { status: 400 }
          );
        }

        const sequence = await automationSequenceService.createSequence({
          name,
          description,
          type,
          trigger,
          targetAudience,
          userId: session.user.id
        });

        return NextResponse.json({
          success: true,
          sequence
        });
      }

      case 'update_sequence': {
        const { sequenceId, ...updateData } = data;

        if (!sequenceId) {
          return NextResponse.json(
            { error: 'Sequence ID is required' },
            { status: 400 }
          );
        }

        const sequence = await automationSequenceService.updateSequence(sequenceId, updateData);

        return NextResponse.json({
          success: true,
          sequence
        });
      }

      case 'update_status': {
        const { sequenceId, status } = data;

        if (!sequenceId || !status) {
          return NextResponse.json(
            { error: 'Sequence ID and status are required' },
            { status: 400 }
          );
        }

        const sequence = await automationSequenceService.updateSequenceStatus(sequenceId, status);

        return NextResponse.json({
          success: true,
          sequence
        });
      }

      case 'delete_sequence': {
        const { sequenceId } = data;

        if (!sequenceId) {
          return NextResponse.json(
            { error: 'Sequence ID is required' },
            { status: 400 }
          );
        }

        await automationSequenceService.deleteSequence(sequenceId);

        return NextResponse.json({
          success: true,
          message: 'Sequence deleted successfully'
        });
      }

      case 'add_step': {
        const { sequenceId, stepNumber, type, name, delayDays, delayHours, templateId, customContent, conditions } = data;

        if (!sequenceId || !stepNumber || !type || !name) {
          return NextResponse.json(
            { error: 'Sequence ID, step number, type, and name are required' },
            { status: 400 }
          );
        }

        const step = await automationSequenceService.addStep({
          sequenceId,
          stepNumber,
          type,
          name,
          delayDays,
          delayHours,
          templateId,
          customContent,
          conditions
        });

        return NextResponse.json({
          success: true,
          step
        });
      }

      case 'update_step': {
        const { stepId, ...stepData } = data;

        if (!stepId) {
          return NextResponse.json(
            { error: 'Step ID is required' },
            { status: 400 }
          );
        }

        const step = await automationSequenceService.updateStep(stepId, stepData);

        return NextResponse.json({
          success: true,
          step
        });
      }

      case 'remove_step': {
        const { stepId } = data;

        if (!stepId) {
          return NextResponse.json(
            { error: 'Step ID is required' },
            { status: 400 }
          );
        }

        await automationSequenceService.removeStep(stepId);

        return NextResponse.json({
          success: true,
          message: 'Step removed successfully'
        });
      }

      case 'reorder_steps': {
        const { sequenceId, stepIds } = data;

        if (!sequenceId || !stepIds || !Array.isArray(stepIds)) {
          return NextResponse.json(
            { error: 'Sequence ID and step IDs array are required' },
            { status: 400 }
          );
        }

        await automationSequenceService.reorderSteps(sequenceId, stepIds);

        return NextResponse.json({
          success: true,
          message: 'Steps reordered successfully'
        });
      }

      case 'add_recipient': {
        const { sequenceId, leadId, prospectId, email, firstName, lastName, company, jobTitle, customFields } = data;

        if (!sequenceId || !email) {
          return NextResponse.json(
            { error: 'Sequence ID and email are required' },
            { status: 400 }
          );
        }

        const recipient = await automationSequenceService.addRecipient({
          sequenceId,
          leadId,
          prospectId,
          email,
          firstName,
          lastName,
          company,
          jobTitle,
          customFields
        });

        return NextResponse.json({
          success: true,
          recipient
        });
      }

      case 'add_bulk_recipients': {
        const { sequenceId, recipients } = data;

        if (!sequenceId || !recipients || !Array.isArray(recipients)) {
          return NextResponse.json(
            { error: 'Sequence ID and recipients array are required' },
            { status: 400 }
          );
        }

        const count = await automationSequenceService.addBulkRecipients(sequenceId, recipients);

        return NextResponse.json({
          success: true,
          message: `Added ${count} recipients to sequence`,
          count
        });
      }

      case 'update_recipient_status': {
        const { recipientId, status, metadata } = data;

        if (!recipientId || !status) {
          return NextResponse.json(
            { error: 'Recipient ID and status are required' },
            { status: 400 }
          );
        }

        const recipient = await automationSequenceService.updateRecipientStatus(recipientId, status, metadata);

        return NextResponse.json({
          success: true,
          recipient
        });
      }

      case 'process_sequence': {
        const { sequenceId } = data;

        if (!sequenceId) {
          return NextResponse.json(
            { error: 'Sequence ID is required' },
            { status: 400 }
          );
        }

        const result = await automationSequenceService.processSequence(sequenceId);

        return NextResponse.json({
          success: true,
          result
        });
      }

      case 'get_performance': {
        const { sequenceId } = data;

        if (!sequenceId) {
          return NextResponse.json(
            { error: 'Sequence ID is required' },
            { status: 400 }
          );
        }

        const performance = await automationSequenceService.getSequencePerformance(sequenceId);

        return NextResponse.json({
          success: true,
          performance
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Sequences API error:', error);
    return NextResponse.json(
      { error: 'Sequence operation failed' },
      { status: 500 }
    );
  }
}
