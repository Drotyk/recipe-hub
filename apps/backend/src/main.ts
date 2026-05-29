import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

import { AppModule } from './app.module';


async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule);
    app.enableCors();

    app.enableCors();

    const configSwagger = new DocumentBuilder()
        .setTitle('Algoritm-lab')
        .setVersion('0.1.0')
        .build();

    const document = SwaggerModule.createDocument(app, configSwagger);

    const theme = new SwaggerTheme();

    SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            displayRequestDuration: true,
        },
        customCss: theme.getBuffer(SwaggerThemeNameEnum.FLATTOP),
    });

    await app.listen(3000);
    logger.log('Програма запущена на http://localhost:3000');
    logger.log('Документація (Swagger) на http://localhost:3000/api-docs');
}
bootstrap().then();
