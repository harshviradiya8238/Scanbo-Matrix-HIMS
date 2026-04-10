export function maskMobileNumber(
  phone: string | null | undefined,
  fallback = "—",
): string {
  const input = (phone ?? "").trim();
  if (!input) return fallback;

  const allDigits = input.match(/\d/g) || [];
  const totalDigits = allDigits.length;
  if (totalDigits <= 4) return input;

  const countryMatch = input.match(/^\+(\d{1,3})/);
  const keepPrefixDigits = countryMatch ? countryMatch[1].length : 0;
  const localVisibleStart = totalDigits - 4 + 1;

  let seen = 0;
  return input.replace(/\d/g, (digit) => {
    seen += 1;
    if (seen <= keepPrefixDigits) return digit;
    return seen >= localVisibleStart ? digit : "X";
  });
}
