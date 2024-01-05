
const {join}=require('path');
const {readFileSync} =require('fs');
const { createLog } = require('advance-log');

const _PACKAGE="package.json"

/**
 * The function `getModuleInfor` takes a directory as input and returns information about a module
 * located in that directory.
 * @param {string} dir - The `dir` parameter is a string that represents the directory path where the module is
 * located.
 * @returns an object with the following properties:
 * - path: the joined directory and the main property from the parsed JSON object
 * - id: the name property from the parsed JSON object
 * - name: the description property from the parsed JSON object, or the name property if description is
 * not available
 * - params: the params property from the parsed JSON object, or an empty object if params is
 */
function getModuleInfor(dir){
    const log=createLog("getInfor","center")
    const _path=join(dir,_PACKAGE);
    try{
        const str=readFileSync(_path,{encoding:'utf8'})
        const obj=JSON.parse(str);
        const _arrs=dir.split("\\");
        const id=_arrs[_arrs.length-1];
        const path=(obj.main+"").toLowerCase()==='index.js'?id:join(id,obj.main)
        /** @type {import('./interface').ModulePackage} */
        const infor={
            id,
            path,
            name:obj.name ,
            params:obj.params||{},
            imports:obj.imports||{},
            keys:obj.keys||"",
            level:obj.level||0,
            service:null,
            type:'module'
        }
        // debug(1,"\n#001: inf",{infor})
        return infor;
    }
    catch(err){
        const msg=err instanceof Error?err.message:"other error"
        log("\n### ERROR[1]: failred! #%s",msg);
        return null;
    }
}

module.exports={getModuleInfor}