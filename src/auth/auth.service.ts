import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from 'src/admin/admin.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private adminService: AdminService, private jwtService:JwtService){}

    async validateAdmin(username: string , password: string){
        const admin = await this.adminService.findOne(username);
        if(admin && (await bcrypt.compare(password, admin.password))){
            return { username: admin.username};
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
