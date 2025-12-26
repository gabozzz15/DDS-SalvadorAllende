import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Verificar si el usuario ya existe
        const existingUser = await this.usersRepository.findOne({
            where: { username: createUserDto.username },
        });

        if (existingUser) {
            throw new ConflictException('El nombre de usuario ya existe');
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return this.usersRepository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            select: ['id', 'username', 'nombreCompleto', 'email', 'role', 'activo', 'createdAt'],
        });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
            select: ['id', 'username', 'nombreCompleto', 'email', 'role', 'activo', 'createdAt'],
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return user;
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }

    async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
