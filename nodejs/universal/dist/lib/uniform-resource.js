import * as qc from "./queryable-content.js";
import * as tru from "./traverse-urls.js";
import * as p from "./ts-pipe.js";
import contentDisposition from "content-disposition";
import ft from "file-type";
import * as fs from 'fs';
import os from "os";
import path from "path";
import url from "url";
import { v4 as uuidv4 } from 'uuid';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { pipeline } from 'stream';
import { promisify } from 'util';
import Mercury from '@postlight/mercury-parser';
const streamPipeline = promisify(pipeline);
export function isUniformResource(o) {
    return o && "isUniformResource" in o;
}
export function isInvalidResource(o) {
    return o && "isInvalidResource" in o;
}
export function isTransformedResource(o) {
    return o && "transformedFromUR" in o && "pipePosition" in o;
}
export function nextTransformationPipePosition(o) {
    return "pipePosition" in o ? o.pipePosition + 1 : 0;
}
export function allTransformationRemarks(tr) {
    const result = [];
    let active = tr;
    while (isTransformedResource(active)) {
        result.unshift(active.remarks || "(no remarks)");
        active = active.transformedFromUR;
    }
    return result;
}
class RemoveLabelLineBreaksAndTrimSpaces {
    static singleton = new RemoveLabelLineBreaksAndTrimSpaces();
    async flow(_, resource) {
        if (!resource.label) {
            return resource;
        }
        const cleanLabel = resource.label.replace(/\r\n|\n|\r/gm, " ").trim();
        if (cleanLabel != resource.label) {
            return {
                ...resource,
                pipePosition: nextTransformationPipePosition(resource),
                transformedFromUR: resource,
                label: cleanLabel,
                remarks: "Removed line breaks and trimmed spaces in label"
            };
        }
        return resource;
    }
}
export { RemoveLabelLineBreaksAndTrimSpaces };
class RemoveTrackingCodesFromUrl {
    static singleton = new RemoveTrackingCodesFromUrl();
    async flow(_, resource) {
        const cleanedURI = resource.uri.replace(/(?<=&|\?)utm_.*?(&|$)/igm, "");
        if (cleanedURI != resource.uri) {
            const transformed = {
                ...resource,
                pipePosition: nextTransformationPipePosition(resource),
                transformedFromUR: resource,
                remarks: "Removed utm_* tracking parameters from URL",
            };
            return transformed;
        }
        else {
            return resource;
        }
    }
}
export { RemoveTrackingCodesFromUrl };
export function isFollowedResource(o) {
    return o && "isFollowedResource" in o;
}
export function isRedirectedResource(o) {
    return o && "isRedirectedResource" in o;
}
class FollowRedirectsGranular {
    fetchTimeOut;
    static singleton = new FollowRedirectsGranular();
    constructor(fetchTimeOut) {
        this.fetchTimeOut = fetchTimeOut;
    }
    async flow(ctx, resource) {
        let result = resource;
        let traveseOptions = new tru.TypicalTraverseOptions({
            fetchTimeOut: ctx.fetchTimeOut || this.fetchTimeOut || 5000
        });
        let visitResults = await tru.traverse(resource.uri, traveseOptions);
        if (visitResults.length > 0) {
            const last = visitResults[visitResults.length - 1];
            if (tru.isTerminalResult(last)) {
                if (visitResults.length > 1) {
                    result = {
                        ...resource,
                        pipePosition: nextTransformationPipePosition(resource),
                        transformedFromUR: resource,
                        remarks: "Followed, with " + visitResults.length + " results",
                        isFollowedResource: true,
                        isRedirectedResource: true,
                        followResults: visitResults,
                        uri: last.url,
                        URL: new url.URL(last.url),
                        terminalResult: last
                    };
                }
                else {
                    result = {
                        ...resource,
                        isFollowedResource: true,
                        uri: last.url,
                        URL: new url.URL(last.url),
                        terminalResult: last
                    };
                }
            }
            else if (tru.isVisitError(last)) {
                result = {
                    isInvalidResource: true,
                    ...resource,
                    error: last.error,
                    remarks: last.error.message
                };
            }
        }
        return result;
    }
}
export { FollowRedirectsGranular };
export function isMercuryReadableContent(o) {
    return o && "mercuryReadable" in o;
}
class EnrichMercuryReadableContent {
    static singleton = new EnrichMercuryReadableContent();
    async flow(_, resource) {
        if (isFollowedResource(resource)) {
            const tr = resource.terminalResult;
            if (tru.isTerminalTextContentResult(tr)) {
                return {
                    ...resource,
                    mercuryReadable: async () => {
                        return await Mercury.parse(resource.uri, { html: Buffer.from(tr.contentText, 'utf8') });
                    },
                };
            }
        }
        return {
            ...resource,
            mercuryReadable: async () => {
                return await Mercury.parse(resource.uri);
            },
        };
    }
}
export { EnrichMercuryReadableContent };
export function isMozillaReadabilityContent(o) {
    return o && "mozillaReadability" in o;
}
class EnrichMozillaReadabilityContent {
    static singleton = new EnrichMozillaReadabilityContent();
    async flow(_, resource) {
        if (isFollowedResource(resource)) {
            const tr = resource.terminalResult;
            if (tru.isTerminalTextContentResult(tr)) {
                return {
                    ...resource,
                    mozillaReadability: () => {
                        const jd = new JSDOM(tr.contentText, { url: resource.uri });
                        const reader = new Readability(jd.window.document);
                        return reader.parse();
                    }
                };
            }
        }
        return {
            ...resource,
            mozillaReadability: () => {
                const jd = new JSDOM(``, {
                    url: resource.uri,
                    includeNodeLocations: true,
                });
                const reader = new Readability(jd.window.document);
                return reader.parse();
            }
        };
    }
}
export { EnrichMozillaReadabilityContent };
export function isDownloadAttemptResult(o) {
    return o && "isDownloadAttemptResult" in o;
}
export function isDownloadSkipResult(o) {
    return o && "downloadSkippedReason" in o;
}
export function isDownloadErrorResult(o) {
    return o && "downloadError" in o;
}
export function isDownloadSuccessResult(o) {
    return o && "downloadDestPath" in o;
}
export function isDownloadFileResult(o) {
    return o && "downloadDestPath" in o && "downloadedFileType" in o;
}
export function isDownloadIdeterminateFileResult(o) {
    return o && "unknownFileType" in o && "downloadedFileType" in o;
}
export class TypicalDownloader {
    destPath;
    determineFileType;
    constructor({ destPath, createDestPath, determineFileType }) {
        this.destPath = destPath || path.join(os.tmpdir(), "uniform-resource-downloads");
        this.determineFileType = typeof determineFileType == "undefined" ? true : determineFileType;
        if (createDestPath) {
            try {
                fs.mkdirSync(this.destPath);
            }
            catch (e) {
                // the directory already exists?
                // TODO: add error checking
            }
        }
    }
    writer() {
        return fs.createWriteStream(path.join(this.destPath, uuidv4()));
    }
    async finalize(_, resource, writer) {
        const dfs = writer;
        const downloadDestPath = dfs.path;
        let sizeExpected = -1;
        if (tru.isTerminalResult(resource.terminalResult)) {
            const sizeHeader = resource.terminalResult.httpResponse.headers.get("Content-Length");
            if (sizeHeader)
                sizeExpected = parseInt(sizeHeader);
        }
        const stats = fs.statSync(downloadDestPath);
        if (this.determineFileType) {
            let cd = undefined;
            if (tru.isTerminalResult(resource.terminalResult)) {
                const cdHeader = resource.terminalResult.httpResponse.headers.get("Content-Disposition");
                if (cdHeader) {
                    cd = contentDisposition.parse(cdHeader);
                }
            }
            const fileType = await ft.fromFile(downloadDestPath);
            if (fileType) {
                const finalFileName = dfs.path + "." + fileType.ext;
                fs.renameSync(downloadDestPath, finalFileName);
                return {
                    isDownloadAttemptResult: true,
                    sizeExpected: sizeExpected,
                    downloadedFileStats: stats,
                    downloadDestPath: finalFileName,
                    downloadedFileType: fileType,
                    contentDisposition: cd
                };
            }
            else {
                return {
                    isDownloadAttemptResult: true,
                    downloadDestPath: downloadDestPath,
                    unknownFileType: "Unable to determine type of file " + downloadDestPath,
                    contentDisposition: cd,
                    sizeExpected: sizeExpected,
                    downloadedFileStats: stats
                };
            }
        }
        return {
            isDownloadAttemptResult: true,
            downloadDestPath: downloadDestPath,
            sizeExpected: sizeExpected,
            downloadedFileStats: stats
        };
    }
}
class DownloadContent {
    downloader;
    static typicalDownloader = new TypicalDownloader({ createDestPath: true });
    static singleton = new DownloadContent(DownloadContent.typicalDownloader);
    constructor(downloader) {
        this.downloader = downloader;
    }
    async flow(_, resource) {
        if (isFollowedResource(resource)) {
            if (tru.isTerminalResult(resource.terminalResult)) {
                try {
                    const writer = this.downloader.writer(this, resource);
                    if (tru.isTerminalTextContentResult(resource.terminalResult)) {
                        writer.write(resource.terminalResult.contentText);
                    }
                    else {
                        await streamPipeline(resource.terminalResult.httpResponse.body, writer);
                    }
                    const success = await this.downloader.finalize(this, resource, writer);
                    return {
                        ...resource,
                        ...success
                    };
                }
                catch (e) {
                    return {
                        ...resource,
                        downloadError: e
                    };
                }
            }
        }
        return {
            ...resource,
            isDownloadAttemptResult: true,
            downloadSkippedReason: `Unable to download, resource [${resource.label}](${resource.uri}) was not traversed`,
        };
    }
}
export { DownloadContent };
class DownloadHttpContentTypes {
    wrapperDC;
    static pdfsOnly = new DownloadHttpContentTypes(DownloadContent.singleton, "application/pdf");
    contentTypes;
    constructor(wrapperDC, ...contentTypes) {
        this.wrapperDC = wrapperDC;
        this.contentTypes = contentTypes;
    }
    async flow(ctx, resource) {
        if (isFollowedResource(resource)) {
            const visitResult = resource.terminalResult;
            if (tru.isTerminalResult(visitResult)) {
                if (this.contentTypes.find(contentType => contentType == visitResult.contentType)) {
                    return this.wrapperDC.flow(ctx, resource);
                }
            }
        }
        return resource;
    }
}
export { DownloadHttpContentTypes };
class EnrichGovernedContent {
    static singleton = new EnrichGovernedContent();
    async flow(_, resource) {
        let result = resource;
        if (isFollowedResource(resource) && tru.isTerminalTextContentResult(resource.terminalResult)) {
            const textResult = resource.terminalResult;
            result = {
                ...resource,
                contentType: textResult.contentType,
                mimeType: textResult.mimeType
            };
        }
        return result;
    }
}
export { EnrichGovernedContent };
export function isFavIconSupplier(o) {
    return o && "favIconResource" in o;
}
class FavIconResource {
    transformer;
    static followOnly = new FavIconResource(p.pipe(FollowRedirectsGranular.singleton));
    static followAndDownload = new FavIconResource(p.pipe(FollowRedirectsGranular.singleton, DownloadContent.singleton));
    constructor(transformer) {
        this.transformer = transformer;
    }
    async flow(_, resource) {
        const favIconURL = new URL(resource.uri);
        favIconURL.pathname = '/favicon.ico';
        const fir = await acquireResource({
            uri: favIconURL.href,
            transformer: this.transformer,
            provenance: { provenanceURN: resource.uri },
        });
        return {
            ...resource,
            favIconResource: fir
        };
    }
}
export { FavIconResource };
export function isCuratableContentResource(o) {
    return o && ("curatableContent" in o);
}
class EnrichCuratableContent {
    contentTr;
    static singleton = new EnrichCuratableContent(p.pipe(qc.BuildCuratableContent.singleton, qc.StandardizeCurationTitle.singleton));
    constructor(contentTr) {
        this.contentTr = contentTr;
    }
    async flow(_, resource) {
        let result = resource;
        if (isFollowedResource(resource) && tru.isTerminalTextContentResult(resource.terminalResult)) {
            const textResult = resource.terminalResult;
            const content = await this.contentTr.flow({
                uri: resource.uri,
                htmlSource: textResult.contentText
            }, {
                contentType: textResult.contentType,
                mimeType: textResult.mimeType
            });
            result = {
                ...resource,
                curatableContent: content,
                domainBrand: resource.URL.hostname.replace(/^www\./, "")
            };
        }
        return result;
    }
}
export { EnrichCuratableContent };
export async function acquireResource({ uri, label, provenance, transformer }) {
    let result = {
        isUniformResource: true,
        provenance: provenance || { provenanceURN: "unknown" },
        uri: uri,
        label: label
    };
    return await transformer.flow({}, result);
}
