import { PartialType } from '@nestjs/mapped-types';
import { UserCreateDto } from './userCreateDto.dto';

export class UserUpdateDto extends PartialType(UserCreateDto) {}
