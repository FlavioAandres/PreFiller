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
    }
}

module.exports = {
    config: profiler._config,
    getStore: () => {
        if (!_config_file) throw new Error('config file is missing, please initialize again this process')
        if (!_store) throw new Error('Something bad happened... internal store is missing')
        return _store
    }
}