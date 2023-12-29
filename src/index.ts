import { log } from "console";
import { ImportDataExt, ImportDataStd, ModulePackage, StartUpData } from "./interface";
import { LocalDatabaseLite } from 'local-database-lite'
import { wildcard } from 'mini-tools'
import { resolve } from "path";

/// default /////
const _DB_FILE="startup"
const _DB_FILE_EXT="json"
const _DB_MODULE_TBL="modules"
const _DB_STARTUP_TBL="startups"

/** module path */
const _MODULE_PATH_DEFAULT="modules"
export class ModuleLoader{
    private _isLoaded:boolean=false;
    private _modules:ModulePackage[]=[];
    private _startUps:StartUpData[]=[];
    private _files:string[]=[];
    constructor(private mPath:string,...files:string[]){
        if(!mPath) this.mPath=_MODULE_PATH_DEFAULT
        const length=files.length;
        if(!length) files=[_DB_FILE]; // default
        let file=files[length-1];
        if(file.toLowerCase().startsWith("."+_DB_FILE_EXT)) files[length-1]=file+"."+_DB_FILE_EXT
        this._files=files;
    }
    private _init(){
        const db=new LocalDatabaseLite(...this._files)
        return Promise.all([
            db.connect(_DB_MODULE_TBL).search() as Promise<ModulePackage[]>,
            db.connect(_DB_STARTUP_TBL).search() as Promise<StartUpData[]>
        ])
        .then(([modules,startups])=>{
            this._modules=modules;
            this._startUps=startups;
            return;
        })
    }

    startup(){
        this._init()
        .then(()=>this._start())
    }

    private _start(){
        const startupModules:ModulePackage[]=[]
        this._startUps.forEach(startInf=>{
            const module=this._modules.find(x=>x.id==startInf.id);
            if(!module) return log("cannot find module '%s'",startInf.id);
            startupModules.push(module)
        })

        const list:string[]=[]

        return startupModules.map(module=>{
            try{
                this.load(module,list)
            }
            catch(err){
                const msg:string=err instanceof Error?err.message:"other"
                log("load '%s' ERROR ",module.id,msg);
                console.log("\n___ detail _____\n",err);
            }
        })
    }

    load(module:ModulePackage,list:string[]):ModulePackage{
        if(list.includes(module.id)) return module; // already load => return 
        const ips:any[]=[];       // input
        const that=this;
        Object.keys(module.imports).forEach(key=>{
            const _tmp:ImportDataExt=module.imports[key];
            const ipInfor:ImportDataStd=correctImport(_tmp);
            const subModules:ModulePackage[]=this._modules.filter(m=>m.level<module.level && wildcard(m.keys,ipInfor.ref));
            if(!subModules.length) throw new Error(`cannot find module '${key}', ref:'${ipInfor.ref}'`);
            // sort
            if(ipInfor.type==='mutil') {
                const _result=subModules.map(m=>that.load(m,list).service);
                ips.push(_result)
                return
            }

            if(ipInfor.type==='single'){
                const _md=getMax(subModules,"level");
                const _result=that.load(_md,list).service;
                ips.push(_result);
                return;
            }

        })

        const fn=require(resolve(this.mPath,module.path)).default;
        if(!fn ||typeof fn!=='function') throw new Error("load module error, check path ");
        module.service=fn(module,...ips)
        return module;
    }
}


function correctImport(importInf:ImportDataExt):ImportDataStd{
    return typeof importInf==='string'?{ref:importInf,type:'single'}:importInf
}
function getMax<T>(arrs:T[],key:string):T{
    let mArr:T=arrs[0];
    let max=(mArr as any)[key]
    arrs.forEach(arr=>{
        const val=(arr as any)[key];
        if(val>max) {
            mArr=arr;
            max=val;
        }
    })
    return mArr;
}