import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { SpotsModule } from '../spots/spots.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { SchedulesModule } from '../schedules/schedules.module';
import { CommunityModule } from '../community/community.module';
import { IndoorModule } from '../indoor/indoor.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EnvironmentModule } from '../environment/environment.module';
import { HealthModule } from '../health/health.module';
import { GooglePlacesModule } from '../google-places/google-places.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SpotsModule,
    ReviewsModule,
    SchedulesModule,
    CommunityModule,
    IndoorModule,
    NotificationsModule,
    EnvironmentModule,
    HealthModule,
    GooglePlacesModule,
  ],
})
export class AppModule {}
