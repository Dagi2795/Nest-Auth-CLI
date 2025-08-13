import generateAuthModule from './auth/authModule';
import generateAuthController from './auth/authController';
import generateAuthService from './auth/authService';
import generateJwtAuthGuard from './auth/jwtAuthGuard';
import generateRolesGuard from './auth/rolesGuard';
import generateJwtStrategy from './auth/jwtStrategy';
import generateRolesDecorator from './auth/rolesDecorator';
import generateRegisterDto from './dtos/registerDto';
import generateLoginDto from './dtos/loginDto';
import generateForgotPasswordDto from './dtos/forgotPasswordDto';
import generateResetPasswordDto from './dtos/resetPasswordDto';
import generateVerifyOtpDto from './dtos/verifyOtpDto';
import generateUsersModule from './users/usersModule';
import generateUsersController from './users/usersController';
import generateUsersService from './users/usersService';
import generateUserEntity from './users/userEntity';
import generateCreateUserDto from './dtos/createUserDto';
import generateUpdateUserDto from './dtos/updateUserDto';
import generateRolesModule from './roles/rolesModule';
import generateRolesController from './roles/rolesController';
import generateRolesService from './roles/rolesService';
import generateRoleEntity from './roles/roleEntity';
import generatePermissionsModule from './permissions/permissionsModule';
import generatePermissionsController from './permissions/permissionsController';
import generatePermissionsService from './permissions/permissionsService';
import generatePermissionEntity from './permissions/permissionEntity';
import generateOtpModule from './otp/otpModule';
import generateOtpController from './otp/otpController';
import generateOtpService from './otp/otpService';
import generateOtpEntity from './otp/otpEntity';
import generateHistoryModule from './history/historyModule';
import generateHistoryController from './history/historyController';
import generateHistoryService from './history/historyService';
import generateUserHistoryEntity from './history/userHistoryEntity';
import generateAppModule from './core/appModule';
import generatePackageJson from './core/packageJson';
import generateTsconfigJson from './core/tsconfigJson';

export {
  generateAuthModule,
  generateAuthController,
  generateAuthService,
  generateJwtAuthGuard,
  generateRolesGuard,
  generateJwtStrategy,
  generateRolesDecorator,
  generateRegisterDto,
  generateLoginDto,
  generateForgotPasswordDto,
  generateResetPasswordDto,
  generateVerifyOtpDto,
  generateUsersModule,
  generateUsersController,
  generateUsersService,
  generateUserEntity,
  generateCreateUserDto,
  generateUpdateUserDto,
  generateRolesModule,
  generateRolesController,
  generateRolesService,
  generateRoleEntity,
  generatePermissionsModule,
  generatePermissionsController,
  generatePermissionsService,
  generatePermissionEntity,
  generateOtpModule,
  generateOtpController,
  generateOtpService,
  generateOtpEntity,
  generateHistoryModule,
  generateHistoryController,
  generateHistoryService,
  generateUserHistoryEntity,
  generateAppModule,
  generatePackageJson,
  generateTsconfigJson,
};