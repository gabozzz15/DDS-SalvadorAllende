import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findByUsername(loginDto.username);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        if (!user.activo) {
            throw new UnauthorizedException('Usuario inactivo');
        }

        const isPasswordValid = await this.usersService.validatePassword(
            loginDto.password,
            user.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                nombreCompleto: user.nombreCompleto,
                email: user.email,
                role: user.role,
            },
        };
    }

    async validateUser(userId: number) {
        return this.usersService.findOne(userId);
    }
}
