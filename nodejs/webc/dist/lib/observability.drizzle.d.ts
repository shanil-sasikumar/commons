import { InferModel } from 'drizzle-orm/sqlite-core';
export declare const supplierTBA: {
    tableName: "build_supplier";
    primaryKeyColName: "build_supplier_id";
    primaryKey: () => any;
    primaryKeyFK: (column: AnySQLiteColumn) => any;
    atTimestamp: (name: string) => any;
    indexName: (...columns: AnySQLiteColumn[]) => string;
    uniqueIndexName: (...columns: AnySQLiteColumn[]) => string;
    lintTable: (table: AnySQLiteTable, helpers: {
        encounterIssue: (...i: {
            issue: string;
        }[]) => void;
        snakeToCamelCase: (text: string) => string;
        ignore?: {
            primaryKeyNameConsistency?: ((column: AnySQLiteColumn) => boolean) | undefined;
            propNameConsistency?: ((column: AnySQLiteColumn) => boolean) | undefined;
        } | undefined;
    }) => void;
};
export declare const hostTBA: {
    tableName: "build_host";
    primaryKeyColName: "build_host_id";
    primaryKey: () => any;
    primaryKeyFK: (column: AnySQLiteColumn) => any;
    atTimestamp: (name: string) => any;
    indexName: (...columns: AnySQLiteColumn[]) => string;
    uniqueIndexName: (...columns: AnySQLiteColumn[]) => string;
    lintTable: (table: AnySQLiteTable, helpers: {
        encounterIssue: (...i: {
            issue: string;
        }[]) => void;
        snakeToCamelCase: (text: string) => string;
        ignore?: {
            primaryKeyNameConsistency?: ((column: AnySQLiteColumn) => boolean) | undefined;
            propNameConsistency?: ((column: AnySQLiteColumn) => boolean) | undefined;
        } | undefined;
    }) => void;
};
export declare const buildEventTBA: {
    tableName: "build_event";
    primaryKeyColName: "build_event_id";
    primaryKey: () => any;
    primaryKeyFK: (column: AnySQLiteColumn) => any;
    atTimestamp: (name: string) => any;
    indexName: (...columns: AnySQLiteColumn[]) => string;
    uniqueIndexName: (...columns: AnySQLiteColumn[]) => string;
    lintTable: (table: AnySQLiteTable, helpers: {
        encounterIssue: (...i: {
            issue: string;
        }[]) => void;
        snakeToCamelCase: (text: string) => string;
        ignore?: {
            primaryKeyNameConsistency?: ((column: AnySQLiteColumn) => boolean) | undefined;
            propNameConsistency?: ((column: AnySQLiteColumn) => boolean) | undefined;
        } | undefined;
    }) => void;
};
export declare const supplier: any;
export type Supplier = InferModel<typeof supplier>;
export type SupplierInsertable = InferModel<typeof supplier, 'insert'>;
export declare const host: any;
export type Host = InferModel<typeof host>;
export type HostInsertable = InferModel<typeof host, 'insert'>;
export declare const buildEvent: any;
export type BuildEvent = InferModel<typeof buildEvent>;
export type BuildEventInsertable = InferModel<typeof buildEvent, 'insert'>;
export declare const schema: {
    tables: {
        supplier: any;
        host: any;
        buildEvent: any;
    };
    lint: (encounterIssue: (...i: {
        issue: string;
    }[]) => void) => void;
};
