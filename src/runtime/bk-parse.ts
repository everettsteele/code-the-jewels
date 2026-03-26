export const words = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0);
export const lines = (text: string) => text.split(/\r?\n/);
export const chars = (text: string) => text.split('');
