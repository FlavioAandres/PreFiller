
const prefiler = require('./src/prefiler')
let data = require('./src/data')

let configObject = {
    target: "data", //arrayobjects
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

const start = async () => {
    const result = await prefiler.config(configObject)
    console.log(prefiler.getStore())
}

start()