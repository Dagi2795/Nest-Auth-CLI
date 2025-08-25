import { Config } from '../../types';

export default function generateAppModule(config: Config): string {
  return `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { OtpModule } from './otp/otp.module';
import { HistoryModule } from './history/history.module';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { Otp } from './otp/otp.entity';
import { UserHistory } from './history/user-history.entity';
import { Permission } from './permissions/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '', // TODO: Update with your MySQL password
      database: 'tibeb_auth_db',
      entities: [User, Role, Otp, UserHistory, Permission],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'dagi21yemaryam16@gmail.com',
          pass: 'xcnb vblm wvyj vgwa',
        },
      },
      defaults: {
        from: '"OTP Bot" <dagi21yemaryam16@gmail.com>',
      },
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    OtpModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;
}