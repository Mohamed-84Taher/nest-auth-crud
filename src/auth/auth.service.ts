import { ForbiddenException, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { LoginDto } from './dto/loginDto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async signIn(body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.userRepository.findOne({
      where: {
        email: body.email,
      },
    });

    if (!user) throw new ForbiddenException('Bad Request!');

    const isMatch = await bcrypt.compare(body.password, user.password);

    if (!isMatch) throw new ForbiddenException('Bad Request!');

    const payload = { email: user.email, sub: user.id };

    const access_token = this.jwtService.sign(payload, {
      secret: 'at-secret',
      expiresIn: 60 * 60,
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: 'rt-secret',
      expiresIn: 60 * 60 * 24 * 7,
    });

    user.hashRefresh = await bcrypt.hash(refresh_token, 5);
    await this.userRepository.save(user);
    /* response.cookie('access_token', access_token); */
    return {
      access_token,
      refresh_token,
    };
  }

  async logout(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    user.hashRefresh = null;
    await this.userRepository.save(user);

    return 'logout';
  }
  async refresh(id: number, hash: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        hashRefresh: Not(IsNull()),
      },
    });
    if (!user) throw new ForbiddenException('Unauthorized');

    const isMatch = await bcrypt.compare(hash, user.hashRefresh);

    if (!isMatch) throw new ForbiddenException('Unauthorized');

    const payload = { email: user.email, sub: user.id };

    const access_token = this.jwtService.sign(payload, {
      secret: 'at-secret',
      expiresIn: 60 * 60,
    });
    const refresh_token = this.jwtService.sign(payload, {
      secret: 'rt-secret',
      expiresIn: 60 * 60 * 24 * 7,
    });

    user.hashRefresh = await bcrypt.hash(refresh_token, 5);
    await this.userRepository.save(user);
    return {
      access_token,
      refresh_token,
    };
  }
}
