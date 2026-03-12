/**
 * Ensures label uniqueness across an export run.
 * Auto-renames collisions by appending a counter suffix.
 */
export class LabelRegistry {
  private seen = new Map<string, number>();

  /** Register a label and return the (possibly renamed) unique label. */
  register(label: string): string {
    if (!label) return "";
    const count = this.seen.get(label);
    if (count === undefined) {
      this.seen.set(label, 1);
      return label;
    }
    // Collision: append counter
    const unique = `${label}:${count + 1}`;
    this.seen.set(label, count + 1);
    // Also register the derived label so further collisions are handled
    this.seen.set(unique, 1);
    return unique;
  }

  clear(): void {
    this.seen.clear();
  }
}
