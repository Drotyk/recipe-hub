import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

import { UserService } from '@/src/business-logic';
import { IngredientService, RecipeIngredientService, RecipeService } from '@/src/business-logic';
import { RecipeController, UserController, IngredientController, RecipeIngredientController } from '@/src/controllers';
import { DbModule } from '@/src/modules/db.module';


@Module({
    imports: [DbModule],
    controllers: [UserController, RecipeController, IngredientController, RecipeIngredientController],
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
    ],
})
export class AppModule {}
