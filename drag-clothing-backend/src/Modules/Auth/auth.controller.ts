import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { RefreshGuard } from './guards/refresh.guard';
import { LoginDto } from './Dto/login.dto';
import { ChangePasswordDto } from './Dto/change-password.dto';
import { RegisterDto } from './Dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RefreshGuard)
  @Post('refresh-token')
  refresh(@Req() req: any) {
    return this.authService.refresh(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  logout(@Req() req: any) {
    return this.authService.logout(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('change-password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user, dto);
  }

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.authService.SendOtp(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    return this.authService.VerifyOtp(email, otp);
  }

  @Post('resend-otp')
  async resendOtp(@Body('email') email: string) {
    return this.authService.ResendOtp(email);
  }
}
