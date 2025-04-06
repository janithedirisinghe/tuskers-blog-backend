import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from 'src/admin/admin.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AdminService } from 'src/admin/admin.service';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
    providers: [AdminService, AuthService, JwtStrategy],
    imports: [
        AdminModule, // Ensure AdminModule is imported
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule, // Import ConfigModule here
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '60m' },
            }),
            inject: [ConfigService],
        }),
    ], 
    controllers: [AuthController],
    exports: [PassportModule, JwtModule],
})
export class AuthModule {}
