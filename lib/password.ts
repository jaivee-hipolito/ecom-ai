/**
 * Password policy: minimum 12 characters, with at least 2 letters, 2 numbers, and 2 special characters.
 */

const MIN_LENGTH = 12;
const MIN_LETTERS = 2;
const MIN_NUMBERS = 2;
const MIN_SPECIAL = 2;

function countLetters(s: string): number {
  return (s.match(/[a-zA-Z]/g) || []).length;
}
function countNumbers(s: string): number {
  return (s.match(/\d/g) || []).length;
}
function countSpecial(s: string): number {
  return (s.match(/[^a-zA-Z0-9]/g) || []).length;
}

export function isValidPassword(password: string): boolean {
  if (!password || password.length < MIN_LENGTH) return false;
  return (
    countLetters(password) >= MIN_LETTERS &&
    countNumbers(password) >= MIN_NUMBERS &&
    countSpecial(password) >= MIN_SPECIAL
  );
}

export function getPasswordRequirementChecks(password: string): {
  length: boolean;
  letter: boolean;
  letterCount: number;
  number: boolean;
  numberCount: number;
  special: boolean;
  specialCount: number;
} {
  const letterCount = countLetters(password);
  const numberCount = countNumbers(password);
  const specialCount = countSpecial(password);
  return {
    length: password.length >= MIN_LENGTH,
    letter: letterCount >= MIN_LETTERS,
    letterCount,
    number: numberCount >= MIN_NUMBERS,
    numberCount,
    special: specialCount >= MIN_SPECIAL,
    specialCount,
  };
}

export const PASSWORD_REQUIREMENT_MESSAGE =
  'Minimum 12 characters, with at least 2 letters, 2 numbers, and 2 special characters.';
