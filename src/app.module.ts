import { Module } from '@nestjs/common';

import { DbModule } from '@/src/modules/db.module';


@Module({
    imports: [DbModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
