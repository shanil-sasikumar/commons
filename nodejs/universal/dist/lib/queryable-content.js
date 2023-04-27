import cheerio from "cheerio";
export function isGovernedContent(o) {
    return o && ("contentType" in o) && ("mimeType" in o);
}
export class HtmlMeta {
}
export function isCuratableContent(o) {
    return o && "title" in o && "socialGraph" in o;
}
export function isQueryableHtmlContent(o) {
    return o && "htmlSource" in o && "document" in o;
}
export function isTransformedContent(o) {
    return o && "transformedFromContent" in o;
}
/************************
 * Content transformers *
 ************************/
export function nextTransformationPipePosition(o) {
    return "pipePosition" in o ? o.pipePosition + 1 : 0;
}
const pageIconSelectors = [
    ["defaultIcon", "link[rel='icon']"],
    ["shortcutIcon", "link[rel='shortcut icon']"],
    ["appleTouchIcon", "link[rel='apple-touch-icon']"],
    ["appleTouchIconPrecomposed", "link[rel='apple-touch-icon-precomposed']"],
    ["appleTouchStartupImage", "link[rel='apple-touch-startup-image']"],
    ["maskIcon", "link[rel='mask-icon']"],
    ["fluidIcon", "link[rel='fluid-icon']"],
];
class ConsumeHtmlMeta {
    static nameAndPropertyOnly = new ConsumeHtmlMeta();
    async flow(ctx, meta) {
        ctx.document("meta").each((_, metaElem) => {
            const name = metaElem.attribs["name"];
            const property = metaElem.attribs["property"];
            if (name || property) {
                meta[name || property] = metaElem.attribs["content"];
            }
        });
        return meta;
    }
}
export { ConsumeHtmlMeta };
class EnrichQueryableHtmlContent {
    static singleton = new EnrichQueryableHtmlContent();
    typedAttribute(elem, name) {
        const value = elem.attribs[name];
        const int = parseInt(value);
        const float = parseFloat(value);
        return isNaN(float) ? (isNaN(int) ? value : int) : float;
    }
    anchors(document, retain) {
        const result = [];
        document("a").each((_, anchorTag) => {
            const href = anchorTag.attribs["href"];
            if (href) {
                const anchor = {
                    href: href,
                    label: document(anchorTag).text()
                };
                if (retain) {
                    if (retain(anchor))
                        result.push(anchor);
                }
                else {
                    result.push(anchor);
                }
            }
        });
        return result;
    }
    images(document, retain) {
        const result = [];
        document("img").each((_, imgElem) => {
            const image = {
                src: imgElem.attribs["src"],
                alt: imgElem.attribs["alt"],
                width: this.typedAttribute(imgElem, "width"),
                height: this.typedAttribute(imgElem, "height"),
                imageElem: imgElem
            };
            if (retain) {
                if (retain(image))
                    result.push(image);
            }
            else {
                result.push(image);
            }
        });
        return result;
    }
    untypedSchemas(ctx, document, unwrapGraph, retain, eh) {
        const result = [];
        document('script[type="application/ld+json"]').each((index, scriptElem) => {
            const script = scriptElem.children[0].data;
            if (script) {
                try {
                    const ldJSON = JSON.parse(script);
                    if (ldJSON["@graph"]) {
                        if (unwrapGraph) {
                            for (const node of ldJSON["@graph"]) {
                                if (retain) {
                                    if (retain(node))
                                        result.push(node);
                                }
                                else {
                                    result.push(node);
                                }
                            }
                            return;
                        }
                    }
                    if (retain) {
                        if (retain(ldJSON))
                            result.push(ldJSON);
                    }
                    else {
                        result.push(ldJSON);
                    }
                }
                catch (err) {
                    if (eh)
                        eh(ctx, index, scriptElem, err);
                }
            }
        });
        return result;
    }
    pageIcons(document) {
        const result = [];
        pageIconSelectors.forEach((selector) => {
            document(selector[1]).each((_, linkElem) => {
                const { href, sizes, type } = linkElem.attribs;
                if (href && href !== '#') {
                    const icon = {
                        name: selector[0],
                        sizes,
                        href,
                        type,
                    };
                    result.push(icon);
                }
            });
        });
        return result;
    }
    meta(document, consumer = ConsumeHtmlMeta.nameAndPropertyOnly) {
        return consumer.flow({ document: document }, {});
    }
    async flow(ctx, content) {
        if (isQueryableHtmlContent(content)) {
            // it's already queryable so don't touch it
            return content;
        }
        // enrich the existing content with cheerio static document
        const document = cheerio.load(ctx.htmlSource, {
            normalizeWhitespace: true,
            decodeEntities: true,
            lowerCaseTags: true,
            lowerCaseAttributeNames: true,
        });
        const self = this;
        return {
            ...content,
            htmlSource: ctx.htmlSource,
            document: document,
            anchors: (retain) => {
                return self.anchors(document, retain);
            },
            images: (retain) => {
                return self.images(document, retain);
            },
            untypedSchemas: (unwrapGraph, retain, eh) => {
                return self.untypedSchemas(ctx, document, unwrapGraph, retain, eh);
            },
            pageIcons: () => {
                return self.pageIcons(document);
            },
            meta: (consumer) => {
                return this.meta(document, consumer);
            }
        };
    }
}
export { EnrichQueryableHtmlContent };
class BuildCuratableContent {
    static singleton = new BuildCuratableContent();
    parseOpenGraph(_, document) {
        let result = {};
        const metaTransformers = {
            'og:type': (v) => { result.type = v; },
            'og:title': (v) => { result.title = v; },
            'og:description': (v) => { result.description = v; },
            'og:image': (v) => { result.imageURL = v; },
            'og:keywords': (v) => { result.keywords = v.split(",").map(kw => kw.trim()); },
        };
        const meta = document('meta');
        const keys = Object.keys(meta);
        for (const outerKey in metaTransformers) {
            keys.forEach(function (innerKey) {
                if (meta[innerKey].attribs
                    && meta[innerKey].attribs.property
                    && meta[innerKey].attribs.property === outerKey) {
                    metaTransformers[outerKey](meta[innerKey].attribs.content);
                }
            });
        }
        return result;
    }
    parseTwitterCard(_, document) {
        let result = {};
        const metaTransformers = {
            'twitter:title': (v) => { result.title = v; },
            'twitter:image': (v) => { result.imageURL = v; },
            'twitter:description': (v) => { result.description = v; },
            'twitter:site': (v) => { result.site = v; },
            'twitter:creator': (v) => { result.creator = v; },
        };
        const meta = document('meta');
        const keys = Object.keys(meta);
        for (const outerKey in metaTransformers) {
            keys.forEach(function (innerKey) {
                if (meta[innerKey].attribs
                    && meta[innerKey].attribs.name
                    && meta[innerKey].attribs.name === outerKey) {
                    metaTransformers[outerKey](meta[innerKey].attribs.content);
                }
            });
        }
        return result;
    }
    parseSocialGraph(ctx, document) {
        const og = this.parseOpenGraph(ctx, document);
        const tc = this.parseTwitterCard(ctx, document);
        const result = {};
        if (Object.keys(og).length > 0)
            result.openGraph = og;
        if (Object.keys(tc).length > 0)
            result.twitter = tc;
        return result;
    }
    title(ctx, document, sg) {
        // If an og:title is available, use it otherwise use twitter:title otherwise use page title
        const socialGraph = sg ? sg : this.parseSocialGraph(ctx, document);
        let result = document('head > title').text();
        if (socialGraph.twitter?.title)
            result = socialGraph.twitter.title;
        if (socialGraph.openGraph?.title)
            result = socialGraph.openGraph.title;
        return result;
    }
    async flow(ctx, content) {
        let result = content;
        if (!isQueryableHtmlContent(result)) {
            // first make it queryable
            result = await EnrichQueryableHtmlContent.singleton.flow(ctx, result);
        }
        if (isQueryableHtmlContent(result)) {
            const socialGraph = this.parseSocialGraph(ctx, result.document);
            return {
                ...result,
                title: this.title(ctx, result.document, socialGraph),
                socialGraph: socialGraph
            };
        }
        else {
            console.error("[EnrichCuratableContent.transform()] This should never happen!");
            return content;
        }
    }
}
export { BuildCuratableContent };
class StandardizeCurationTitle {
    // RegEx matches " | Healthcare IT News" from a title like "xyz title | Healthcare IT News"
    static sourceNameAfterPipeRegEx = / \| .*$/;
    static singleton = new StandardizeCurationTitle();
    async flow(_, content) {
        if (isCuratableContent(content)) {
            const suggested = content.title;
            const standardized = suggested.replace(StandardizeCurationTitle.sourceNameAfterPipeRegEx, "");
            if (suggested != standardized) {
                return {
                    ...content,
                    title: standardized,
                    transformedFromContent: content,
                    pipePosition: nextTransformationPipePosition(content),
                    remarks: `Standardized title (was "${suggested}")`
                };
            }
        }
        return content;
    }
}
export { StandardizeCurationTitle };
