export const trim = (text: string) => text.trim();
export const upper = (text: string) => text.toUpperCase();
export const lower = (text: string) => text.toLowerCase();
export const split = (text: string, sep?: string) => sep ? text.split(sep) : text.split(' ');
export const join = (list: string[], sep: string = '') => list.join(sep);
