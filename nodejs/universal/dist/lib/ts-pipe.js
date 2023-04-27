export function pipe(...elements) {
    if (elements.length == 0) {
        return new class {
            async flow(_, content) {
                return content;
            }
        }();
    }
    if (elements.length == 1) {
        return new class {
            async flow(ctx, content) {
                return await elements[0].flow(ctx, content);
            }
        }();
    }
    return new class {
        async flow(ctx, content) {
            let result = await elements[0].flow(ctx, content);
            for (let i = 1; i < elements.length; i++) {
                result = await elements[i].flow(ctx, result);
            }
            return result;
        }
    }();
}
export function pipeSync(...elements) {
    if (elements.length == 0) {
        return new class {
            flow(_, content) {
                return content;
            }
        }();
    }
    if (elements.length == 1) {
        return new class {
            flow(ctx, content) {
                return elements[0].flow(ctx, content);
            }
        }();
    }
    return new class {
        flow(ctx, content) {
            let result = elements[0].flow(ctx, content);
            for (let i = 1; i < elements.length; i++) {
                result = elements[i].flow(ctx, result);
            }
            return result;
        }
    }();
}
