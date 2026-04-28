export function formatWooPrice(value: number): string {
  const { currency_data } = window.yayWholesaleB2BAdmin;
  const { symbol, position, thousand_sep, decimal_sep, num_decimals } = currency_data;

  const [intPart, decPart] = value.toFixed(num_decimals).split('.');

  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep) + (decPart ? decimal_sep + decPart : '');

  const map: Record<string, string> = {
    left: `${symbol}${formatted}`,
    right: `${formatted}${symbol}`,
    left_space: `${symbol} ${formatted}`,
    right_space: `${formatted} ${symbol}`,
  };

  return map[position] || map.left;
}
