import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './admin.schema';
import { Model } from 'mongoose';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(@InjectModel(Admin.name) private adminModel: Model<Admin>){}

    async create(CreateAdminDto: CreateAdminDto): Promise<Admin> {
        const hashedPassword = await bcrypt.hash(CreateAdminDto.password, 10);
        const newAdmin = new this.adminModel({
            username: CreateAdminDto.username,
            password: hashedPassword,
        });

        return newAdmin.save();
    }

    async findOne(username: string): Promise<Admin | undefined>{
        return this.adminModel.findOne({username});
    }


}
