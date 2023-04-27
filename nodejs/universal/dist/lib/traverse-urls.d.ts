import * as nf from "node-fetch";
import UserAgent from 'user-agents';
import mime from "whatwg-mimetype";
import * as p from "./ts-pipe.js";
export interface VisitContext {
    readonly position: number;
}
export declare class RemoveUrlTrackingCodes implements p.PipeUnion<VisitContext, string> {
    static readonly singleton: RemoveUrlTrackingCodes;
    static readonly pattern: RegExp;
    flow(_: VisitContext, url: string): Promise<string>;
}
export interface VisitResult {
    readonly url: string;
}
export interface VisitError extends VisitResult {
    readonly error: Error;
}
export declare function isVisitError(o: VisitResult): o is VisitError;
export interface VisitSuccess extends VisitResult {
    readonly httpStatus: number;
}
export interface RedirectResult extends VisitSuccess {
    readonly redirectUrl: string;
    readonly httpResponse?: nf.Response;
}
export declare function isRedirectResult(o: VisitResult): o is RedirectResult;
export interface HttpRedirectResult extends RedirectResult {
    readonly httpRedirect: boolean;
}
export declare function isHttpRedirectResult(o: VisitResult): o is HttpRedirectResult;
export interface ContentRedirectResult extends VisitSuccess {
    readonly metaRefreshRedirect: boolean;
    readonly contentText?: string;
    readonly contentType: string;
    readonly mimeType: mime;
}
export declare function isContentRedirectResult(o: VisitResult): o is ContentRedirectResult;
export interface TerminalResult extends VisitSuccess {
    readonly terminalResult: boolean;
    readonly httpResponse: nf.Response;
    readonly contentType: string;
    readonly mimeType: mime;
}
export declare function isTerminalResult(o: VisitResult): o is TerminalResult;
export interface TerminalTextContentResult extends TerminalResult {
    readonly terminalTextContentResult: boolean;
    readonly contentText: string;
}
export declare function isTerminalTextContentResult(o: VisitResult): o is TerminalTextContentResult;
export type ConstrainedVisitResult = VisitError | HttpRedirectResult | ContentRedirectResult | TerminalResult | TerminalTextContentResult;
export interface TraverseOptions {
    readonly userAgent: UserAgent;
    readonly maxRedirectDepth: number;
    readonly fetchTimeOut: number;
    readonly saveContentRedirectText: boolean;
    readonly saveHttpRedirectResponses: boolean;
    readonly prepareUrlForFetch?: p.PipeUnion<VisitContext, string>;
    extractMetaRefreshUrl(html: string): string | null;
    isRedirect(status: number): boolean;
}
export declare class TypicalTraverseOptions implements TraverseOptions {
    static readonly singleton: TypicalTraverseOptions;
    readonly userAgent: UserAgent;
    readonly maxRedirectDepth: number;
    readonly fetchTimeOut: number;
    readonly saveContentRedirectText: boolean;
    readonly saveHttpRedirectResponses: boolean;
    readonly prepareUrlForFetch: p.PipeUnion<VisitContext, string>;
    constructor({ userAgent, maxRedirectDepth, fetchTimeOut, saveContentRedirectText: cacheContentRedirectText, saveHttpRedirectResponses }: Partial<TraverseOptions>);
    extractMetaRefreshUrl(html: string): string | null;
    isRedirect(status: number): boolean;
}
export declare function traverse(originalURL: string, options?: TypicalTraverseOptions): Promise<VisitResult[]>;
export interface CallError extends VisitError {
    readonly postBodyPOJO: any;
    readonly postResponse?: nf.Response;
}
export declare function isCallError(o: VisitResult): o is CallError;
export interface CallResultSuccess extends TerminalResult {
    readonly postBodyPOJO: any;
    readonly callResultPOJO: any;
}
export declare function isCallResult(o: VisitResult): o is CallResultSuccess;
export interface CallOptions {
    readonly userAgent: UserAgent;
    readonly httpMethod: string;
    readonly fetchTimeOut: number;
    readonly validStatuses: number[];
    readonly headers: {
        [key: string]: string;
    };
    readonly prepareBody: (pojo: any) => any;
}
export declare class JsonCallOptions implements CallOptions {
    static readonly singleton: JsonCallOptions;
    readonly httpMethod: string;
    readonly userAgent: UserAgent;
    readonly fetchTimeOut: number;
    readonly validStatuses: number[];
    readonly headers: {
        [key: string]: string;
    };
    readonly prepareBody: (pojo: any) => any;
    constructor({ httpMethod, userAgent, fetchTimeOut, validStatuses, headers, prepareBody }: Partial<CallOptions>);
}
export declare class FormDataCallOptions implements CallOptions {
    static readonly singleton: FormDataCallOptions;
    readonly httpMethod: string;
    readonly userAgent: UserAgent;
    readonly fetchTimeOut: number;
    readonly validStatuses: number[];
    readonly headers: {
        [key: string]: string;
    };
    readonly prepareBody: (pojo: any) => any;
    constructor({ httpMethod, userAgent, fetchTimeOut, validStatuses, headers, prepareBody }: Partial<CallOptions>);
}
export declare function call(url: string, postBodyPOJO: any, options?: JsonCallOptions): Promise<CallError | CallResultSuccess>;
