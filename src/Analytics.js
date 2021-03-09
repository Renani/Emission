import * as ss from 'simple-statistics';

export default class Analytics {

    static findFrequency(data, key) {
        let dataMap = {};

        for (let index in data) {
            let obj = {};
            obj = data[index]; //returns index instead of value

            if (!(key in obj)) {
                console.error("Wrong key used " + key, obj);
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
            newSet.push({ key: keyIndex, count: count, probability: prob });
        }

        return newSet;
    }
    static findLongest(data) { 
       var data= data.map(entry=>{
            let timeSpan = entry.end-entry.start/1000;
            entry["timeSpan"]=entry;
            return entry;
        });
        return data;
    }
    static findlikeliestCause() {
        //gå igjennom hvert element EL1
        //Identifisert neste element (EL2) i liste,lag en array B ut av det og antall ganger det skjer.
        //for hvert element i array B, del antall ganger det skjer på frekvensen på EL1.
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

    static sortData(data, key) {
        return data.sort((a, b) => { return data[a] < data[b] });
    }


}