/**
 * 
 * @param {object|object[]} objs 
 * @param {string} key 
 * @returns {string[]}
 */
function getList(objs,key){
    const arrs=toArray(objs);
    const outs=[];
    arrs.forEach(arr=>{
        if(!arr) return;
        let val=arr[key];
        if(val===undefined) return;
        val=val+""
        if(!outs.includes(val)) outs.push(val)
    })
    return outs;
}

/**
 * @template T
 * @param {T|T[]} objs 
 * @returns {T[]}
 */
function toArray(objs){
    return Array.isArray(objs)?objs:[objs]
}

/**
 * @template T
 * @param {T|T[]} objs 
 * @param {string} key
 * @returns {T} 
 */
function findMax(objs,key){
    const _objs=toArray(objs);
    let pos=0;
    let max=_objs[0];
    _objs.forEach((obj,i)=>{
        if(!obj[key]) return;
        const val=obj[key];
        if(val>max){
            pos=i;
            max=val;
        }
    })
    return _objs[pos]
}

module.exports={getList,toArray,findMax}