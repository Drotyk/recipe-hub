import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';


import { UserService, CommentService } from '@/src/business-logic';
import { IngredientService, RecipeIngredientService, RecipeService } from '@/src/business-logic';
import { AuthService, JwtStrategy } from '@/src/business-logic/auth';
import { JwtAuthGuard } from '@/src/common/guards';
import { loadEnv } from '@/src/common/utils';
import {
    RecipeController,
    UserController,
    IngredientController,
    RecipeIngredientController,
    AuthController,
    CommentController,
} from '@/src/controllers';
import { DbModule } from '@/src/modules/db.module';


loadEnv();

@Module({
    imports: [
        DbModule,
        JwtModule.register({
            secret: process.env['JWT_SECRET_KEY'],
        }),
    ],
    controllers: [
        UserController,
        RecipeController,
        IngredientController,
        RecipeIngredientController,
        AuthController,
        CommentController,
    ],
    providers: [
        JwtStrategy,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        UserService,
        RecipeIngredientService,
        RecipeService,
        IngredientService,
        CommentService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                forbidUnknownValues: true,
                forbidNonWhitelisted: true,
            }),
        },
        AuthService,
    ],
})
export class AppModule {}
