import { ResumeAnalysisStatus, ResumeOptimizationStatus } from '@prisma/client';

import { getPrivateUserChannel } from '@/lib/events/channels';
import { sendDataUpdate } from '@/lib/events/data-update';
import { getCurrentUser } from '@/lib/user';
import { DataEventType } from '@/types/events';

export async function sendResumeAnalysisProgress({
  id,
  name,
  progress,
  status,
}: {
  id: string;
  name: string;
  progress: number;
  status: ResumeAnalysisStatus;
}) {
  const user = await getCurrentUser();
  const userChannel = getPrivateUserChannel(user.id);

  sendDataUpdate({
    channel: userChannel,
    payload: {
      data: {
        id,
        name,
        progress,
        status: ResumeAnalysisStatus.ANALYZING,
      },
      type: DataEventType.RESUME_ANALYSIS_PROGRESS,
    },
  });
}

export async function sendResumeOptimizationProgress({
  id,
  name,
  progress,
  status,
}: {
  id: string;
  name: string;
  progress: number;
  status: ResumeOptimizationStatus;
}) {
  const user = await getCurrentUser();
  const userChannel = getPrivateUserChannel(user.id);

  sendDataUpdate({
    channel: userChannel,
    payload: {
      data: {
        id,
        name,
        progress,
        status,
      },
      type: DataEventType.RESUME_OPTIMIZATION_PROGRESS,
    },
  });
}
