import { Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';


import { UserService, CommentService } from '@/src/business-logic';
import { IngredientService, RecipeIngredientService, RecipeService } from '@/src/business-logic';
import { AuthService } from '@/src/business-logic/auth';
import { JwtStrategy } from '@/src/business-logic/auth/jwt.strategy';
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
        PassportModule,
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
        UserService,
        RecipeIngredientService,
        RecipeService,
        IngredientService,
        CommentService,
        JwtStrategy,
        /**
         * @ai-context JWT guard підключений глобально: усі endpoints приватні за замовчуванням.
         * Для публічного endpoint потрібно явно додати `@Public()` у controller.
         */
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        /**
         * @ai-context DTO валідація працює глобально і відкидає зайві поля.
         * Якщо frontend надсилає нове поле, спершу додай його у відповідний DTO.
         */
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                whitelist: true,
                forbidUnknownValues: true,
                forbidNonWhitelisted: true,
            }),
        },
        AuthService,
    ],
})
export class AppModule {}
