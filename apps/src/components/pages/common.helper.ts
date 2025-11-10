import dayjs from 'dayjs';

export function parseWPDate(date: string) {
  var format = '';

  var arr = window.yayWholesale.day_format.split('');
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

  return dayjs(date).format(format);
}

export function parseWPTime(date: string) {
  var format = '';

  var arr = window.yayWholesale.time_format.split('');
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
