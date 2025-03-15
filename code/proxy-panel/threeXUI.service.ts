import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ThreeXUIService {
  constructor(private readonly httpService: HttpService) {}

  async createUser(): Promise<any> {
    try {
      // const response = await lastValueFrom(this.httpService.get('/posts'));
    } catch (error: any) {}
  }
}
