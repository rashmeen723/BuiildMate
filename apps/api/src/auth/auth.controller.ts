import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registrationData: any) {
        return this.authService.register(registrationData);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginData: any) {
        return this.authService.login(loginData);
    }

    @Post('send-otp')
    @HttpCode(HttpStatus.OK)
    async sendOtp(@Body('email') email: string) {
        return this.authService.sendOtp(email);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Body() verifyData: { email: string; code: string }) {
        return this.authService.verifyOtp(verifyData.email, verifyData.code);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() body: { email: string; code: string; newPassword?: string }) {
        return this.authService.resetPassword(body.email, body.code, body.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('profile')
    async updateProfile(@Request() req, @Body() updateData: any) {
        return this.authService.updateProfile(req.user.id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @Post('profile/image')
    @UseInterceptors(FileInterceptor('image'))
    async uploadProfileImage(@Request() req, @UploadedFile() file: Express.Multer.File) {
        return this.authService.setProfileImage(req.user.id, file);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    async changePassword(@Request() req, @Body() body: { currentPassword?: string; newPassword?: string }) {
        return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
    }

    @Post('upload-public')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPublicFile(@UploadedFile() file: Express.Multer.File) {
        return this.authService.uploadFilePublic(file);
    }
}

