import {
  TelegramButton,
  TelegramSession,
} from 'code/telegram/common/telegram.types';

export type BuildInlineKeyboardOptions = {
  arr: TelegramButton[];
  columns: number;
  payload: TelegramSession['payload'];
};
