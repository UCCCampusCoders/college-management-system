export function getFullName(first_name: string, middle_name?: string, last_name?: string) {
    const fullName = [first_name, middle_name, last_name]
        .filter(Boolean)
        .join(" ");
    return fullName.trim();
}