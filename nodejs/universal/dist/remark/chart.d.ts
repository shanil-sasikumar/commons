import { z } from 'zod';
export declare const chartJsSchema: any;
export type ChartJsPluginConfig = z.infer<typeof chartJsSchema>;
export interface ChartJsPluginState {
    index: number;
}
export interface ChartJsVfileDataShape {
    chartJsPluginState?: ChartJsPluginState;
}
export declare const apacheEChartsPluginSchema: any;
export type ApacheEChartsPluginConfig = z.infer<typeof apacheEChartsPluginSchema>;
export interface ApacheEChartsPluginState {
    index: number;
}
export interface ApacheEChartsVfileDataShape {
    apacheEChartsPluginState?: ApacheEChartsPluginState;
}
export declare function remarkPlugin(): (tree: any, vfile: VFile, next?: ((...args: unknown[]) => unknown) | undefined) => any;
