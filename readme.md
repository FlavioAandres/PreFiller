#Ussage

## Config Object 
 * target: Object to map where is the profil data 
 * querys: Prefilers
   * id: "unique identifier"
   * name: "name or type"
   * newKeys: "name inside the object with query"
   * paths: "path of data inside target"
   * call: async function to get data, send query as param
   
   
## Example
   
   
```js

let configObject = {
    target: data, //arrayobjects
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
```
start()
