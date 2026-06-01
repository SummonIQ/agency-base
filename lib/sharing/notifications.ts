import { ShareLink, ShareableResourceType } from './types';
import { User } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError, ErrorCode } from '@/lib/errors';
import { createNotification } from '@/lib/notifications';
import { NotificationCategory, NotificationChannel, NotificationPriority } from '@/lib/notifications/types';

interface SendShareNotificationProps {
  recipientEmail: string;
  resourceType: ShareableResourceType;
  resourceId: string;
  shareLink: ShareLink;
  sender: User;
}

/**
 * Send a notification about a shared resource
 */
export async function sendShareNotification({
  recipientEmail,
  resourceType,
  resourceId,
  shareLink,
  sender
}: SendShareNotificationProps): Promise<void> {
  try {
    // Get resource info to include in the notification
    let resourceName: string = '';
    let resourceDescription: string = '';
    
    if (resourceType === ShareableResourceType.JOB_LEAD) {
      const jobLead = await db.jobLead.findUnique({
        where: { id: resourceId },
        include: { jobListing: true }
      });
      
      if (!jobLead) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Job lead not found'
        });
      }
      
      resourceName = jobLead.jobListing?.title || 'Job Lead';
      resourceDescription = jobLead.jobListing?.company || '';
    } else if (resourceType === ShareableResourceType.RESUME) {
      const resume = await db.resume.findUnique({
        where: { id: resourceId }
      });
      
      if (!resume) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'Resume not found'
        });
      }
      
      resourceName = resume.name;
      resourceDescription = resume.description || '';
    }

    const recipient = await db.user.findUnique({
      where: { email: recipientEmail },
      select: { id: true },
    });

    if (!recipient) {
      console.log(`Share notification skipped - no user found for ${recipientEmail}.`);
      return;
    }

    await createNotification({
      userId: recipient.id,
      recipientEmail,
      type: `SHARE_${resourceType}`,
      title: `${sender.name} shared a ${resourceType === ShareableResourceType.JOB_LEAD ? 'job lead' : 'resume'} with you`,
      content: `${sender.name} has shared "${resourceName}" with you.${resourceDescription ? ` ${resourceDescription}` : ''}`,
      metadata: {
        resourceType,
        resourceId,
        shareToken: shareLink.token,
        senderId: sender.id,
        senderName: sender.name,
        senderEmail: sender.email,
      },
      category: NotificationCategory.SHARE,
      priority: NotificationPriority.MEDIUM,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    });
    
  } catch (error) {
    console.error('Error sending share notification:', error);
    throw error;
  }
}
