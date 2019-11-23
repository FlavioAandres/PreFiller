
const _ = require('lodash')
const resolve = (path, value, split = '.') => {
    return path.split(split).reduce((prev, current, idx, originalArray) => {
        if (prev.value && prev.value[current]) {
            prev.value = prev.value[current]
            prev.key = current
            return prev
        } else {
            return null
        }
        // return prev ? prev[current] : null
    }, { value, key: '' })
}
Object.prototype.resolvePath = resolve

let _store = []

//expect 
//params: 
// ['route.to.path', 'route.to.path']
// object 
let object1 = [{
    license: {
        number: 199999999,
        state: "FL",
        profession: "ARNP"
    },
    partials: [{
        number: 199999999,
        state: "FL",
        hours: 20
    }]
}, {
    license: {
        number: 199999999,
        state: "GO",
        profession: "RN"
    },
    partials: [{
        number: 199999999,
        state: "FL",
        hours: 20
    }]
}, {
    license: {
        number: 199999999,
        state: "GO",
        profession: "RN"
    },
    partials: [{
        number: 199999999,
        state: "FL",
        hours: 20
    }]
}]


const getUniqueQuerys = (querys) => {
    // console.log(querys)
    return _.uniqBy(querys, (query) => {
        let strings = query.map(function (query) {
            return `${query.key}#${query.value}`
        })
        return strings.join('#')
    });
}

const getKeyValues = (object, nameField, identifiers = {}) => {
    let array = object[nameField]
    return array.reduce((obj, current) => {
        obj[current.key] = current.value
        return obj
    }, { ...identifiers });
}

const assignQuery = (object = [], params = []) => {
    let queryObjects = {}
    for (const currentQuery of params) {
        let paths = currentQuery.paths
        let nameField = currentQuery.newKey
        object[nameField] = paths.map(path => {
            return Object.resolvePath(path, object)
        })

        queryObjects[nameField] = queryObjects[nameField]
            ? [...queryObjects[nameField], ...object[nameField]]
            : [...object[nameField]]

        object[nameField] = getKeyValues(object, nameField, { id: currentQuery.id, name: currentQuery.name })
    }

    return {
        param: object,
        allQuerys: queryObjects
    }
}


let configObject = {
    target: object1, //arrayobjects
    querys: [{
        id: 'KingstonTownCode1',
        name: 'license-profession',
        newKey: 'professionQuery',
        paths: ['license.state', 'license.profession'],
        call: async function () {
            return { name: "andres" }

        }
    }, {
        id: 'KingstonTownCode1',
        name: 'state-query',
        newKey: 'stateQuery',
        paths: ['license.state'],
        call: async function () {
            return { name: "flavio" }
        }
    },]
}


const getAllQuerys = async () => {
    let data = _store.map(async item => {
        item.response = await item.query.call({ ...item.query, call: undefined })
        delete item.query.call
        return item
    })
    let response = await Promise.all(data)

    console.log(JSON.stringify(response))
}

const storeQuerys = (Querys) => {
    for (const queryType in Querys) {
        if (typeof Querys[queryType] === 'function') break;
        let query_identifier = configObject.querys.filter(item => item.newKey == queryType).shift()
        Querys[queryType] = getUniqueQuerys(Querys[queryType])
        Querys[queryType] = Querys[queryType].map(item => getKeyValues({ data: item }, 'data', { id: query_identifier.id, call: query_identifier.call, name: query_identifier.name }))
        Querys[queryType].map((objQuery) => (_store.push({
            query: objQuery,
            response: null,
            errors: []
        })))
    }
}


const initPrefile = () => {
    let objects = configObject.target
    let Querys = {}
    for (let object of objects) {
        let result = (assignQuery(object, configObject.querys))
        let localQuerys = result.allQuerys
        for (const key in localQuerys) {
            if (typeof localQuerys[key] === 'function') break;

            if (Querys[key])
                Querys[key].push(localQuerys[key])
            else
                Querys[key] = [localQuerys[key]]
        }
        object = result.param
    }

    //Bulding querys and storing data
    storeQuerys(Querys)
}


initPrefile()
getAllQuerys()