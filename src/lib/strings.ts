export const fill = (text: string, values: Record<string, string | number>) =>
    text.replace(/\{(\w+)\}/g, (placeholder, key: string) => String(values[key] ?? placeholder));
