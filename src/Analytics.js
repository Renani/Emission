import * as ss from 'simple-statistics';

export default class Analytics {
    static sortDirection = {
        asc: 1,
        Desc: 0
    };

    static findCountAndProbability(data, key) {
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

        let newSet = [];
        for (let keyIndex in dataMap) {
            let count = dataMap[keyIndex];
            let prob = count / length;
            newSet.push({ [key]: keyIndex, count: count, probability: prob });
        }

        return newSet;
    }


    static findCountAndProbabilityWithCallback(data, callBack) {
        let dataMap = {};
        
        for (let index in data) {
            let obj = {};
            obj = data[index]; //returns index instead of value
            let objKey = callBack(obj);
            let count = 1;

            if (objKey in dataMap) {
                let old = dataMap[objKey]
                count = old + 1;
            }

            dataMap[objKey] = count;

        }

        let length = data.length;

        let newSet = [];
        for (let keyIndex in dataMap) {
            let count = dataMap[keyIndex];
            let prob = count / length;
            newSet.push({ category: keyIndex, count: count, probability: prob });
        }

        return [newSet,(d)=>d.category];
    }
    /**
     * 
     * @param {[key]:key,start:millis,end:millis}} data 
     * @param {*} key 
     */

    /**
     * finds frequency per time unit
     * @param {d} data 
     * @param {*} key 
     */
    static findFrequencyPerPeriod(data, getStartTime, period, getCategory) {
      
        let sorted = JSON.parse(JSON.stringify(data));

        sorted = this.sortData(data, "start", this.sortDirection.Desc);

        const timeGap = this.calculateTimeGapBetween(sorted, getStartTime);

        let groupByPeriod = sorted.reduce((acc, currentValue, index, dataSet) => {
           
            
            let cumulativeGap = acc.cumulativeGap + currentValue[timeGap];
           
            if (cumulativeGap > period) {
                acc.cumulativeGap = 0;
                acc.periodCounter += 1;
                acc.entries[acc.periodCounter] = [currentValue];
                return acc;;

            } else {
                if (index === 0) {
                    acc.entries[0] = [currentValue]
                    return acc;
                } else {
                    acc.cumulativeGap =cumulativeGap;
                     acc.entries[acc.periodCounter].push(currentValue);
                     return acc;
                }
            }

        }, { cumulativeGap: 0, periodCounter: 0, entries: [] });
        
        
        let avgFrequencyPerCategory ={}
        for (let index in groupByPeriod.entries){
             
            let resultArr=  this.findCountAndProbabilityWithCallback(groupByPeriod.entries[index], getCategory);
            let countArr = resultArr[0];
            let getEntry = resultArr[1];

            groupByPeriod.entries[index] = countArr;
        


            for (let index in countArr){
                
                let currentValue = countArr[index];
              
                let objKey =getEntry(currentValue);
                let existing = avgFrequencyPerCategory[objKey];
                if(existing){
                    existing.count +=1;
          //          console.log("currentValues ", [currentValue.probability, groupByPeriod.entries.length, existing.cumulativeFrequency]);
                    existing.AverageFrequency +=(currentValue.probability/groupByPeriod.entries.length);
                }else{
                    avgFrequencyPerCategory[objKey] ={AverageFrequency: currentValue.probability/groupByPeriod.entries.length, count:1}
                }
            }


        }
     
        
        return [avgFrequencyPerCategory, (d)=>d.AverageFrequency, "AverageFrequency"];
    }

    /**
     * 
     * @param [{start,end,*}] data 
     * @param {boolean} pretty 
     * @returns {_timeSpan:end-start}
     */
    static findLongest(data, getStartTime, getEndTime, pretty) {
      
        
        let newSet = [];
        for (let index in data) {
            let entry = data[index];
            let timeSpan = parseInt((getEndTime(entry) - getStartTime(entry)));

            let newEntry = JSON.parse(JSON.stringify(entry));
            if (pretty) {
                let seconds = parseInt((timeSpan / 1000) % 60);
                let minutes = Math.floor((timeSpan / (1000 * 60)) % 60);
                let hours = Math.floor((timeSpan / (1000 * 60 * 60)) % 60);
                let days = Math.floor((timeSpan / (1000 * 60 * 60 * 24)) % 24);
                newEntry["Duration"] = days + "d, " + hours + "h, " + minutes + "m and " + seconds + "s";
            }
            newEntry["_timeSpan"] = timeSpan;
            newSet.push(newEntry);
        }
      

       
        console.log("newSet ", newSet);
        return newSet;
    }

    static calculateTimeGapBetween(data, dataCallBack) {
        const timeGapKey = 'timeGap';
 


        for (let index in data) {
            let entry = data[index];
            let newEntry = JSON.parse(JSON.stringify(entry));
            if (index == 0) {
                newEntry[timeGapKey] = 0;
            } else {
                let prevInd = index - 1;
                let prev = data[prevInd];
                let timeGap = dataCallBack(newEntry) - dataCallBack(prev);

                newEntry[timeGapKey] = timeGap;
            }
            data[index] = newEntry;
        }
        return timeGapKey;
    }
    /**
     * 
     * @param { start:int millis,end} data 
     * @param {int milliseconds} reach 
     * @Param {object field name} key
     * @returns {_insideReach:[data Entries], }
     */
    static findlikeliestCause(data, reach, key) {
        console.log("likeliestCauseData", data);
        //gå igjennom hvert element EL1
        //Identifisert neste element (EL2) i liste,lag en array B ut av det og antall ganger det skjer.
        //for hvert element i array B, del antall ganger det skjer på frekvensen på EL1.
        const start = "start";
        const end = "end";
        const sorted = JSON.parse(JSON.stringify(this.sortData(data, start, this.sortDirection.Desc)));


        const dependencyCount = "dependencyCount";
        const insideReachKey = "_insideReach";
        const depdendency_key = "Dependencies";
        const probability_key = "probability";
        const totalTimeSpan = "totalTimespan";
        const totalDependencyTime = "totalDependencyTime";
        const weight_key = "weight";


        //Calculating distance [insert ]
        const timeGapKey = Analytics.calculateTimeGapBetween(sorted, (d) => { return d[start] });

        console.log("timeGapKey ", timeGapKey);
        //Calculating probability and count if each entry
        let freqArr = this.findCountAndProbability(sorted, key);

        //Mapping to hashmap structure, adding another empty array as variable.
        let freqMap = freqArr.reduce(function (map, obj) {
            obj[insideReachKey] = {};
            map[obj[key]] = obj;
            return map;
        }, {});


        //populate the hashmap with only entries inside the reach
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

                    let diffReachCum = (reach - cumulativeGap);

                    if (diffReachCum > 1) {
                        //    console.log("cumativeGap ", cumulativeGap);
                        //   console.log("reach ", reach);


                        let cDuration = innerEntry[end] - innerEntry[start];

                        let dependencies = freqMap[entry[key]][insideReachKey];

                        let dependent = dependencies[innerKey];
                        let toBehashed = {
                            [key]: innerKey,
                            [dependencyCount]: 1,
                            [totalTimeSpan]: cDuration

                        };

                        if (dependent) {
                            let count = dependent[dependencyCount] + 1;
                            toBehashed[dependencyCount] = count;
                            toBehashed[totalTimeSpan] = toBehashed[totalTimeSpan] + cDuration;


                        }

                        freqMap[entry[key]][insideReachKey][innerKey] = toBehashed;

                    }

                } catch (e) {
                    console.log("error");
                    console.error("key ", (key));
                    console.error("Exception ", e);
                    console.error("freqMap entry ", entry);
                }
            }
        }

        console.log("FreqMap", freqMap);

        let frequencies = [];
        let index = 0;
        for (let item in freqMap) {
            let total = 0;
            let ctotDuration = 0;
            let depArr = freqMap[item][insideReachKey];


            //Summing up total count
            for (let dep in depArr) {
                let count = depArr[dep][dependencyCount];

                total = total + count;
            }

            //summing up total duration and probability
            var depString = "";
            let cWeight = 0;
            for (let dep in depArr) {
                ctotDuration = ctotDuration + depArr[dep][totalTimeSpan];
                let count = depArr[dep][dependencyCount]
                depArr[dep][probability_key] = Number.parseFloat(count / total).toPrecision(2); //(count / total).toFixed(2);
                depString += dep + " (" + ((depArr[dep][probability_key] * 100)).toFixed(2) + "%)" + ", ";
                cWeight = cWeight + (depArr[dep][totalTimeSpan] * depArr[dep][probability_key]);
            }

            freqMap[item][depdendency_key] = depString;
            freqMap[item][totalDependencyTime] = ctotDuration;
            //freqMap[item][weight_key] = Number.parseFloat(cWeight).toPrecision(2);
            freqMap[item][weight_key] = cWeight;
            frequencies[index++] = freqMap[item];
        }

        return frequencies;

    }

    static findCombination(data, key) {
        let dataSet = data.map(entry => entry.reason);

        let combination = ss.combinations(dataSet, 2);


        let combData = combination.map(entry => {
            let freq = entry[0] + "=>" + entry[1];
            return {
                frequencyKey: freq,
                first: entry[0],
                second: entry[1]
            }

        }
        );
        var freq = this.findCountAndProbability(combData, "frequencyKey");


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