export class SlugUtil {
  /**
   * Generate a URL-friendly slug from a string
   * @param text The text to convert to a slug
   * @returns A URL-friendly slug
   */
  static generateSlug(text: string): string {
    if (!text) return '';
    
    return text
      .toLowerCase() // Convert to lowercase
      .trim() // Remove leading/trailing whitespace
      .replace(/[\s\W-]+/g, '-') // Replace spaces and special characters with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length to 100 characters
  }

  /**
   * Generate a unique slug by checking against existing slugs
   * @param baseSlug The base slug to make unique
   * @param existingSlugs Array of existing slugs to check against
   * @returns A unique slug
   */
  static generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
    let slug = baseSlug;
    let counter = 1;

    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Validate if a slug is in the correct format
   * @param slug The slug to validate
   * @returns True if the slug is valid
   */
  static isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length <= 100;
  }
}
