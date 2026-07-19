import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { createHash, randomUUID } from 'node:crypto';
import type { SignOptions } from 'jsonwebtoken';
import {
  DEFAULT_TIMEZONE,
  HeightUnit,
  UserDocument,
  UserRole,
} from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    if (dto.password !== dto.password_confirm) {
      throw new BadRequestException({
        message: 'Please correct the highlighted fields.',
        errors: { password_confirm: ['Passwords do not match.'] },
      });
    }
    if (await this.usersService.findByEmail(dto.email)) {
      throw new ConflictException({
        message: 'An account with this email already exists.',
        errors: { email: ['This email is already registered.'] },
      });
    }

    let user: UserDocument;
    try {
      user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        age: dto.age,
        weight: dto.weight,
        weightUnit: dto.weight_unit,
        height: this.heightToCentimeters(dto.height, dto.height_unit, dto.height_inches),
        heightUnit: dto.height_unit,
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        passwordHash: await hash(dto.password, 12),
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException({
          message: 'An account with this email already exists.',
          errors: { email: ['This email is already registered.'] },
        });
      }
      throw error;
    }
    return this.createSession(user);
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.findByEmail(dto.email, true);
    if (!user?.isActive || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    return this.createSession(user);
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refresh, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token.');

    const user = await this.usersService.findById(payload.sub, true);
    const currentHash = this.refreshTokenDigest(dto.refresh);
    if (!user?.isActive || !user.refreshTokenHash || user.refreshTokenHash !== currentHash) {
      throw new UnauthorizedException('Refresh token has been revoked.');
    }
    const tokens = await this.issueTokens(user);
    const rotated = await this.usersService.rotateRefreshTokenHash(
      user.id,
      currentHash,
      this.refreshTokenDigest(tokens.refresh),
    );
    if (!rotated) throw new UnauthorizedException('Refresh token has already been rotated.');
    return { user: this.userResponse(user), ...tokens };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshTokenHash(userId, null);
  }

  async profile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.isActive) throw new UnauthorizedException('User account is unavailable.');
    return this.userResponse(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(userId, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.age !== undefined ? { age: dto.age } : {}),
      ...(dto.weight !== undefined ? { weight: dto.weight } : {}),
      ...(dto.weight_unit !== undefined ? { weightUnit: dto.weight_unit } : {}),
      ...(dto.height !== undefined
        ? { height: this.heightToCentimeters(dto.height, dto.height_unit, dto.height_inches) }
        : {}),
      ...(dto.height_unit !== undefined ? { heightUnit: dto.height_unit } : {}),
      ...(dto.target_calories !== undefined ? { targetCalories: dto.target_calories } : {}),
      ...(dto.target_protein !== undefined ? { targetProtein: dto.target_protein } : {}),
      ...(dto.target_carbs !== undefined ? { targetCarbs: dto.target_carbs } : {}),
      ...(dto.target_fat !== undefined ? { targetFat: dto.target_fat } : {}),
      ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
    });
    if (!user?.isActive) throw new UnauthorizedException('User account is unavailable.');
    return this.userResponse(user);
  }

  private async createSession(user: UserDocument) {
    const tokens = await this.issueTokens(user);
    await this.usersService.updateRefreshTokenHash(
      user.id,
      this.refreshTokenDigest(tokens.refresh),
    );
    return { user: this.userResponse(user), ...tokens };
  }

  private async issueTokens(user: UserDocument) {
    const base = { sub: user.id, email: user.email };
    const [access, refresh] = await Promise.all([
      this.jwtService.signAsync(
        { ...base, type: 'access', jti: randomUUID() } satisfies JwtPayload,
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as SignOptions['expiresIn'],
        },
      ),
      this.jwtService.signAsync(
        { ...base, type: 'refresh', jti: randomUUID() } satisfies JwtPayload,
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as SignOptions['expiresIn'],
        },
      ),
    ]);
    return { access, refresh };
  }

  private refreshTokenDigest(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private userResponse(user: UserDocument) {
    const heightUnit = user.heightUnit || HeightUnit.CM;
    const heightCm = this.storedHeightCentimeters(user.height, heightUnit);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || UserRole.USER,
      age: user.age,
      weight: user.weight,
      weight_unit: user.weightUnit,
      height: this.heightForDisplay(heightCm, heightUnit),
      height_unit: heightUnit,
      timezone: user.timezone || DEFAULT_TIMEZONE,
      daily_goals: {
        target_calories: user.targetCalories,
        target_protein: user.targetProtein,
        target_carbs: user.targetCarbs,
        target_fat: user.targetFat,
      },
    };
  }

  private heightToCentimeters(
    height: number,
    heightUnit: HeightUnit | undefined,
    heightInches?: number,
  ) {
    if (heightUnit === HeightUnit.FT) {
      if (heightInches === undefined) {
        return this.legacyFeetToCentimeters(height);
      }
      return this.round((height * 12 + heightInches) * 2.54);
    }
    return this.round(height);
  }

  private storedHeightCentimeters(height: number, heightUnit: HeightUnit) {
    if (heightUnit === HeightUnit.FT && height <= 10) {
      return this.legacyFeetToCentimeters(height);
    }
    return height;
  }

  private legacyFeetToCentimeters(height: number) {
    const feet = Math.trunc(height);
    const inchesText = height.toString().split('.')[1];
    const inches = inchesText ? Number(inchesText) : 0;

    if (Number.isFinite(inches) && inches >= 0 && inches < 12) {
      return this.round((feet * 12 + inches) * 2.54);
    }

    return this.round(height * 30.48);
  }

  private heightForDisplay(heightCm: number, heightUnit: HeightUnit) {
    if (heightUnit === HeightUnit.FT) {
      return this.round(heightCm / 30.48);
    }
    return this.round(heightCm);
  }

  private round(value: number) {
    return Number(value.toFixed(2));
  }
}
