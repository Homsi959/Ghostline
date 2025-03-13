type TTelegramButton = {
  text: string;
  action: string;
};

type TTelegramPage = {
  message: string;
  // TODO добавить возомжность picture
  buttons?: TTelegramButton[];
};

export type TTelegramPages = {
  [key: string]: TTelegramPage;
};
