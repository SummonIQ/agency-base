import { toast } from '@/components/ui/use-toast';

// Success notifications
export const showSuccess = {
  clientCreated: () =>
    toast({
      title: 'Client created',
      description: 'Your new client has been successfully added.',
    }),
  
  projectCreated: () =>
    toast({
      title: 'Project created',
      description: 'Your new project has been successfully created.',
    }),
  
  leadCreated: () =>
    toast({
      title: 'Lead added',
      description: 'New lead has been added to your pipeline.',
    }),
  
  invoiceSent: () =>
    toast({
      title: 'Invoice sent',
      description: 'Your invoice has been sent to the client.',
    }),
  
  contractSigned: () =>
    toast({
      title: 'Contract signed',
      description: 'The contract has been successfully signed.',
    }),
  
  timeTracked: (duration: string) =>
    toast({
      title: 'Time logged',
      description: `Successfully tracked ${duration} of work.`,
    }),
  
  dataExported: (type: string) =>
    toast({
      title: 'Export completed',
      description: `Your ${type} data has been exported successfully.`,
    }),
  
  settingsSaved: () =>
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
    }),
  
  profileUpdated: () =>
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been saved.',
    }),
  
  passwordChanged: () =>
    toast({
      title: 'Password changed',
      description: 'Your password has been updated successfully.',
    }),
};

// Error notifications
export const showError = {
  generic: (message?: string) =>
    toast({
      variant: 'destructive',
      title: 'Error',
      description: message || 'Something went wrong. Please try again.',
    }),
  
  networkError: () =>
    toast({
      variant: 'destructive',
      title: 'Network error',
      description: 'Please check your internet connection and try again.',
    }),
  
  validationError: (field: string) =>
    toast({
      variant: 'destructive',
      title: 'Validation error',
      description: `Please check the ${field} field and try again.`,
    }),
  
  permissionDenied: () =>
    toast({
      variant: 'destructive',
      title: 'Permission denied',
      description: 'You do not have permission to perform this action.',
    }),
  
  notFound: (resource: string) =>
    toast({
      variant: 'destructive',
      title: 'Not found',
      description: `The ${resource} could not be found.`,
    }),
  
  rateLimited: () =>
    toast({
      variant: 'destructive',
      title: 'Too many requests',
      description: 'Please wait a moment before trying again.',
    }),
  
  sessionExpired: () =>
    toast({
      variant: 'destructive',
      title: 'Session expired',
      description: 'Please log in again to continue.',
    }),
};

// Info notifications
export const showInfo = {
  saving: () =>
    toast({
      title: 'Saving...',
      description: 'Your changes are being saved.',
    }),
  
  uploading: () =>
    toast({
      title: 'Uploading...',
      description: 'Your file is being uploaded.',
    }),
  
  processing: () =>
    toast({
      title: 'Processing...',
      description: 'This may take a few moments.',
    }),
  
  emailSent: () =>
    toast({
      title: 'Email sent',
      description: 'Your email has been sent successfully.',
    }),
  
  reminderSet: () =>
    toast({
      title: 'Reminder set',
      description: 'You will be notified at the scheduled time.',
    }),
  
  copied: () =>
    toast({
      title: 'Copied to clipboard',
      description: 'The content has been copied to your clipboard.',
    }),
  
  autoSave: () =>
    toast({
      title: 'Auto-saved',
      description: 'Your changes have been automatically saved.',
    }),
};

// Warning notifications
export const showWarning = {
  unsavedChanges: () =>
    toast({
      title: 'Unsaved changes',
      description: 'You have unsaved changes. Save before leaving?',
    }),
  
  lowBalance: (amount: string) =>
    toast({
      title: 'Low balance',
      description: `Your account balance is ${amount}. Consider adding funds.`,
    }),
  
  quotaLimited: (resource: string) =>
    toast({
      title: 'Quota limit approaching',
      description: `You are approaching your ${resource} limit.`,
    }),
  
  maintenance: () =>
    toast({
      title: 'Maintenance scheduled',
      description: 'System maintenance is scheduled for tonight.',
    }),
};