import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: [process.env.CLIENTURL],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    });
    
    const port = process.env.PORT || 3000;
    console.log(`Starting application on port ${port}`);
    
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap(); 
 