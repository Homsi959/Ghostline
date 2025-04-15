import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RobokassaService } from './robokassa.service';
import { TransformShpParamsPipe } from './pipes/transform-shp-params.pipe';
import { RobokassaResultDto } from './dto';

@Controller('')
export class RobokassaController {
  constructor(private readonly robokassaService: RobokassaService) {}

  @Post('/api/robokassa/result')
  async handleResult(
    @Body(new TransformShpParamsPipe()) body: RobokassaResultDto,
    @Res() response: Response,
  ) {
    const { transactionId } = body;
    const exists =
      await this.robokassaService.findTransactionIdIfExists(transactionId);

    response.status(200).send(`OK${exists}`);
  }
}
