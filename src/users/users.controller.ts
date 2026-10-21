import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post() create(@Body() dto: CreateUserDto) { return this.usersService.create(dto); }
  @Get() findAll() { return this.usersService.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.usersService.findOne(id); }
  @Patch(':id/deactivate') deactivate(@Param('id', ParseIntPipe) id: number) { return this.usersService.setActive(id, false); }
  @Patch(':id/activate') activate(@Param('id', ParseIntPipe) id: number) { return this.usersService.setActive(id, true); }
}
