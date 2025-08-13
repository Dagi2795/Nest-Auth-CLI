export const defaultFields = [
  { name: 'firstName', type: 'string', required: false },
  { name: 'lastName', type: 'string', required: false },
  { name: 'username', type: 'string', required: false },
  { name: 'email', type: 'string', required: true },
  { name: 'password', type: 'string', required: true },
];

export const availableFeatures = [
  'forgot-password',
  'reset-password',
  'otp-email',
  'two-step-verification',
  'delete-account',
  'user-list',
  'add-user',
  'disable-user',
  'history-tracking',
];

export interface Field {
  name: string;
  type: string;
  required: boolean;
}

export interface Answers {
  features: string[];
  addFields: boolean;
  additionalFields?: string;
  renameFields: boolean;
  renamedFields?: string;
  loginIdentifiers: string[];
  autoDetectLogin: boolean;
  authType: 'user' | 'admin' | 'both';
  otpDelivery?: 'sms' | 'email' | 'both';
  packageManager: 'npm' | 'yarn' | 'pnpm';
  confirm: boolean; // Added to fix TS2339
}

export interface Config {
  registrationFields: Field[];
  loginIdentifiers: string[];
  features: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm';
  autoDetectLogin: boolean;
  authType: 'user' | 'admin' | 'both';
  otpDelivery: 'sms' | 'email' | 'both';
}