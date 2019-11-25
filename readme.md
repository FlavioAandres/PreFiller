#Ussage

## Config Object 
 * target: Array of object to map where is the profil data 
 * querys: Prefilers
   * id: "unique identifier"
   * name: "name or type"
   * newKeys: "name inside the object with query"
   * paths: "path of data inside target"
   * call: async function to get data, send query as param
   
   
## Methods 

* profiler.config(<ConfigObject>): this method initialize the profiller and returns the target object with all querys inside of them

* profiler.getData(<QueryObject>): Returns the response gived by async call config Object

* profiler.getStore(): Return the entire data inside the profiler


## Example
   
   
```js

let configObject = {
    target: data, //arrayobjects
    querys: [{
        id: 'hashedid-xTfU9LNn',
        name: 'license-profession',
        newKey: 'professionQuery',
        paths: ['license.state', 'license.profession'],
        call: async function () {
            return { name: "andres" }

        }
    }, {
        id: 'hashedid-xTfU9LNn',
        name: 'state-query',
        newKey: 'stateQuery',
        paths: ['license.state'],
        call: async function () {
            return { name: "flavio" }
        }
    },]
}

const start = async () => {
    const data = await prefiler.config(configObject)
    let resultProfiler = prefiler.getData(data[0].professionQuery)
    console.log(resultProfiler);

    //output: { name: "andres" }

}
```
start()
