export interface RobokassaResultDto {
  OutSum: string;
  InvId: string;
  SignatureValue: string;
  transactionId: string;
  // TODO правильно типизируй план
  plan?: string;
  userId?: string;
}
