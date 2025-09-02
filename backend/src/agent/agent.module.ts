import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AgentController],
  providers: [AgentService, PrismaService, JwtStrategy],
  exports: [AgentService],
})
export class AgentModule {}