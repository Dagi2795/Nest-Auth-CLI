import inquirer from 'inquirer';
import chalk from 'chalk';
import boxen from 'boxen';
import { Answers, Config, defaultFields, availableFeatures } from '../types';

export async function promptConfig(): Promise<Config> {
  console.log(boxen(
    chalk.cyan('📋 Default fields:\n') +
    defaultFields.map(f => `- ${f.name}: ${f.type}${f.required ? ' (required)' : ''}`).join('\n'),
    { padding: 1, margin: 1, borderStyle: 'classic', borderColor: 'cyan' }
  ));

  const answers: Answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features',
      choices: availableFeatures.map(feature => ({ name: feature, value: feature })),
    },
    {
      type: 'confirm',
      name: 'addFields',
      message: 'Do you want to add additional fields?',
      default: false,
    },
    {
      type: 'input',
      name: 'additionalFields',
      message: 'Enter additional fields (format: name:type:required, separated by commas)',
      when: (answers: Answers) => answers.addFields,
      validate: (input: string) => {
        if (!input) return 'Please provide at least one field';
        const fields = input.split(',').map((f: string) => f.trim());
        for (const field of fields) {
          const [name, type, required] = field.split(':');
          if (!name || !type || !['string', 'number'].includes(type) || !['true', 'false'].includes(required)) {
            return 'Invalid format. Use name:type:required (e.g., phoneNumber:string:false)';
          }
        }
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'renameFields',
      message: 'Do you want to rename default fields?',
      default: false,
    },
    {
      type: 'input',
      name: 'renamedFields',
      message: 'Enter renamed fields (format: oldName:newName, separated by commas)',
      when: (answers: Answers) => answers.renameFields,
      validate: (input: string) => {
        if (!input) return 'Please provide at least one field rename';
        const renames = input.split(',').map((r: string) => r.trim());
        for (const rename of renames) {
          const [oldName, newName] = rename.split(':');
          if (!oldName || !newName || !defaultFields.some(f => f.name === oldName)) {
            return 'Invalid format or unknown field. Use oldName:newName (e.g., firstName:name)';
          }
        }
        return true;
      },
    },
    {
      type: 'checkbox',
      name: 'loginIdentifiers',
      message: 'Select login identifiers',
      choices: ['email', 'username'],
      default: ['email'],
      validate: (input: string[]) => input.length > 0 || 'Select at least one identifier',
    },
    {
      type: 'confirm',
      name: 'autoDetectLogin',
      message: 'Enable auto-detection of login identifiers?',
      default: false,
    },
    {
      type: 'list',
      name: 'authType',
      message: 'Select authentication type',
      choices: ['user', 'admin', 'both'],
      default: 'both',
    },
    {
      type: 'list',
      name: 'otpDelivery',
      message: 'Select OTP delivery method',
      choices: ['sms', 'email', 'both'],
      default: 'email',
      when: (answers: Answers) => answers.features.includes('otp-email') || answers.features.includes('two-step-verification'),
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Select package manager',
      choices: ['npm', 'yarn', 'pnpm'],
      default: 'npm',
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to proceed?',
      default: true,
    },
  ]);

  if (!answers.confirm) {
    console.log(boxen(chalk.yellow('Cancelled.'), { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'yellow' }));
    process.exit(0);
  }

  let registrationFields = [...defaultFields];

  if (answers.renameFields && answers.renamedFields) {
    const renames = answers.renamedFields.split(',').map((r: string) => r.trim());
    registrationFields = registrationFields.map(field => {
      const rename = renames.find(r => r.startsWith(`${field.name}:`));
      if (rename) {
        const [, newName] = rename.split(':');
        return { ...field, name: newName };
      }
      return field;
    });
  }

  if (answers.addFields && answers.additionalFields) {
    const additional = answers.additionalFields.split(',').map((f: string) => f.trim());
    additional.forEach(field => {
      const [name, type, required] = field.split(':');
      registrationFields.push({
        name,
        type,
        required: required === 'true',
      });
    });
  }

  return {
    registrationFields,
    loginIdentifiers: answers.loginIdentifiers,
    features: answers.features,
    packageManager: answers.packageManager,
    autoDetectLogin: answers.autoDetectLogin,
    authType: answers.authType,
    otpDelivery: answers.otpDelivery || 'email',
  };
}