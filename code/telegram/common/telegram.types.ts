export type TTelegramButton = {
  text: string;
  action: string;
};

type TTelegramButtonConfig = {
  buttons: TTelegramButton[];
  columns?: number;
};

type TTelegramPage = {
  message: string;
  // TODO добавить возомжность picture
  keyboardConfig?: TTelegramButtonConfig;
  goBackButton?: boolean;
};

export type TTelegramPages = {
  [key: string]: TTelegramPage;
};
