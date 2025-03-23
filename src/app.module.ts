import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { TuskerModule } from './tusker/tusker.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AdminModule, TuskerModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
