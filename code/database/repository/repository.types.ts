import { User } from 'telegraf/types';

export type TUser = User & {
  user_id: number;
};
