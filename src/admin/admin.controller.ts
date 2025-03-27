import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adinService: AdminService) {}

    @Post('register')
    async create(@Body() CreateAdminDto: CreateAdminDto) {
        return this.adinService.create(CreateAdminDto);
    }

}
