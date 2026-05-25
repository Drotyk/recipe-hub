import { resolve } from 'path';

import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { configDotenv } from 'dotenv';


import { UserService } from '@/src/business-logic';
import { IngredientService, RecipeIngredientService, RecipeService } from '@/src/business-logic';
import { AuthService } from '@/src/business-logic/auth';
import {
    RecipeController,
    UserController,
    IngredientController,
    RecipeIngredientController,
    AuthController,
} from '@/src/controllers';
import { DbModule } from '@/src/modules/db.module';


configDotenv({ path: resolve(process.cwd(), '.env') });

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
    ],
    providers: [
        UserService,
        RecipeIngredientService,
        RecipeService,
        IngredientService,
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
