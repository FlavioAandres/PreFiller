const _ = require('lodash')


const _getKeyValues = (object, nameField, identifiers = {}) => {
    let array = object[nameField]
    return array.reduce((obj, current) => {
        obj[current.key] = current.value
        return obj
    }, { ...identifiers });
}

const _assignQuery = (object = [], params = []) => {
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

        object[nameField] = _getKeyValues(object, nameField, { id: currentQuery.id, name: currentQuery.name })
    }

    return {
        param: object,
        allQuerys: queryObjects
    }
}

const _getUniqueQuerys = (querys) => {
    // console.log(querys)
    return _.uniqBy(querys, (query) => {
        let strings = query.map(function (query) {
            return `${query.key}#${query.value}`
        })
        return strings.join('#')
    });
}

module.exports = {
    assignQuery: _assignQuery,
    getKeyValues: _getKeyValues,
    getUniqueQuerys: _getUniqueQuerys
}