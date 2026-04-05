// src/utils/currency.js
export const CURRENCY = {
  symbol: '৳',
  code: 'BDT',
  name: 'Bangladeshi Taka'
};

export const formatPrice = (price) => {
  return `৳ ${Number(price).toLocaleString('en-BD')}`;
};