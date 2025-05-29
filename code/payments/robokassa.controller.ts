import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RobokassaService } from './robokassa.service';
import { RobokassaResultDto } from './dto';

@Controller('')
export class RobokassaController {
  constructor(private readonly robokassaService: RobokassaService) {}

  @Post('/robokassa/result')
  async handleResult(
    @Body() body: RobokassaResultDto,
    @Res() response: Response,
  ) {
    const { SignatureValue, InvId } = body;
    const verifyPayload = {
      signatureValue: SignatureValue,
      invId: InvId,
    };
    const transactionId =
      await this.robokassaService.verifyTransaction(verifyPayload);

    response.status(200).send(`OK${transactionId}`);
  }
}
