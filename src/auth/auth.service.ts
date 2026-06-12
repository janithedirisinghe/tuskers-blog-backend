import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from 'src/admin/admin.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(private adminService: AdminService, private jwtService:JwtService){}

    async validateAdmin(username: string , password: string): Promise<JwtPayload>{
        const admin = await this.adminService.findOne(username);
        if(admin && (await bcrypt.compare(password, admin.password))){
            return {
                sub: String(admin._id),
                username: admin.username,
                role: 'admin',
            };
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async login(username: string, password: string){
        const validAdmin = await this.validateAdmin(username,password);

        return {
            access_token: this.jwtService.sign(validAdmin)
        }
    };
    
}
