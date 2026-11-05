// Staff profile URLs of the form /<person>/ -> staff slug (DEC-65); the catch-all route serves them from the `staff` collection.
// IHNA has no such URLs, so the map is empty and the catch-all answers 404. IHNA profiles are /staff-profile/?id=N (DEC-111).
export const staffPaths: Record<string, string> = {}
