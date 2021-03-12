import * as ss from 'simple-statistics';

export default class Analytics {
    static sortDirection = {
        asc: 1,
        Desc: 0
    };

    static findFrequency(data, key) {
        let dataMap = {};

        for (let index in data) {
            let obj = {};
            obj = data[index]; //returns index instead of value

            if (!(key in obj)) {
                console.error("Wrong key used " + key, obj);
                return undefined;
            }

            let count = 1;

            if (obj[key] in dataMap) {
                let old = dataMap[obj[key]]
                count = old + 1;
            }

            dataMap[obj[key]] = count;

        }

        let length = data.length;
        console.log("data in findFrequency length ", data.length);
        let newSet = [];
        for (let keyIndex in dataMap) {
            let count = dataMap[keyIndex];
            let prob = count / length;
            newSet.push({ [key]: keyIndex, count: count, probability: prob });
        }

        return newSet;
    }
    /**
     * 
     * @param [{start,end,*}] data 
     * @param {boolean} pretty 
     * @returns {_timeSpan:end-start}
     */
    static findLongest(data, pretty) {
        let start = "start";
        let end = "end";
        
      /*  let newSet = [];
        for(let index in data){
            let entry = data[index];
            let timeSpan = (entry[end] - entry[start]);
            let newEntry = JSON.parse(JSON.stringify(entry));
            if (pretty) {
                let seconds = parseInt((timeSpan / 1000) % 60);
                let minutes = Math.floor((timeSpan / (1000 * 60)) % 60);
                let hours = Math.floor((timeSpan / (1000 * 60 * 60)) % 60);
                let days = Math.floor((timeSpan / (1000 * 60 * 60 * 24)) % 24);
                newEntry["Duration"] = days + "d, " + hours + "h, " + minutes + "m and " + seconds + "s";
            }
            newEntry["_timeSpan"] = timeSpan;
            newSet.push(entry);
        }*/

        let newSet = data.map(entry => {
            let timeSpan = (entry[end] - entry[start]);
            if (pretty) {
                let seconds = parseInt((timeSpan / 1000) % 60);
                let minutes = Math.floor((timeSpan / (1000 * 60)) % 60);
                let hours = Math.floor((timeSpan / (1000 * 60 * 60)) % 60);
                let days = Math.floor((timeSpan / (1000 * 60 * 60 * 24)) % 24);
                entry["Duration"] = days + "d, " + hours + "h, " + minutes + "m and " + seconds + "s";
            }
            entry["_timeSpan"] = timeSpan;
            return entry;
        });
        return newSet;
    }
    /**
     * 
     * @param { start:int millis,end} data 
     * @param {int milliseconds} reach 
     * @Param {object field name} key
     * @returns 
     */
    static findlikeliestCause(data, reach, key) {

        //gå igjennom hvert element EL1
        //Identifisert neste element (EL2) i liste,lag en array B ut av det og antall ganger det skjer.
        //for hvert element i array B, del antall ganger det skjer på frekvensen på EL1.
        const start = "start";
        const sorted = this.sortData(data, start, this.sortDirection.asc);
        const timeGapKey = 'timeGap';

        const dependencyCount = "dependencyCount";
        const insideReachKey = "_insideReach";

        console.log("Sorted by starttime", sorted);
        for (let index in sorted) {
            let entry = sorted[index];

            if (index == 0) {
                entry[timeGapKey] = 0;
            } else {
                let prevInd = index - 1;
                let prev = sorted[prevInd];
                let timeGap = entry[start] - prev[start];

                entry[timeGapKey] = timeGap;
            }
        }

        console.log("data with gap ", sorted);

        let freqArr = this.findFrequency(sorted, key);
//        console.log("frequencyMap before reduce", freqArr);
        //Convert from Array to HashMap structure
      let freqMap = freqArr.reduce(function (map, obj) {
                obj[insideReachKey] = {};
                map[obj[key]] = obj;
                return map;
            }, {});

//        console.log("frequencyMap after reduce", freqMap);

        for (let j = 0; j < sorted.length; j++) {
            j = parseInt(j);
            let entry = sorted[j];

            let cumulativeGap = 0;
            let jj = parseInt(j) + 1;
            for (; jj < sorted.length; jj++) {
                try {
                    let innerEntry = sorted[jj];
                    let innerKey = innerEntry[key];
                    cumulativeGap += innerEntry[timeGapKey];
                    if (cumulativeGap - reach < 1) {
                        let dependencies = freqMap[entry[key]][insideReachKey];

                        let dependent = dependencies[innerKey];
                        let toBehashed = {
                            [key]: innerKey,
                            [dependencyCount]: 1
                        };

                        if (dependent) {
                            let count = dependent[dependencyCount] + 1;
                            toBehashed[dependencyCount] = count;
                        }
                        //      console.log("dependent found, value ", toBehashed);
                        freqMap[entry[key]][insideReachKey][innerKey] = toBehashed;

                    }
                } catch (e) {
                    console.log("key ", (key));
                    console.log("Exception ", e);
                    console.log("freqMap entry ", entry);
                }
            }
        }

        let frequencies = [];
        let index = 0;
        for (let item in freqMap) {
            let total = 0;
            let depArr = freqMap[item][insideReachKey];

            for (let dep in depArr) {
                let count = depArr[dep][dependencyCount]
                total = total + count;
            }
            console.log("caculating probability ", depArr);
            var depString = "";
            for (let dep in depArr) {
                let count = depArr[dep][dependencyCount]
                console.log("calculating probability", dep);
                depArr[dep]["probability"] = (count / total).toFixed(2);
                depString += dep + " (" + (depArr[dep]["probability"] * 100) + "%)" + ", ";

            }
            freqMap[item]["Dependencies"] = depString;
            frequencies[index++] = freqMap[item];
        }

        console.log("frequency", freqMap);

        return frequencies;
 
    }

    static findCombination(data, key) {
        let dataSet = data.map(entry => entry.reason);
        console.log("dataSet ", dataSet);
        let combination = ss.combinations(dataSet, 2);
        console.log("combinations", combination);

        let combData = combination.map(entry => {
            let freq = entry[0] + "=>" + entry[1];
            return {
                frequencyKey: freq,
                first: entry[0],
                second: entry[1]
            }

        }
        );
        var freq = this.findFrequency(combData, "frequencyKey");
        console.log("frequency of combination", freq);

        return freq;
    }
    /**
     * 
     * @param {key:number value} data 
     * @param {*} key 
     * @param {sortDirection} sortDirection 
     * @returns 
     */
    static sortData(data, key, sortDirection) {
        if (sortDirection === this.sortDirection.asc)
            return data.sort((a, b) => { return a[key] < b[key] });
        else if (sortDirection === this.sortDirection.Desc)
            return data.sort((a, b) => { return a[key] > b[key] });
    }

}