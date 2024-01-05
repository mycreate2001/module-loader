import { ModulePackage } from "./interface";

const _PACKAGE="package.json"
export declare function getModuleInfor(dir:string):ModulePackage|null;

// interface
export interface GetServiceOpts{
    mPaths:string[];
    ips:any[];
}

export type GetServiceOptions=Partial<GetServiceOpts>

/////////// GENERAL ////////////////
export interface DbType<T>{
    [id:string]:T
}