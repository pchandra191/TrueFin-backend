/**
 * Generates a unique client/borrower ID string.
 *
 * Format: {uuid}-{cityId}{borrowerId}{lastTwoDigitsOfYear}
 *
 * Example:
 *   f47ac10b-58cc-4372-a567-0e02b2c3d479-2121
 *   where 2 = cityId, 1 = borrowerId, 21 = year suffix
 */
export function generateClientId(uuid: string, cityId: number, borrowerId: number): string {
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  return `${uuid}-${cityId}${borrowerId}${yearSuffix}`;
}
