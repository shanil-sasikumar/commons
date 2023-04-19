var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@shah/queryable-content", "@shah/traverse-urls", "@shah/ts-pipe", "content-disposition", "file-type", "fs", "os", "path", "url", "util", "uuid"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.acquireResource = exports.EnrichCuratableContent = exports.isCuratableContentResource = exports.FavIconResource = exports.isFavIconSupplier = exports.EnrichGovernedContent = exports.DownloadHttpContentTypes = exports.DownloadContent = exports.TypicalDownloader = exports.isDownloadIdeterminateFileResult = exports.isDownloadFileResult = exports.isDownloadSuccessResult = exports.isDownloadErrorResult = exports.isDownloadSkipResult = exports.isDownloadAttemptResult = exports.EnrichMozillaReadabilityContent = exports.isMozillaReadabilityContent = exports.EnrichMercuryReadableContent = exports.isMercuryReadableContent = exports.FollowRedirectsGranular = exports.isRedirectedResource = exports.isFollowedResource = exports.RemoveTrackingCodesFromUrl = exports.RemoveLabelLineBreaksAndTrimSpaces = exports.allTransformationRemarks = exports.nextTransformationPipePosition = exports.isTransformedResource = exports.isInvalidResource = exports.isUniformResource = void 0;
    const qc = __importStar(require("@shah/queryable-content"));
    const tru = __importStar(require("@shah/traverse-urls"));
    const p = __importStar(require("@shah/ts-pipe"));
    const content_disposition_1 = __importDefault(require("content-disposition"));
    const file_type_1 = __importDefault(require("file-type"));
    const fs = __importStar(require("fs"));
    const os_1 = __importDefault(require("os"));
    const path_1 = __importDefault(require("path"));
    const url_1 = __importDefault(require("url"));
    const util = __importStar(require("util"));
    const uuid_1 = require("uuid");
    const streamPipeline = util.promisify(require('stream').pipeline);
    function isUniformResource(o) {
        return o && "isUniformResource" in o;
    }
    exports.isUniformResource = isUniformResource;
    function isInvalidResource(o) {
        return o && "isInvalidResource" in o;
    }
    exports.isInvalidResource = isInvalidResource;
    function isTransformedResource(o) {
        return o && "transformedFromUR" in o && "pipePosition" in o;
    }
    exports.isTransformedResource = isTransformedResource;
    function nextTransformationPipePosition(o) {
        return "pipePosition" in o ? o.pipePosition + 1 : 0;
    }
    exports.nextTransformationPipePosition = nextTransformationPipePosition;
    function allTransformationRemarks(tr) {
        const result = [];
        let active = tr;
        while (isTransformedResource(active)) {
            result.unshift(active.remarks || "(no remarks)");
            active = active.transformedFromUR;
        }
        return result;
    }
    exports.allTransformationRemarks = allTransformationRemarks;
    class RemoveLabelLineBreaksAndTrimSpaces {
        flow(_, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!resource.label) {
                    return resource;
                }
                const cleanLabel = resource.label.replace(/\r\n|\n|\r/gm, " ").trim();
                if (cleanLabel != resource.label) {
                    return Object.assign(Object.assign({}, resource), { pipePosition: nextTransformationPipePosition(resource), transformedFromUR: resource, label: cleanLabel, remarks: "Removed line breaks and trimmed spaces in label" });
                }
                return resource;
            });
        }
    }
    exports.RemoveLabelLineBreaksAndTrimSpaces = RemoveLabelLineBreaksAndTrimSpaces;
    RemoveLabelLineBreaksAndTrimSpaces.singleton = new RemoveLabelLineBreaksAndTrimSpaces();
    class RemoveTrackingCodesFromUrl {
        flow(_, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                const cleanedURI = resource.uri.replace(/(?<=&|\?)utm_.*?(&|$)/igm, "");
                if (cleanedURI != resource.uri) {
                    const transformed = Object.assign(Object.assign({}, resource), { pipePosition: nextTransformationPipePosition(resource), transformedFromUR: resource, remarks: "Removed utm_* tracking parameters from URL" });
                    return transformed;
                }
                else {
                    return resource;
                }
            });
        }
    }
    exports.RemoveTrackingCodesFromUrl = RemoveTrackingCodesFromUrl;
    RemoveTrackingCodesFromUrl.singleton = new RemoveTrackingCodesFromUrl();
    function isFollowedResource(o) {
        return o && "isFollowedResource" in o;
    }
    exports.isFollowedResource = isFollowedResource;
    function isRedirectedResource(o) {
        return o && "isRedirectedResource" in o;
    }
    exports.isRedirectedResource = isRedirectedResource;
    class FollowRedirectsGranular {
        constructor(fetchTimeOut) {
            this.fetchTimeOut = fetchTimeOut;
        }
        flow(ctx, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = resource;
                let traveseOptions = new tru.TypicalTraverseOptions({
                    fetchTimeOut: ctx.fetchTimeOut || this.fetchTimeOut || 5000
                });
                let visitResults = yield tru.traverse(resource.uri, traveseOptions);
                if (visitResults.length > 0) {
                    const last = visitResults[visitResults.length - 1];
                    if (tru.isTerminalResult(last)) {
                        if (visitResults.length > 1) {
                            result = Object.assign(Object.assign({}, resource), { pipePosition: nextTransformationPipePosition(resource), transformedFromUR: resource, remarks: "Followed, with " + visitResults.length + " results", isFollowedResource: true, isRedirectedResource: true, followResults: visitResults, uri: last.url, URL: new url_1.default.URL(last.url), terminalResult: last });
                        }
                        else {
                            result = Object.assign(Object.assign({}, resource), { isFollowedResource: true, uri: last.url, URL: new url_1.default.URL(last.url), terminalResult: last });
                        }
                    }
                    else if (tru.isVisitError(last)) {
                        result = Object.assign(Object.assign({ isInvalidResource: true }, resource), { error: last.error, remarks: last.error.message });
                    }
                }
                return result;
            });
        }
    }
    exports.FollowRedirectsGranular = FollowRedirectsGranular;
    FollowRedirectsGranular.singleton = new FollowRedirectsGranular();
    function isMercuryReadableContent(o) {
        return o && "mercuryReadable" in o;
    }
    exports.isMercuryReadableContent = isMercuryReadableContent;
    class EnrichMercuryReadableContent {
        flow(_, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                if (isFollowedResource(resource)) {
                    const tr = resource.terminalResult;
                    if (tru.isTerminalTextContentResult(tr)) {
                        return Object.assign(Object.assign({}, resource), {
                            mercuryReadable: () => __awaiter(this, void 0, void 0, function* () {
                                const Mercury = require('@postlight/mercury-parser');
                                return yield Mercury.parse(resource.uri, { html: Buffer.from(tr.contentText, 'utf8') });
                            })
                        });
                    }
                }
                return Object.assign(Object.assign({}, resource), {
                    mercuryReadable: () => __awaiter(this, void 0, void 0, function* () {
                        const Mercury = require('@postlight/mercury-parser');
                        return yield Mercury.parse(resource.uri);
                    })
                });
            });
        }
    }
    exports.EnrichMercuryReadableContent = EnrichMercuryReadableContent;
    EnrichMercuryReadableContent.singleton = new EnrichMercuryReadableContent();
    function isMozillaReadabilityContent(o) {
        return o && "mozillaReadability" in o;
    }
    exports.isMozillaReadabilityContent = isMozillaReadabilityContent;
    class EnrichMozillaReadabilityContent {
        flow(_, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                if (isFollowedResource(resource)) {
                    const tr = resource.terminalResult;
                    if (tru.isTerminalTextContentResult(tr)) {
                        return Object.assign(Object.assign({}, resource), {
                            mozillaReadability: () => {
                                const { Readability } = require('@mozilla/readability');
                                const { JSDOM } = require('jsdom');
                                const jd = new JSDOM(tr.contentText, { url: resource.uri });
                                const reader = new Readability(jd.window.document);
                                return reader.parse();
                            }
                        });
                    }
                }
                return Object.assign(Object.assign({}, resource), {
                    mozillaReadability: () => {
                        const { Readability } = require('@mozilla/readability');
                        const { JSDOM } = require('jsdom');
                        const jd = new JSDOM(``, {
                            url: resource.uri,
                            includeNodeLocations: true,
                        });
                        const reader = new Readability(jd.window.document);
                        return reader.parse();
                    }
                });
            });
        }
    }
    exports.EnrichMozillaReadabilityContent = EnrichMozillaReadabilityContent;
    EnrichMozillaReadabilityContent.singleton = new EnrichMozillaReadabilityContent();
    function isDownloadAttemptResult(o) {
        return o && "isDownloadAttemptResult" in o;
    }
    exports.isDownloadAttemptResult = isDownloadAttemptResult;
    function isDownloadSkipResult(o) {
        return o && "downloadSkippedReason" in o;
    }
    exports.isDownloadSkipResult = isDownloadSkipResult;
    function isDownloadErrorResult(o) {
        return o && "downloadError" in o;
    }
    exports.isDownloadErrorResult = isDownloadErrorResult;
    function isDownloadSuccessResult(o) {
        return o && "downloadDestPath" in o;
    }
    exports.isDownloadSuccessResult = isDownloadSuccessResult;
    function isDownloadFileResult(o) {
        return o && "downloadDestPath" in o && "downloadedFileType" in o;
    }
    exports.isDownloadFileResult = isDownloadFileResult;
    function isDownloadIdeterminateFileResult(o) {
        return o && "unknownFileType" in o && "downloadedFileType" in o;
    }
    exports.isDownloadIdeterminateFileResult = isDownloadIdeterminateFileResult;
    class TypicalDownloader {
        constructor({ destPath, createDestPath, determineFileType }) {
            this.destPath = destPath || path_1.default.join(os_1.default.tmpdir(), "uniform-resource-downloads");
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
            return fs.createWriteStream(path_1.default.join(this.destPath, uuid_1.v4()));
        }
        finalize(_, resource, writer) {
            return __awaiter(this, void 0, void 0, function* () {
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
                            cd = content_disposition_1.default.parse(cdHeader);
                        }
                    }
                    const fileType = yield file_type_1.default.fromFile(downloadDestPath);
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
            });
        }
    }
    exports.TypicalDownloader = TypicalDownloader;
    class DownloadContent {
        constructor(downloader) {
            this.downloader = downloader;
        }
        flow(_, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                if (isFollowedResource(resource)) {
                    if (tru.isTerminalResult(resource.terminalResult)) {
                        try {
                            const writer = this.downloader.writer(this, resource);
                            if (tru.isTerminalTextContentResult(resource.terminalResult)) {
                                writer.write(resource.terminalResult.contentText);
                            }
                            else {
                                yield streamPipeline(resource.terminalResult.httpResponse.body, writer);
                            }
                            const success = yield this.downloader.finalize(this, resource, writer);
                            return Object.assign(Object.assign({}, resource), success);
                        }
                        catch (e) {
                            return Object.assign(Object.assign({}, resource), { downloadError: e });
                        }
                    }
                }
                return Object.assign(Object.assign({}, resource), { isDownloadAttemptResult: true, downloadSkippedReason: `Unable to download, resource [${resource.label}](${resource.uri}) was not traversed` });
            });
        }
    }
    exports.DownloadContent = DownloadContent;
    DownloadContent.typicalDownloader = new TypicalDownloader({ createDestPath: true });
    DownloadContent.singleton = new DownloadContent(DownloadContent.typicalDownloader);
    class DownloadHttpContentTypes {
        constructor(wrapperDC, ...contentTypes) {
            this.wrapperDC = wrapperDC;
            this.contentTypes = contentTypes;
        }
        flow(ctx, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                if (isFollowedResource(resource)) {
                    const visitResult = resource.terminalResult;
                    if (tru.isTerminalResult(visitResult)) {
                        if (this.contentTypes.find(contentType => contentType == visitResult.contentType)) {
                            return this.wrapperDC.flow(ctx, resource);
                        }
                    }
                }
                return resource;
            });
        }
    }
    exports.DownloadHttpContentTypes = DownloadHttpContentTypes;
    DownloadHttpContentTypes.pdfsOnly = new DownloadHttpContentTypes(DownloadContent.singleton, "application/pdf");
    class EnrichGovernedContent {
        flow(_, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = resource;
                if (isFollowedResource(resource) && tru.isTerminalTextContentResult(resource.terminalResult)) {
                    const textResult = resource.terminalResult;
                    result = Object.assign(Object.assign({}, resource), { contentType: textResult.contentType, mimeType: textResult.mimeType });
                }
                return result;
            });
        }
    }
    exports.EnrichGovernedContent = EnrichGovernedContent;
    EnrichGovernedContent.singleton = new EnrichGovernedContent();
    function isFavIconSupplier(o) {
        return o && "favIconResource" in o;
    }
    exports.isFavIconSupplier = isFavIconSupplier;
    class FavIconResource {
        constructor(transformer) {
            this.transformer = transformer;
        }
        flow(_, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                const favIconURL = new URL(resource.uri);
                favIconURL.pathname = '/favicon.ico';
                const fir = yield acquireResource({
                    uri: favIconURL.href,
                    transformer: this.transformer,
                    provenance: { provenanceURN: resource.uri },
                });
                return Object.assign(Object.assign({}, resource), { favIconResource: fir });
            });
        }
    }
    exports.FavIconResource = FavIconResource;
    FavIconResource.followOnly = new FavIconResource(p.pipe(FollowRedirectsGranular.singleton));
    FavIconResource.followAndDownload = new FavIconResource(p.pipe(FollowRedirectsGranular.singleton, DownloadContent.singleton));
    function isCuratableContentResource(o) {
        return o && ("curatableContent" in o);
    }
    exports.isCuratableContentResource = isCuratableContentResource;
    class EnrichCuratableContent {
        constructor(contentTr) {
            this.contentTr = contentTr;
        }
        flow(_, resource) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = resource;
                if (isFollowedResource(resource) && tru.isTerminalTextContentResult(resource.terminalResult)) {
                    const textResult = resource.terminalResult;
                    const content = yield this.contentTr.flow({
                        uri: resource.uri,
                        htmlSource: textResult.contentText
                    }, {
                        contentType: textResult.contentType,
                        mimeType: textResult.mimeType
                    });
                    result = Object.assign(Object.assign({}, resource), { curatableContent: content, domainBrand: resource.URL.hostname.replace(/^www\./, "") });
                }
                return result;
            });
        }
    }
    exports.EnrichCuratableContent = EnrichCuratableContent;
    EnrichCuratableContent.singleton = new EnrichCuratableContent(p.pipe(qc.BuildCuratableContent.singleton, qc.StandardizeCurationTitle.singleton));
    function acquireResource({ uri, label, provenance, transformer }) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = {
                isUniformResource: true,
                provenance: provenance || { provenanceURN: "unknown" },
                uri: uri,
                label: label
            };
            return yield transformer.flow({}, result);
        });
    }
    exports.acquireResource = acquireResource;
});
//# sourceMappingURL=uniform-resource.js.map