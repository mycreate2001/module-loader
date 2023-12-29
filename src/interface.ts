export interface ModulePackage{
    id:string;
    name:string;
    keys:string;
    level:number;
    path:string;
    params:object;
    imports:ImportData;
    /** output/service */
    service:Function|number
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

/////////// GENERAL ////////////////
export interface DbType<T>{
    [id:string]:T
}