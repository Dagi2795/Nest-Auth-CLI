import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import { Config } from '../types';
import * as generators from '../templates/generators';

export async function generateFiles(config: Config) {
  const srcDir = path.join(process.cwd(), 'src');
  const directories = ['auth', 'auth/dto', 'users', 'users/dto', 'roles', 'permissions', 'otp', 'history'];
  const spinner = ora('Creating directories...').start();
  directories.forEach(dir => {
    fs.mkdirSync(path.join(srcDir, dir), { recursive: true });
    spinner.succeed(chalk.green(`📁 src/${dir}`));
  });

  const files = [
    { path: 'auth/auth.module.ts', content: generators.generateAuthModule(config) },
    { path: 'auth/auth.controller.ts', content: generators.generateAuthController(config) },
    { path: 'auth/auth.service.ts', content: generators.generateAuthService(config) },
    { path: 'auth/jwt-auth.guard.ts', content: generators.generateJwtAuthGuard() },
    { path: 'auth/roles.guard.ts', content: generators.generateRolesGuard() },
    { path: 'auth/jwt.strategy.ts', content: generators.generateJwtStrategy() },
    { path: 'auth/roles.decorator.ts', content: generators.generateRolesDecorator() },
    { path: 'auth/dto/register.dto.ts', content: generators.generateRegisterDto(config) },
    { path: 'auth/dto/login.dto.ts', content: generators.generateLoginDto(config) },
    ...(config.features.includes('forgot-password') ? [{ path: 'auth/dto/forgot-password.dto.ts', content: generators.generateForgotPasswordDto() }] : []),
    ...(config.features.includes('reset-password') ? [{ path: 'auth/dto/reset-password.dto.ts', content: generators.generateResetPasswordDto() }] : []),
    ...(config.features.includes('otp-email') || config.features.includes('two-step-verification') ? [{ path: 'auth/dto/verify-otp.dto.ts', content: generators.generateVerifyOtpDto() }] : []),
    { path: 'users/users.module.ts', content: generators.generateUsersModule(config) },
    { path: 'users/users.controller.ts', content: generators.generateUsersController(config) },
    { path: 'users/users.service.ts', content: generators.generateUsersService(config) },
    { path: 'users/user.entity.ts', content: generators.generateUserEntity(config) },
    { path: 'users/dto/create-user.dto.ts', content: generators.generateCreateUserDto(config) },
    { path: 'users/dto/update-user.dto.ts', content: generators.generateUpdateUserDto(config) },
    { path: 'roles/roles.module.ts', content: generators.generateRolesModule(config) },
    { path: 'roles/roles.controller.ts', content: generators.generateRolesController(config) },
    { path: 'roles/roles.service.ts', content: generators.generateRolesService() },
    { path: 'roles/role.entity.ts', content: generators.generateRoleEntity() },
    { path: 'permissions/permissions.module.ts', content: generators.generatePermissionsModule(config) },
    { path: 'permissions/permissions.controller.ts', content: generators.generatePermissionsController(config) },
    { path: 'permissions/permissions.service.ts', content: generators.generatePermissionsService() },
    { path: 'permissions/permission.entity.ts', content: generators.generatePermissionEntity() },
    { path: 'otp/otp.module.ts', content: generators.generateOtpModule(config) },
    { path: 'otp/otp.controller.ts', content: generators.generateOtpController(config) },
    { path: 'otp/otp.service.ts', content: generators.generateOtpService(config) },
    { path: 'otp/otp.entity.ts', content: generators.generateOtpEntity() },
    { path: 'history/history.module.ts', content: generators.generateHistoryModule(config) },
    { path: 'history/history.controller.ts', content: generators.generateHistoryController(config) },
    { path: 'history/history.service.ts', content: generators.generateHistoryService() },
    { path: 'history/user-history.entity.ts', content: generators.generateUserHistoryEntity() },
    { path: 'app.module.ts', content: generators.generateAppModule(config) },
  ];

  for (const file of files) {
    const spinner = ora(`Creating src/${file.path}...`).start();
    fs.writeFileSync(path.join(srcDir, file.path), file.content);
    spinner.succeed(chalk.green(`📄 src/${file.path}`));
  }

  const packageJsonSpinner = ora('Updating package.json...').start();
  fs.writeFileSync(path.join(process.cwd(), 'package.json'), generators.generatePackageJson());
  packageJsonSpinner.succeed(chalk.green('📄 package.json'));

  const tsconfigSpinner = ora('Creating tsconfig.json...').start();
  fs.writeFileSync(path.join(process.cwd(), 'tsconfig.json'), generators.generateTsconfigJson());
  tsconfigSpinner.succeed(chalk.green('📄 tsconfig.json'));

  const installSpinner = ora(`Installing dependencies with ${config.packageManager}...`).start();
  try {
    let installCmd: string[] = [];
    if (config.packageManager === 'npm') {
      installCmd = ['npm', 'install', '--legacy-peer-deps'];
    } else if (config.packageManager === 'yarn') {
      installCmd = ['yarn', 'install'];
    } else if (config.packageManager === 'pnpm') {
      installCmd = ['pnpm', 'install'];
    }
    execSync(installCmd.join(' '), { stdio: 'inherit', cwd: process.cwd() });
    installSpinner.succeed(chalk.green('✔ Dependencies installed'));
  } catch (error: any) {
    installSpinner.fail(chalk.red('Failed to install dependencies'));
    console.error(error.message || error);
    process.exit(1);
  }

  console.log(boxen(
    chalk.green('✅ Tibeb Nest Auth completed!\n\n') +
    '🔐 Authentication system ready.\n' +
    '📁 Check src/ for modules.\n' +
    '🚀 Run `npm run start:dev` to start!',
    { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'green' }
  ));
}