import { Module } from '@nestjs/common';

import { UserService } from '@/src/business-logic';
import { IngredientService, RecipeIngredientService, RecipeService } from '@/src/business-logic';
import { RecipeController, UserController, IngredientController, RecipeIngredientController } from '@/src/controllers';
import { DbModule } from '@/src/modules/db.module';


@Module({
    imports: [DbModule],
    controllers: [UserController, RecipeController, IngredientController, RecipeIngredientController],
    providers: [UserService, RecipeIngredientService, RecipeService, IngredientService ],
})
export class AppModule {}
