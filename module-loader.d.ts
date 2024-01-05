import { ModulePackage } from "./interface";

export declare class ModuleLoader {
    private _modules;
    private _startUps;
    private _files;
    private _modulePaths;
    constructor(...files: string[]);
    private _init;
    startup(...modulePaths: string[]): void;
    private _start;
    load(module: ModulePackage, list: string[]): Promise<ModulePackage>;
    private _next;
}