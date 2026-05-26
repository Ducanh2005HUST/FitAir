import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { userId: string }) {
    return this.users.getMe(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateMe(@CurrentUser() user: { userId: string }, @Body() dto: UpdateMeDto) {
    return this.users.updateMe(user.userId, dto);
  }

  @Get(':id')
  publicProfile(@Param('id') id: string) {
    return this.users.getPublicProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/detail')
  detail(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.users.getProfileDetail(user.userId, id);
  }
}
