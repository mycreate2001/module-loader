export type ModulePackage=ModulePackageModule|ModulePackageNpm

export interface ModulePackageModule extends ModulePackageCommon{
    path:string;
    imports:ImportData;
    type:'module'
}

export interface ModulePackageNpm extends ModulePackageCommon{
    type:'npm'
}

export interface ModulePackageCommon{
    id:string;
    name?:string;
    keys:string;
    service:any;
    params:any;
}

/** startup */
export interface StartUpData{
    id:string;
    order:number
}

/** Import data */
export type ImportData=DbType<ImportDataExt>
export type ImportDataExt=ImportDataStd|string
export interface ImportDataStd{
    ref:string;
    type:'single'|'mutil'
}

export interface GetServiceOpts{
    mPaths:string[];
    ips:any[];
}

export type GetServiceOptions=Partial<GetServiceOpts>

/////////// GENERAL ////////////////
export interface DbType<T>{
    [id:string]:T
}