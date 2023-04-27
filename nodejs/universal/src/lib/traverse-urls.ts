import * as nf from "node-fetch";
import UserAgent from 'user-agents';
import mime from "whatwg-mimetype";
import * as p from "./ts-pipe.js"

export interface VisitContext {
    readonly position: number;
}

export class RemoveUrlTrackingCodes implements p.PipeUnion<VisitContext, string> {
    static readonly singleton = new RemoveUrlTrackingCodes();
    static readonly pattern = /(?<=&|\?)utm_.*?(&|$)/igm;

    async flow(_: VisitContext, url: string): Promise<string> {
        return url.replace(RemoveUrlTrackingCodes.pattern, "");
    }
}

const metaRefreshPattern = '(CONTENT|content)=["\']0;[ ]*(URL|url)=(.*?)(["\']\s*>)';

export interface VisitResult {
    readonly url: string;
}

export interface VisitError extends VisitResult {
    readonly error: Error;
}

export function isVisitError(o: VisitResult): o is VisitError {
    return "error" in o;
}

export interface VisitSuccess extends VisitResult {
    readonly httpStatus: number;
}

export interface RedirectResult extends VisitSuccess {
    readonly redirectUrl: string;
    readonly httpResponse?: nf.Response;
}

export function isRedirectResult(o: VisitResult): o is RedirectResult {
    return "redirectUrl" in o;
}

export interface HttpRedirectResult extends RedirectResult {
    readonly httpRedirect: boolean;
}

export function isHttpRedirectResult(o: VisitResult): o is HttpRedirectResult {
    return "httpRedirect" in o;
}

export interface ContentRedirectResult extends VisitSuccess {
    readonly metaRefreshRedirect: boolean;
    readonly contentText?: string;
    readonly contentType: string;
    readonly mimeType: mime;
}

export function isContentRedirectResult(o: VisitResult): o is ContentRedirectResult {
    return "metaRefreshRedirect" in o;
}

export interface TerminalResult extends VisitSuccess {
    readonly terminalResult: boolean;
    readonly httpResponse: nf.Response;
    readonly contentType: string;
    readonly mimeType: mime;
}

export function isTerminalResult(o: VisitResult): o is TerminalResult {
    return "terminalResult" in o;
}

export interface TerminalTextContentResult extends TerminalResult {
    readonly terminalTextContentResult: boolean;
    readonly contentText: string;
}

export function isTerminalTextContentResult(o: VisitResult): o is TerminalTextContentResult {
    return "terminalTextContentResult" in o;
}

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

async function visit(originalURL: string, position: number, options: TraverseOptions): Promise<ConstrainedVisitResult> {
    const url = options.prepareUrlForFetch ? await options.prepareUrlForFetch.flow({ position: position }, originalURL) : originalURL;
    const response = await nf.default(url, {
        redirect: 'manual',
        follow: 0,
        timeout: options.fetchTimeOut,
        headers: {
            'User-Agent': options.userAgent.toString(),
        }
    })

    if (options.isRedirect(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
            return {
                url: url,
                error: new Error(`${url} responded with status ${response.status} but no location header`)
            }
        }
        return { url: url, httpRedirect: true, httpStatus: response.status, redirectUrl: location, httpResponse: options.saveHttpRedirectResponses ? response : undefined };
    }
    const contentType = response.headers.get("Content-Type")!
    const mimeType = new mime(contentType);
    if (response.status == 200) {
        if (mimeType.type == "text") {
            const text = await response.text();
            const redirectUrl = options.extractMetaRefreshUrl(text);
            return redirectUrl ?
                { url: url, metaRefreshRedirect: true, httpStatus: response.status, redirectUrl: redirectUrl, contentText: options.saveContentRedirectText ? text : undefined, httpResponse: options.saveHttpRedirectResponses ? response : undefined, contentType: contentType, mimeType: mimeType } :
                { url: url, httpStatus: response.status, terminalResult: true, terminalTextContentResult: true, contentText: text, httpResponse: response, contentType: contentType, mimeType: mimeType }
        }
    }
    return { url: url, httpStatus: response.status, httpResponse: response, terminalResult: true, contentType: contentType, mimeType: mimeType }
}

export class TypicalTraverseOptions implements TraverseOptions {
    static readonly singleton = new TypicalTraverseOptions({});
    readonly userAgent: UserAgent;
    readonly maxRedirectDepth: number;
    readonly fetchTimeOut: number;
    readonly saveContentRedirectText: boolean;
    readonly saveHttpRedirectResponses: boolean;
    readonly prepareUrlForFetch: p.PipeUnion<VisitContext, string>;

    constructor({ userAgent, maxRedirectDepth, fetchTimeOut, saveContentRedirectText: cacheContentRedirectText, saveHttpRedirectResponses }: Partial<TraverseOptions>) {
        this.userAgent = userAgent || new UserAgent();
        this.maxRedirectDepth = typeof maxRedirectDepth === "undefined" ? 10 : maxRedirectDepth;
        this.fetchTimeOut = typeof fetchTimeOut === "undefined" ? 2500 : fetchTimeOut;
        this.saveContentRedirectText = typeof cacheContentRedirectText === "undefined" ? false : cacheContentRedirectText;
        this.saveHttpRedirectResponses = typeof saveHttpRedirectResponses === "undefined" ? false : saveHttpRedirectResponses;
        this.prepareUrlForFetch = p.pipe(RemoveUrlTrackingCodes.singleton);
    }

    extractMetaRefreshUrl(html: string): string | null {
        let match = html.match(metaRefreshPattern);
        return match && match.length == 5 ? match[3] : null;
    }

    isRedirect(status: number): boolean {
        return status === 301
            || status === 302
            || status === 303
            || status === 307
            || status === 308;
    }
};

export async function traverse(originalURL: string, options = TypicalTraverseOptions.singleton): Promise<VisitResult[]> {
    const visits: VisitResult[] = [];
    let url: string | undefined | null = originalURL;
    let position = 1;
    let continueVisiting = true;
    while (continueVisiting) {
        if (position > options.maxRedirectDepth) {
            throw `Exceeded max redirect depth of ${options.maxRedirectDepth}`
        }
        try {
            const visitResult: ConstrainedVisitResult = await visit(url!, position, options);
            position++;
            visits.push(visitResult);
            if (isRedirectResult(visitResult)) {
                continueVisiting = true;
                url = visitResult.redirectUrl;
            } else {
                continueVisiting = false;
            }
        } catch (err) {
            continueVisiting = false;
            visits.push({ url: url!, error: err } as VisitError);
        }
    }
    return visits;
}

export interface CallError extends VisitError {
    readonly postBodyPOJO: any;
    readonly postResponse?: nf.Response;
}

export function isCallError(o: VisitResult): o is CallError {
    return "postBodyPOJO" in o;
}

export interface CallResultSuccess extends TerminalResult {
    readonly postBodyPOJO: any;
    readonly callResultPOJO: any;
}

export function isCallResult(o: VisitResult): o is CallResultSuccess {
    return "callResultPOJO" in o;
}

export interface CallOptions {
    readonly userAgent: UserAgent;
    readonly httpMethod: string;
    readonly fetchTimeOut: number;
    readonly validStatuses: number[];
    readonly headers: { [key: string]: string };
    readonly prepareBody: (pojo: any) => any;
}

export class JsonCallOptions implements CallOptions {
    static readonly singleton = new JsonCallOptions({});
    readonly httpMethod: string;
    readonly userAgent: UserAgent;
    readonly fetchTimeOut: number;
    readonly validStatuses: number[];
    readonly headers: { [key: string]: string };
    readonly prepareBody: (pojo: any) => any;

    constructor({ httpMethod, userAgent, fetchTimeOut, validStatuses, headers, prepareBody }: Partial<CallOptions>) {
        this.httpMethod = httpMethod || 'post';
        this.userAgent = userAgent || new UserAgent();
        this.fetchTimeOut = typeof fetchTimeOut === "undefined" ? 60000 : fetchTimeOut;
        this.validStatuses = validStatuses || [200];
        this.headers = headers || {
            'User-Agent': this.userAgent.toString(),
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        }
        this.prepareBody = prepareBody || ((pojo: any): any => { return JSON.stringify(pojo); });
    }
};

export class FormDataCallOptions implements CallOptions {
    static readonly singleton = new FormDataCallOptions({});
    readonly httpMethod: string;
    readonly userAgent: UserAgent;
    readonly fetchTimeOut: number;
    readonly validStatuses: number[];
    readonly headers: { [key: string]: string };
    readonly prepareBody: (pojo: any) => any;

    constructor({ httpMethod, userAgent, fetchTimeOut, validStatuses, headers, prepareBody }: Partial<CallOptions>) {
        this.httpMethod = httpMethod || 'post';
        this.userAgent = userAgent || new UserAgent();
        this.fetchTimeOut = typeof fetchTimeOut === "undefined" ? 60000 : fetchTimeOut;
        this.validStatuses = validStatuses || [200];
        this.headers = headers || {
            'User-Agent': this.userAgent.toString(),
        }
        this.prepareBody = prepareBody || ((pojo: any): any => { return pojo; });
    }
};

export async function call(url: string, postBodyPOJO: any, options = JsonCallOptions.singleton): Promise<CallError | CallResultSuccess> {
    try {
        const response = await nf.default(url, {
            method: options.httpMethod,
            redirect: 'follow',
            timeout: options.fetchTimeOut,
            body: options.prepareBody(postBodyPOJO),
            headers: options.headers
        });

        if (options.validStatuses.find(s => s == response.status)) {
            const contentType = response.headers.get("Content-Type")!
            const mimeType = new mime(contentType);
            const pojo = await response.json();
            return {
                terminalResult: true,
                url: url,
                callResultPOJO: (pojo.body && typeof pojo.body === "string") ? JSON.parse(pojo.body) : pojo,
                postBodyPOJO: postBodyPOJO,
                contentType: contentType,
                mimeType: mimeType,
                httpResponse: response,
                httpStatus: response.status,
            }
        } else {
            return {
                url,
                error: new Error("HTTP Status is not 200: " + response.status),
                postBodyPOJO,
                postResponse: response
            }
        }

    } catch (err) {
        return {
            url,
            error: err,
            postBodyPOJO
        }
    }
}