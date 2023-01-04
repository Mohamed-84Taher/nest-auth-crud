import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { GetCurrentUserId, Public } from 'src/common/decorators';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserCreateDto } from './dto/userCreateDto.dto';
import { UserUpdateDto } from './dto/userUpdateDto.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Public()
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'email', required: false })
  @Get()
  getAllUsers(
    @Query('username') username?: string,
    @Query('email') email?: string,
  ): Promise<User[]> {
    return this.usersService.getAllUsers(username, email);
  }

  @Public()
  @Post('signup')
  createUser(@Body() body: UserCreateDto): Promise<User> {
    return this.usersService.createUser(body);
  }

  @ApiBearerAuth()
  @Roles('Admin')
  @UseGuards(RolesGuard)
  @Patch(':id')
  updateUser(
    @Param('id') id: number,
    @Body() body: UserUpdateDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, body);
  }

  @ApiBearerAuth()
  @Delete(':id')
  deleteUser(@Param('id') id: number): Promise<User> {
    return this.usersService.deleteUser(id);
  }

  @ApiBearerAuth()
  @Get('current')
  getCurrentUser(@GetCurrentUserId() id: number) {
    return this.usersService.getCurrentUser(id);
  }
}
