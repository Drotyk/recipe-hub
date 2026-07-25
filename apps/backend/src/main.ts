import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

import { AppModule } from './app.module';


async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: process.env['FRONTEND_URL'],
        credentials: true,
    });

    app.use(cookieParser());

    const configSwagger = new DocumentBuilder()
        .setTitle('Algoritm-lab')
        .setVersion('0.1.0')
        .addBearerAuth()
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

    const port = Number(process.env['PORT'] ?? 3000);

    await app.listen(port);
    logger.log(`Програма запущена на http://localhost:${port}`);
    logger.log(`Документація (Swagger) на http://localhost:${port}/api-docs`);
}
bootstrap().then();
