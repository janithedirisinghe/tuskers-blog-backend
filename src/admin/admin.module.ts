import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './admin.schema';// Assuming AdminModel is defined in admin.model.ts

@Module({
  imports: [ 
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService, MongooseModule], // Export AdminService and MongooseModule
})
export class AdminModule {}
