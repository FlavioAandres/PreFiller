const _ = require('lodash')
const queryTransform = require('./_query')
let _config_file = null
let _store = []

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

const profiler = {
    _config: async (config_file = null) => {
        if (!config_file) throw new Error('config file is required, please visit the documentation')
        _config_file = config_file
        //prepare data local
        let object = profiler._initProfile()
        await profiler._getAllQuerys()
        return object
    },
    _getAllQuerys: async () => {
        let data = _store.map(async item => {
            item.response = await item.query.call({ ...item.query, call: undefined })
            delete item.query.call
            return item
        })
        let response = await Promise.all(data)
        _store = response
    },
    _storeQuerys: (Querys) => {
        for (const queryType in Querys) {
            if (typeof Querys[queryType] === 'function') break;
            let query_identifier = _config_file.querys.filter(item => item.newKey == queryType).shift()
            Querys[queryType] = queryTransform.getUniqueQuerys(Querys[queryType])
            Querys[queryType] = Querys[queryType].map(item => queryTransform.getKeyValues({ data: item }, 'data', { id: query_identifier.id, call: query_identifier.call, name: query_identifier.name }))

            Querys[queryType].map((objQuery) => (_store.push({
                query: objQuery,
                response: null,
                errors: []
            })))
        }
    },
    _initProfile: () => {
        let objects = _config_file.target
        let Querys = {}
        for (let object of objects) {
            let result = (queryTransform.assignQuery(object, _config_file.querys))
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

        profiler._storeQuerys(Querys)

        return objects
    },
    _getData: (externalQuery) => {
        if (!_store) throw new Error('No store found, initialize the app properly')
        if (!externalQuery) throw new Error('Query should be passed in args')

        const { name, id } = externalQuery
        // delete externalQuery.name
        // delete externalQuery.id

        const response = _store.find(({ query: queryStored }) => {
            let isValid = queryStored.id === id && queryStored.name === name;
            const properties = externalQuery ? Object.keys(externalQuery) : [];
            if (isValid) {
                if (
                    properties &&
                    queryStored &&
                    properties.length > 0 &&
                    properties.length === Object.keys(queryStored).length
                ) {
                    for (const property of properties) {
                        if (
                            queryStored[property] !== externalQuery[property]
                        ) {
                            isValid = false;
                            break;
                        }
                    }
                } else {
                    console.log('descarted by firstvalidation');
                    console.log(properties);
                    console.log(properties.length);
                    console.log(queryStored);
                    console.log(Object.keys(queryStored).length);

                    isValid = false;
                }
            }
            return isValid;
        });
        return response ? response.response : null;
    }
}

module.exports = {
    config: profiler._config,
    getStore: () => {
        if (!_config_file) throw new Error('config file is missing, please initialize again this process')
        if (!_store) throw new Error('Something bad happened... internal store is missing')
        return _store
    },
    getData: profiler._getData
}