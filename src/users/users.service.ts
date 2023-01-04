import { BadRequestException, Injectable, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { UserCreateDto } from './dto/userCreateDto.dto';
import { UserUpdateDto } from './dto/userUpdateDto.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  // get all users or filtered users by email and username
  getAllUsers(username?: string, email?: string): Promise<User[]> {
    if (username || email) {
      return this.userRepository.find({
        where: [
          {
            username: Raw((alias) => `LOWER(${alias}) Like '%${username}%'`),
          },
          {
            email: Raw((alias) => `LOWER(${alias}) Like '%${email}%'`),
          },
        ],
      });
    }
    return this.userRepository.find();
  }
  // Create user (Sign up)
  async createUser(createUserDto: UserCreateDto): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (foundUser) throw new BadRequestException('User is already exists');

    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    createUserDto.password = hash;
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }
  async updateUser(id: number, updateUserDto: UserUpdateDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    return this.userRepository.save({ ...user, ...updateUserDto });
  }
  async deleteUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    return this.userRepository.remove(user);
  }
  async getCurrentUser(id: number) {
    return this.userRepository.findBy({ id: id });
  }
}
