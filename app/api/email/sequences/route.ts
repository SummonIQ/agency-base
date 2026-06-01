import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { databaseEmailService } from '@/lib/email/database-template-service';
import { EmailSequenceStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as EmailSequenceStatus || undefined;

    const sequences = await databaseEmailService.listSequences(session.user.id, {
      status
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
        const { name, description } = data;

        if (!name) {
          return NextResponse.json(
            { error: 'Sequence name is required' },
            { status: 400 }
          );
        }

        const sequence = await databaseEmailService.createSequence({
          name,
          description,
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

        const sequence = await databaseEmailService.updateSequence(sequenceId, updateData);

        return NextResponse.json({
          success: true,
          sequence
        });
      }

      case 'update_sequence_status': {
        const { sequenceId, status } = data;

        if (!sequenceId || !status) {
          return NextResponse.json(
            { error: 'Sequence ID and status are required' },
            { status: 400 }
          );
        }

        const sequence = await databaseEmailService.updateSequenceStatus(sequenceId, status as EmailSequenceStatus);

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

        await databaseEmailService.deleteSequence(sequenceId);

        return NextResponse.json({
          success: true,
          message: 'Sequence deleted successfully'
        });
      }

      case 'add_sequence_step': {
        const { sequenceId, templateId, stepNumber, delayDays, delayHours } = data;

        if (!sequenceId || !templateId || stepNumber === undefined) {
          return NextResponse.json(
            { error: 'Sequence ID, template ID, and step number are required' },
            { status: 400 }
          );
        }

        const step = await databaseEmailService.addSequenceStep({
          sequenceId,
          templateId,
          stepNumber,
          delayDays,
          delayHours
        });

        return NextResponse.json({
          success: true,
          step
        });
      }

      case 'remove_sequence_step': {
        const { stepId } = data;

        if (!stepId) {
          return NextResponse.json(
            { error: 'Step ID is required' },
            { status: 400 }
          );
        }

        await databaseEmailService.removeSequenceStep(stepId);

        return NextResponse.json({
          success: true,
          message: 'Step removed successfully'
        });
      }

      case 'add_recipient': {
        const { sequenceId, email, name, customFields } = data;

        if (!sequenceId || !email) {
          return NextResponse.json(
            { error: 'Sequence ID and email are required' },
            { status: 400 }
          );
        }

        const recipient = await databaseEmailService.addRecipient({
          sequenceId,
          email,
          name,
          customFields
        });

        return NextResponse.json({
          success: true,
          recipient
        });
      }

      case 'remove_recipient': {
        const { recipientId } = data;

        if (!recipientId) {
          return NextResponse.json(
            { error: 'Recipient ID is required' },
            { status: 400 }
          );
        }

        await databaseEmailService.removeRecipient(recipientId);

        return NextResponse.json({
          success: true,
          message: 'Recipient removed successfully'
        });
      }

      case 'get_sequence_stats': {
        const { sequenceId } = data;

        if (!sequenceId) {
          return NextResponse.json(
            { error: 'Sequence ID is required' },
            { status: 400 }
          );
        }

        const stats = await databaseEmailService.getSequenceStats(sequenceId);

        return NextResponse.json({
          success: true,
          stats
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