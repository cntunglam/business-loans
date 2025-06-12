export const formatToDisplayString = (value?: string | number, significantDigits = 6) => {
  if (value === undefined) return '';
  const nbr = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(nbr)) return '';
  return nbr.toLocaleString('vi-VN', {
    maximumFractionDigits: significantDigits
  });
};
