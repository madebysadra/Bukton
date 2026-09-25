export function toPersianDigits(value: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(value).replace(/[0-9]/g, (w) => persianDigits[+w]);
}

export function formatTomanPrice(price: number): string {
  const formatted = price.toLocaleString('en-US');
  return `${toPersianDigits(formatted)} تومان`;
}

export function formatMinutes(mins: number): string {
  return `${toPersianDigits(mins)} دقیقه`;
}
