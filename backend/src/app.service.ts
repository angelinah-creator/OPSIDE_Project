import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Récupère hello
  getHello(): string {
    return 'Hello World!';
  }
}
