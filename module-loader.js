const { LocalDatabaseLite } =require('local-database-lite')
const { resolve } =require("path");
const { createLog, createDebug } =require('advance-log');
const { wildcard, getList, findMax } = require('ultility-tools');

/// default /////
const _DB_FILE="startup"
const _DB_FILE_EXT="json"
const _DB_MODULE_TBL="modules"
const _DB_STARTUP_TBL="startups"

/** function */
const log=createLog("module","center");
const debug=createDebug("module",1)
/** module path */
const _MODULE_PATH_DEFAULT="modules"
class ModuleLoader{
    /** @type {import('./interface').ModulePackage[]} */
    _modules=[];

    /** @type {import('./interface').StartUpData[]} */
    _startUps=[];
    /** @type {string[]} */
    _files=[];
    _modulePaths=[]

    /**
     * 
     * @param  {...string} files
     */
    constructor(...files){
        const length=files.length;
        if(!length) files=[_DB_FILE]; // default
        let file=files[length-1];
        if(file.toLowerCase().startsWith("."+_DB_FILE_EXT)) files[length-1]=file+"."+_DB_FILE_EXT
        this._files=files;
    }

    /**
     * get infor from Db (modules, startup-list)
     * @returns {Promise<void>}
     */
    _init(){
        const db=new LocalDatabaseLite(...this._files)
        return Promise.all([
            db.connect(_DB_MODULE_TBL).search(),
            db.connect(_DB_STARTUP_TBL).search()
        ])
        .then(([modules,startups])=>{
            this._modules=modules;
            this._startUps=startups;
            return;
        })
    }


    /** startup module loader */
    startup(...modulePaths) {
        this._modulePaths=modulePaths.length?modulePaths:[_MODULE_PATH_DEFAULT];
        return this._init()
            .then(() => {
                const startupModules = [];
                this._startUps.forEach(startInf => {
                    const module = this._modules.find(x => x.id == startInf.id);
                    if (!module) return log("cannot find module '%s'", startInf.id);
                    startupModules.push(module)
                })

                const list = [];
                let module
                while (1) {
                    module = this._next(startupModules, list);
                    if (!module) break
                    try {
                        this.load(module, list);
                    }
                    catch (err) {
                        if (err instanceof Error) {
                            log("load '%s' ERROR '%s'\n", module.id, err.message,err);
                        }
                        else {
                            log(err);
                        }
                    }
                }
                return this._modules;
            })
    }

    /**
     * 
     * @param {import('./interface').ModulePackage} module 
     * @param {string[]} list 
     * @returns 
     */
    load(module,list){
        if(list.includes(module.id)) return module; // already load => return 
        list.push(module.id);

        /** handle imports */
        const ips=[];       // input
        const that=this;
        Object.keys(module.imports||{}).forEach(key=>{
            const _tmp=module.imports[key];
            const ipInfor=correctImport(_tmp);
            let subModules=this._modules.filter(m=>(m.level<module.level) && wildcard(m.keys,ipInfor.ref));
            if(!subModules.length) throw new Error(`#001: cannot find module '${key}', ref:'${ipInfor.ref}`);
            //find max level
            subModules=getList(subModules,"keys").map(keys=>{
                const mds=subModules.filter(m=>m.keys===keys);
                const max= findMax(mds,"level");
                return max;
            })
            // sort
            if(ipInfor.type==='mutil') {
                const _result=subModules.map(m=>that.load(m,list).service)
                ips.push(_result)
                return
            }

            if(ipInfor.type==='single'){
                const _md=findMax(subModules,"level");
                const _result=that.load(_md,list).service;
                ips.push(_result);
                return;
            }

        })
        //result
        getService(module,{mPaths:this._modulePaths,ips});
        log("loaded %s (%s)",module.id,module.name)
        return module;
    }

    _next(modules,list){
        let out;
        modules.some(module=>{
            if(!list.includes(module.id)){
                out=module;
                return true;
            }
        })
        return out
    }
}


function correctImport(importInf){
    return typeof importInf==='string'?{ref:importInf,type:'single'}:importInf
}

/**
 * 
 * @param {import('./interface').ModulePackage} module 
 * @param {import('./interface').GetServiceOptions} opts 
 * @returns {Function|object|undefined}
 */
function getService(module,opts){
    opts=Object.assign({},{mPaths:['src','modules'],ips:[]},opts)
    if(module.type==='module'){
        const path=resolve(...opts.mPaths,module.path)
        const fn=require(path).default
        if(!fn ||typeof fn!=='function') {
            throw new Error("#002: service is not available");
        }
        module.service=fn(module,...opts.ips);
        return module;
    }
    /** npm */
    if(module.type==='npm'){
        const path=resolve("node_modules",module.id)
        module.service=require(path);
        return module;
    }
    throw new Error("#003: not type of module");
}



module.exports={ModuleLoader}