import * as qc from "./queryable-content.js";
import * as tru from "./traverse-urls.js";
import * as p from "./ts-pipe.js";
import contentDisposition from "content-disposition";
import ft from "file-type";
import * as fs from 'fs';
import { Writable } from 'stream';
import url from "url";
/*******************************
 * Uniform resource governance *
 *******************************/
export type UniformResourceIdentifier = string;
export type UniformResourceLabel = string;
export type UniformResourceName = string;
export type DigitalObjectIdentifier = string;
export interface UniformResourceProvenance {
    readonly provenanceURN: UniformResourceName;
}
export interface UniformResource {
    readonly isUniformResource: true;
    readonly provenance: UniformResourceProvenance;
    readonly uri: UniformResourceIdentifier;
    readonly doi?: DigitalObjectIdentifier;
    readonly label?: UniformResourceLabel;
}
export declare function isUniformResource(o: any): o is UniformResource;
export interface InvalidResource extends UniformResource {
    readonly isInvalidResource: true;
    readonly error: Error;
    readonly remarks?: string;
}
export declare function isInvalidResource(o: any): o is InvalidResource;
export interface ResourceTransformerContext {
    readonly fetchTimeOut?: number;
}
export interface TransformedResource extends UniformResource {
    readonly transformedFromUR: UniformResource;
    readonly pipePosition: number;
    readonly remarks?: string;
}
export declare function isTransformedResource(o: any): o is TransformedResource;
export declare function nextTransformationPipePosition(o: any): number;
export declare function allTransformationRemarks(tr: TransformedResource): string[];
export interface UniformResourceTransformer extends p.PipeUnion<ResourceTransformerContext, UniformResource> {
}
export declare class RemoveLabelLineBreaksAndTrimSpaces implements UniformResourceTransformer {
    static readonly singleton: RemoveLabelLineBreaksAndTrimSpaces;
    flow(_: ResourceTransformerContext, resource: UniformResource): Promise<UniformResource | TransformedResource>;
}
export declare class RemoveTrackingCodesFromUrl implements UniformResourceTransformer {
    static readonly singleton: RemoveTrackingCodesFromUrl;
    flow(_: ResourceTransformerContext, resource: UniformResource): Promise<UniformResource | TransformedResource>;
}
export interface FollowedResource extends UniformResource {
    readonly isFollowedResource: true;
    readonly URL: url.URL;
    readonly terminalResult: tru.VisitResult;
}
export declare function isFollowedResource(o: any): o is FollowedResource;
export interface RedirectedResource extends FollowedResource, TransformedResource {
    readonly isRedirectedResource: true;
    readonly followResults: tru.VisitResult[];
}
export declare function isRedirectedResource(o: any): o is RedirectedResource;
export declare class FollowRedirectsGranular implements UniformResourceTransformer {
    readonly fetchTimeOut?: number | undefined;
    static readonly singleton: FollowRedirectsGranular;
    constructor(fetchTimeOut?: number | undefined);
    flow(ctx: ResourceTransformerContext, resource: UniformResource): Promise<UniformResource | InvalidResource | FollowedResource | RedirectedResource>;
}
export interface ReadableContentAsyncSupplier {
    (): Promise<{
        [key: string]: any;
    }>;
}
export interface MercuryReadableContent extends UniformResource {
    readonly mercuryReadable: ReadableContentAsyncSupplier;
}
export declare function isMercuryReadableContent(o: any): o is MercuryReadableContent;
export declare class EnrichMercuryReadableContent implements UniformResourceTransformer {
    static readonly singleton: EnrichMercuryReadableContent;
    flow(_: ResourceTransformerContext, resource: UniformResource): Promise<MercuryReadableContent>;
}
export interface ReadableContentSupplier {
    (): {
        [key: string]: any;
    };
}
export interface MozillaReadabilityContent extends UniformResource {
    readonly mozillaReadability: ReadableContentSupplier;
}
export declare function isMozillaReadabilityContent(o: any): o is MozillaReadabilityContent;
export declare class EnrichMozillaReadabilityContent implements UniformResourceTransformer {
    static readonly singleton: EnrichMozillaReadabilityContent;
    flow(_: ResourceTransformerContext, resource: UniformResource): Promise<MozillaReadabilityContent>;
}
export interface DownloadAttemptResult {
    readonly isDownloadAttemptResult: true;
    readonly sizeExpected: number;
}
export declare function isDownloadAttemptResult(o: any): o is DownloadAttemptResult;
export interface DownloadSkipResult extends DownloadAttemptResult {
    readonly downloadSkippedReason: string;
}
export declare function isDownloadSkipResult(o: any): o is DownloadSkipResult;
export interface DownloadErrorResult extends DownloadAttemptResult {
    readonly sizeDownloaded: number;
    readonly downloadError: Error;
}
export declare function isDownloadErrorResult(o: any): o is DownloadErrorResult;
export interface DownloadSuccessResult extends DownloadAttemptResult {
    readonly downloadDestPath: string;
    readonly contentDisposition?: contentDisposition.ContentDisposition;
    readonly downloadedFileStats: fs.Stats;
}
export declare function isDownloadSuccessResult(o: any): o is DownloadSuccessResult;
export interface DownloadFileResult extends DownloadSuccessResult {
    readonly downloadedFileType: ft.FileTypeResult;
}
export declare function isDownloadFileResult(o: any): o is DownloadFileResult;
export interface DownloadIndeterminateFileResult extends DownloadSuccessResult {
    readonly unknownFileType: string;
    readonly downloadedFileStats: fs.Stats;
}
export declare function isDownloadIdeterminateFileResult(o: any): o is DownloadIndeterminateFileResult;
export interface Downloader {
    writer(dc: DownloadContent, resource: FollowedResource): Writable;
    finalize(dc: DownloadContent, resource: FollowedResource, writer: Writable): Promise<DownloadSuccessResult>;
}
export interface TypicalDownloaderOptions {
    readonly destPath?: string;
    readonly createDestPath?: boolean;
    readonly determineFileType?: boolean;
}
export declare class TypicalDownloader implements Downloader, TypicalDownloaderOptions {
    readonly destPath: string;
    readonly determineFileType: boolean;
    constructor({ destPath, createDestPath, determineFileType }: TypicalDownloaderOptions);
    writer(): Writable;
    finalize(_: DownloadContent, resource: FollowedResource, writer: Writable): Promise<DownloadSuccessResult | DownloadFileResult | DownloadIndeterminateFileResult>;
}
export declare class DownloadContent implements UniformResourceTransformer {
    readonly downloader: Downloader;
    static readonly typicalDownloader: TypicalDownloader;
    static readonly singleton: DownloadContent;
    constructor(downloader: Downloader);
    flow(_: ResourceTransformerContext, resource: UniformResource): Promise<UniformResource | (UniformResource & (DownloadSkipResult | DownloadErrorResult | DownloadSuccessResult))>;
}
export declare class DownloadHttpContentTypes implements UniformResourceTransformer {
    readonly wrapperDC: DownloadContent;
    static readonly pdfsOnly: DownloadHttpContentTypes;
    readonly contentTypes: string[];
    constructor(wrapperDC: DownloadContent, ...contentTypes: string[]);
    flow(ctx: ResourceTransformerContext, resource: UniformResource): Promise<UniformResource | (UniformResource & (DownloadSkipResult | DownloadErrorResult | DownloadSuccessResult))>;
}
export declare class EnrichGovernedContent implements UniformResourceTransformer {
    static readonly singleton: EnrichGovernedContent;
    flow(_: ResourceTransformerContext, resource: UniformResource): Promise<UniformResource | (UniformResource & qc.GovernedContent)>;
}
export interface FavIconSupplier {
    readonly favIconResource: UniformResource;
}
export declare function isFavIconSupplier(o: any): o is FavIconSupplier;
export declare class FavIconResource implements UniformResourceTransformer {
    readonly transformer: UniformResourceTransformer;
    static readonly followOnly: FavIconResource;
    static readonly followAndDownload: FavIconResource;
    constructor(transformer: UniformResourceTransformer);
    flow(_: ResourceTransformerContext, resource: UniformResource): Promise<UniformResource | (UniformResource & FavIconSupplier)>;
}
export interface CuratableContentResource extends UniformResource {
    readonly curatableContent: qc.CuratableContent;
    readonly domainBrand: string;
}
export declare function isCuratableContentResource(o: any): o is CuratableContentResource;
export declare class EnrichCuratableContent implements UniformResourceTransformer {
    readonly contentTr: qc.ContentTransformer;
    static readonly singleton: EnrichCuratableContent;
    constructor(contentTr: qc.ContentTransformer);
    flow(_: ResourceTransformerContext, resource: UniformResource): Promise<UniformResource | CuratableContentResource>;
}
export interface AcquireResourceOptions {
    uri: UniformResourceIdentifier;
    label?: UniformResourceLabel;
    transformer: UniformResourceTransformer;
    provenance?: UniformResourceProvenance;
}
export declare function acquireResource({ uri, label, provenance, transformer }: AcquireResourceOptions): Promise<UniformResource>;
