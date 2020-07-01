const fs = require('fs');

class Logs {
    static log(actionId, input, output){
        return new Promise((resolve, reject) => {
            this.readUserActions()
                .then(res => {
                    let dataToWrite = {
                        "id": actionId,
                        "input": input,
                        "output": output
                    }
                    res.actions.push(dataToWrite);
                    return res;
                })
                .then(res => {
                    let resString = JSON.stringify(res, null, 2);
                    return this.writeUserActions(resString);
                })
                .then(res => {
                    resolve(res);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
    static logError(err){

    }
    static readUserActions(){
        return new Promise((resolve, reject) => {
            fs.readFile(`${__basedir}/logs/userActions.json`, 'utf-8', (err, data) => {
                if(err)
                    reject(err);
                let jsonData = JSON.parse(data);
                resolve(jsonData);
            })
        })
    }

    static writeUserActions(data){
        return new Promise((resolve, reject) => {
            fs.writeFile(`${__basedir}/logs/userActions.json`, data, err => {
                if(err)
                    reject(err);
                resolve(true);
            })
        })
    }
}

module.exports = Logs;