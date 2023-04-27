import { z } from 'zod';
export declare const foreignContentSchema: any;
export type ForeignContent = z.infer<typeof foreignContentSchema>;
/**
 * Given a URL, create a JSDOM instance that allows querying of HTML as it would
 * be done in a browser. No sanitization is done.
 * @param url the URL to load
 * @returns JSDOM instance
 */
export declare function queryableContent(url: string): Promise<any>;
/**
 * Given a URL, create a JSDOM instance that allows querying of HTML as it would
 * be done in a browser. Potential XSS/JS is stripped using DOMPurify library.
 * @param url the URL to load
 * @returns JSDOM instance with sanitized HTML
 */
export declare function queryableSanitizedContent(url: string): Promise<any>;
export declare function readableContent(url: string): Promise<any>;
