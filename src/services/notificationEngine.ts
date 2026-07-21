// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION ENGINE SERVICE
// Dedicated service for all structured Founder and Client notifications.
// Handles:
//   - Project status updates
//   - QA pass/fail alerts
//   - Preview ready messages
//   - Payment reminders
//   - Manual intervention alerts
//   - Phase completion updates
// ─────────────────────────────────────────────────────────────────────────────
import { sendTextMessage } from './whatsapp';
import { supabase } from '../db/supabaseClient';

const FOUNDER_PHONE = process.env.FOUNDER_PHONE_NUMBER || '';

// ─────────────────────────────────────────────────────────────────────────────
// BASE NOTIFY
// ─────────────────────────────────────────────────────────────────────────────
async function sendNotification(
  projectId: string,
  toPhone: string,
  message: string,
  notificationType: string
): Promise<void> {
  console.log(`[NotificationEngine] [${notificationType}] → ${toPhone}: ${message.substring(0, 80)}...`);

  // Log to ai_logs
  await supabase.from('ai_logs').insert({
    project_id: projectId,
    agent_type: 'Orchestrator',
    action: `notification_${notificationType}`,
    payload: { toPhone, message, notificationType },
    status: 'Success',
  });

  if (!toPhone) {
    console.warn(`[NotificationEngine] No phone number set for notification: ${notificationType}`);
    return;
  }

  try {
    await sendTextMessage(toPhone, message);
  } catch (err: any) {
    console.error(`[NotificationEngine] Failed to send WhatsApp notification (${notificationType}):`, err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROJECT CREATED — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyProjectCreated(
  projectId: string,
  projectName: string,
  clientName: string,
  projectType: string
): Promise<void> {
  const message =
    `🚀 *New Project Started!*\n\n` +
    `📋 Project: *${projectName}*\n` +
    `👤 Client: ${clientName}\n` +
    `🏗️ Type: ${projectType}\n` +
    `🆔 ID: ${projectId}\n\n` +
    `The AI Agency has started working on this project. You'll be notified at each milestone.`;

  await sendNotification(projectId, FOUNDER_PHONE, message, 'project_created');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PHASE COMPLETE — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyPhaseComplete(
  projectId: string,
  projectName: string,
  phaseName: string,
  nextPhaseName: string
): Promise<void> {
  const message =
    `✅ *Phase Complete!*\n\n` +
    `📋 Project: *${projectName}*\n` +
    `✅ Completed: ${phaseName}\n` +
    `⏭️ Next: ${nextPhaseName}\n\n` +
    `The AI is continuing automatically.`;

  await sendNotification(projectId, FOUNDER_PHONE, message, 'phase_complete');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PREVIEW READY — Notify Founder with full summary
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyPreviewReady(
  projectId: string,
  projectName: string,
  qualityScore: number,
  testsPassedCount: number,
  totalTestsCount: number,
  previewUrl?: string
): Promise<void> {
  const message =
    `🎉 *Preview Ready for Review!*\n\n` +
    `📋 Project: *${projectName}*\n` +
    `📊 Quality Score: ${qualityScore}/100\n` +
    `✅ Tests Passed: ${testsPassedCount}/${totalTestsCount}\n` +
    (previewUrl ? `🔗 Preview: ${previewUrl}\n` : '') +
    `\n*Action Required:* Please review the project in your Dashboard and:\n` +
    `• ✅ Approve → Next phase starts\n` +
    `• 🔄 Request Changes → PM creates new tasks\n\n` +
    `💳 *Payment Reminder:* Don't forget to collect the next milestone payment from your client.`;

  await sendNotification(projectId, FOUNDER_PHONE, message, 'preview_ready');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. QA FAILED — Manual Intervention Required
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyManualInterventionRequired(
  projectId: string,
  projectName: string,
  attemptsUsed: number,
  remainingBugs: number,
  criticalBugs: number
): Promise<void> {
  const message =
    `🚨 *Manual Intervention Required*\n\n` +
    `📋 Project: *${projectName}*\n` +
    `🔄 Auto-fix Attempts: ${attemptsUsed}/${attemptsUsed}\n` +
    `🐛 Remaining Bugs: ${remainingBugs} (${criticalBugs} critical)\n\n` +
    `The AI could not fully resolve all issues automatically.\n\n` +
    `*Please review the project* in your Dashboard and decide:\n` +
    `• Fix manually\n` +
    `• Adjust requirements\n` +
    `• Close and escalate`;

  await sendNotification(projectId, FOUNDER_PHONE, message, 'manual_intervention');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PAYMENT REMINDER — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyPaymentReminder(
  projectId: string,
  projectName: string,
  clientName: string,
  milestoneLabel: string,
  amount?: string
): Promise<void> {
  const message =
    `💳 *Payment Reminder*\n\n` +
    `📋 Project: *${projectName}*\n` +
    `👤 Client: ${clientName}\n` +
    `🏁 Milestone: ${milestoneLabel}\n` +
    (amount ? `💰 Amount: ${amount}\n` : '') +
    `\nPlease collect payment before proceeding to the next phase.`;

  await sendNotification(projectId, FOUNDER_PHONE, message, 'payment_reminder');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CHANGES REQUESTED — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyChangesRequested(
  projectId: string,
  projectName: string,
  founderNote: string
): Promise<void> {
  const message =
    `🔄 *Changes Requested*\n\n` +
    `📋 Project: *${projectName}*\n\n` +
    `📝 Note: ${founderNote}\n\n` +
    `The PM Agent is creating new tasks and will restart the affected pipeline stages.`;

  await sendNotification(projectId, FOUNDER_PHONE, message, 'changes_requested');
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PROJECT APPROVED — Notify Founder
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyProjectApproved(
  projectId: string,
  projectName: string
): Promise<void> {
  const message =
    `✅ *Project Approved!*\n\n` +
    `📋 Project: *${projectName}*\n\n` +
    `The project has been marked as approved. The Deployment Agent will now prepare for delivery.`;

  await sendNotification(projectId, FOUNDER_PHONE, message, 'project_approved');
}
