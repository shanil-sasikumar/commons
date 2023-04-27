import * as nf from "node-fetch";
import UserAgent from 'user-agents';
import mime from "whatwg-mimetype";
import * as p from "./ts-pipe.js";
class RemoveUrlTrackingCodes {
    static singleton = new RemoveUrlTrackingCodes();
    static pattern = /(?<=&|\?)utm_.*?(&|$)/igm;
    async flow(_, url) {
        return url.replace(RemoveUrlTrackingCodes.pattern, "");
    }
}
export { RemoveUrlTrackingCodes };
const metaRefreshPattern = '(CONTENT|content)=["\']0;[ ]*(URL|url)=(.*?)(["\']\s*>)';
export function isVisitError(o) {
    return "error" in o;
}
export function isRedirectResult(o) {
    return "redirectUrl" in o;
}
export function isHttpRedirectResult(o) {
    return "httpRedirect" in o;
}
export function isContentRedirectResult(o) {
    return "metaRefreshRedirect" in o;
}
export function isTerminalResult(o) {
    return "terminalResult" in o;
}
export function isTerminalTextContentResult(o) {
    return "terminalTextContentResult" in o;
}
async function visit(originalURL, position, options) {
    const url = options.prepareUrlForFetch ? await options.prepareUrlForFetch.flow({ position: position }, originalURL) : originalURL;
    const response = await nf.default(url, {
        redirect: 'manual',
        follow: 0,
        timeout: options.fetchTimeOut,
        headers: {
            'User-Agent': options.userAgent.toString(),
        }
    });
    if (options.isRedirect(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
            return {
                url: url,
                error: new Error(`${url} responded with status ${response.status} but no location header`)
            };
        }
        return { url: url, httpRedirect: true, httpStatus: response.status, redirectUrl: location, httpResponse: options.saveHttpRedirectResponses ? response : undefined };
    }
    const contentType = response.headers.get("Content-Type");
    const mimeType = new mime(contentType);
    if (response.status == 200) {
        if (mimeType.type == "text") {
            const text = await response.text();
            const redirectUrl = options.extractMetaRefreshUrl(text);
            return redirectUrl ?
                { url: url, metaRefreshRedirect: true, httpStatus: response.status, redirectUrl: redirectUrl, contentText: options.saveContentRedirectText ? text : undefined, httpResponse: options.saveHttpRedirectResponses ? response : undefined, contentType: contentType, mimeType: mimeType } :
                { url: url, httpStatus: response.status, terminalResult: true, terminalTextContentResult: true, contentText: text, httpResponse: response, contentType: contentType, mimeType: mimeType };
        }
    }
    return { url: url, httpStatus: response.status, httpResponse: response, terminalResult: true, contentType: contentType, mimeType: mimeType };
}
class TypicalTraverseOptions {
    static singleton = new TypicalTraverseOptions({});
    userAgent;
    maxRedirectDepth;
    fetchTimeOut;
    saveContentRedirectText;
    saveHttpRedirectResponses;
    prepareUrlForFetch;
    constructor({ userAgent, maxRedirectDepth, fetchTimeOut, saveContentRedirectText: cacheContentRedirectText, saveHttpRedirectResponses }) {
        this.userAgent = userAgent || new UserAgent();
        this.maxRedirectDepth = typeof maxRedirectDepth === "undefined" ? 10 : maxRedirectDepth;
        this.fetchTimeOut = typeof fetchTimeOut === "undefined" ? 2500 : fetchTimeOut;
        this.saveContentRedirectText = typeof cacheContentRedirectText === "undefined" ? false : cacheContentRedirectText;
        this.saveHttpRedirectResponses = typeof saveHttpRedirectResponses === "undefined" ? false : saveHttpRedirectResponses;
        this.prepareUrlForFetch = p.pipe(RemoveUrlTrackingCodes.singleton);
    }
    extractMetaRefreshUrl(html) {
        let match = html.match(metaRefreshPattern);
        return match && match.length == 5 ? match[3] : null;
    }
    isRedirect(status) {
        return status === 301
            || status === 302
            || status === 303
            || status === 307
            || status === 308;
    }
}
export { TypicalTraverseOptions };
;
export async function traverse(originalURL, options = TypicalTraverseOptions.singleton) {
    const visits = [];
    let url = originalURL;
    let position = 1;
    let continueVisiting = true;
    while (continueVisiting) {
        if (position > options.maxRedirectDepth) {
            throw `Exceeded max redirect depth of ${options.maxRedirectDepth}`;
        }
        try {
            const visitResult = await visit(url, position, options);
            position++;
            visits.push(visitResult);
            if (isRedirectResult(visitResult)) {
                continueVisiting = true;
                url = visitResult.redirectUrl;
            }
            else {
                continueVisiting = false;
            }
        }
        catch (err) {
            continueVisiting = false;
            visits.push({ url: url, error: err });
        }
    }
    return visits;
}
export function isCallError(o) {
    return "postBodyPOJO" in o;
}
export function isCallResult(o) {
    return "callResultPOJO" in o;
}
class JsonCallOptions {
    static singleton = new JsonCallOptions({});
    httpMethod;
    userAgent;
    fetchTimeOut;
    validStatuses;
    headers;
    prepareBody;
    constructor({ httpMethod, userAgent, fetchTimeOut, validStatuses, headers, prepareBody }) {
        this.httpMethod = httpMethod || 'post';
        this.userAgent = userAgent || new UserAgent();
        this.fetchTimeOut = typeof fetchTimeOut === "undefined" ? 60000 : fetchTimeOut;
        this.validStatuses = validStatuses || [200];
        this.headers = headers || {
            'User-Agent': this.userAgent.toString(),
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        };
        this.prepareBody = prepareBody || ((pojo) => { return JSON.stringify(pojo); });
    }
}
export { JsonCallOptions };
;
class FormDataCallOptions {
    static singleton = new FormDataCallOptions({});
    httpMethod;
    userAgent;
    fetchTimeOut;
    validStatuses;
    headers;
    prepareBody;
    constructor({ httpMethod, userAgent, fetchTimeOut, validStatuses, headers, prepareBody }) {
        this.httpMethod = httpMethod || 'post';
        this.userAgent = userAgent || new UserAgent();
        this.fetchTimeOut = typeof fetchTimeOut === "undefined" ? 60000 : fetchTimeOut;
        this.validStatuses = validStatuses || [200];
        this.headers = headers || {
            'User-Agent': this.userAgent.toString(),
        };
        this.prepareBody = prepareBody || ((pojo) => { return pojo; });
    }
}
export { FormDataCallOptions };
;
export async function call(url, postBodyPOJO, options = JsonCallOptions.singleton) {
    try {
        const response = await nf.default(url, {
            method: options.httpMethod,
            redirect: 'follow',
            timeout: options.fetchTimeOut,
            body: options.prepareBody(postBodyPOJO),
            headers: options.headers
        });
        if (options.validStatuses.find(s => s == response.status)) {
            const contentType = response.headers.get("Content-Type");
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
            };
        }
        else {
            return {
                url,
                error: new Error("HTTP Status is not 200: " + response.status),
                postBodyPOJO,
                postResponse: response
            };
        }
    }
    catch (err) {
        return {
            url,
            error: err,
            postBodyPOJO
        };
    }
}
