export interface SlugifyOptions {
    lowercase: boolean;
    alphanumeric: boolean;
    separator: string;
    replace: Record<string, string>;
}
export declare function slugifier(options?: SlugifyOptions): (string: string) => string;
