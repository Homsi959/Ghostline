const scenes = {
  mainMenu: {
    message: 'Выберите действие:',
    buttons: [
      { text: '💰 Пополнить баланс', nextScene: 'balanceTopUp' },
      { text: '📜 Оплатить подписку', nextScene: 'subscriptionMenu' },
    ],
  },
  balanceTopUp: {
    message: 'Введите сумму пополнения:',
    input: true,
    nextScene: 'processingPayment',
  },
  subscriptionMenu: {
    message: 'Выберите срок подписки:',
    buttons: [
      { text: '1 месяц - 500₽', action: 'pay_1m' },
      { text: '6 месяцев - 2700₽', action: 'pay_6m' },
      { text: '1 год - 5000₽', action: 'pay_12m' },
    ],
  },
};
