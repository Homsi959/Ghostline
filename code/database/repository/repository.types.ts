import { User } from 'telegraf/types';

/**
 * Тип, расширяющий стандартный тип User, добавляя поле user_id.
 */
export type TUser = User & {
  user_id: number;
};
