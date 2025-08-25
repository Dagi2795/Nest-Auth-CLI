import chalk from 'chalk';
import boxen from 'boxen';
import { Config } from '../types';

export function displayRoutes(config: Config) {
  const userRoutes = [];
  const adminRoutes = [];

  if (config.authType === 'user' || config.authType === 'both') {
    userRoutes.push(
      '/user/signup',
      '/user/verify-signup',
      '/user/login',
      '/user/verify-2fa-login',
      '/user/logout',
      '/user/forgot-password',
      '/user/reset-password',
      '/user/2fa',
      '/user/2fa/verify',
      '/user/2fa/resend',
      '/user/history',
      '/otp/request',
      '/otp/verify',
      '/otp/resend'
    );
  }

  if (config.authType === 'admin' || config.authType === 'both') {
    adminRoutes.push(
      '/admin/signup',
      '/admin/verify-signup',
      '/admin/login',
      '/admin/logout',
      '/admin/users',
      '/admin/add-user',
      '/admin/disable-user',
      '/admin/history',
      '/admin/audit-logs',
      '/admin/:id/history',
      '/admin/:id/reset-password',
      '/admin/:id/delete-user'
    );
  }

  console.log(boxen(
    chalk.cyan('📁 User Routes\n') +
    (userRoutes.length ? userRoutes.map(route => ` ${route}`).join('\n') : ' None'),
    { padding: 1, margin: 1, borderStyle: 'classic', borderColor: 'cyan', title: '👤 User Routes' }
  ));

  console.log(boxen(
    chalk.cyan('📁 Admin Routes\n') +
    (adminRoutes.length ? adminRoutes.map(route => ` ${route}`).join('\n') : ' None'),
    { padding: 1, margin: 1, borderStyle: 'classic', borderColor: 'cyan', title: '📁 Admin Routes' }
  ));
}