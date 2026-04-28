import dayjs from 'dayjs';

export function parseWPDate(date: string | undefined) {
  var format = '';

  var arr = window.yayWholesaleB2BAdmin.day_format.split('');
  arr.forEach((ch) => {
    switch (ch) {
      case 'd':
        format += 'DD';
        break;
      case 'j':
        format += 'D';
        break;
      case 's':
        format += '';
        break;
      case 'l':
        format += 'dddd';
        break;
      case 'D':
        format += 'ddd';
        break;
      case 'm':
        format += 'MM';
        break;
      case 'n':
        format += 'M';
        break;
      case 'F':
        format += 'MMMM';
        break;
      case 'M':
        format += 'MMM';
        break;
      case 'Y':
        format += 'YYYY';
        break;
      case 'y':
        format += 'YY';
        break;
      default:
        format += ch;
    }
  });

  return dayjs(date ?? null).format(format);
}

export function parseWPTime(date: string) {
  var format = '';

  var arr = window.yayWholesaleB2BAdmin.time_format.split('');
  arr.forEach((ch) => {
    switch (ch) {
      case 'g':
        format += 'h';
        break;
      case 'h':
        format += 'hh';
        break;
      case 'G':
        format += 'H';
        break;
      case 'H':
        format += 'HH';
        break;
      case 'i':
        format += 'mm';
        break;
      case 's':
        format += 'ss';
        break;
      case 'T':
        format += '';
        break;
      default:
        format += ch;
    }
  });

  return dayjs(date).format(format);
}

export function parseWPTimeForInput(date: string) {
  return dayjs(date).format('HH:mm:ss');
}

export function parseWPCurrency(price: string | number) {
  if (typeof price === 'string') {
    price = parseFloat(price);
  }

  const { symbol, position, thousand_sep, decimal_sep, num_decimals } = window.yayWholesaleB2BAdmin.currency_data;

  const formattedPrice = price
    .toFixed(num_decimals)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep)
    .replace(/(\d+)\.(\d{2})$/, `$1${decimal_sep}$2`);

  switch (position) {
    case 'left':
      return `${symbol}${formattedPrice}`;
    case 'right':
      return `${formattedPrice}${symbol}`;
    case 'left_space':
      return `${symbol} ${formattedPrice}`;
    case 'right_space':
      return `${formattedPrice} ${symbol}`;
    default:
      return `${formattedPrice}`;
  }
}

export function parseWPDecimal(number: number) {
  const formattedNumber = number
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, window.yayWholesaleB2BAdmin.currency_data.thousand_sep)
    .replace(/(\d+)\.(\d{2})$/, `$1${window.yayWholesaleB2BAdmin.currency_data.decimal_sep}$2`);

  return formattedNumber;
}
