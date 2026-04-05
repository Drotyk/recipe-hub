import { Module } from '@nestjs/common';

import { DbModule } from './Modules/db.module';


@Module({
    imports: [DbModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
