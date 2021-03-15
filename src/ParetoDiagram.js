import React, { Component } from 'react';
import './App.css';
import Analytics from './Analytics'
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { extent, max, min, range } from "d3-array";
import { line } from "d3-shape"
import ColorGradient from "./color-gradient";

class ParetoDragram extends Component {
    constructor(props) {
        super(props)
        this.createHistogram = this.createHistogram.bind(this)
        this.createlineGraph = this.createlineGraph.bind(this)


        let data = Analytics.findCountAndProbability(this.props.data, "reason");

        let graphData = Analytics.findLongest(this.props.data, (d) => d.start, (d) => d.end, false);

        console.log("graphData", graphData);
        //sum up timespan and  group them

        let totalDurations = graphData.reduce((map, obj) => {

            let existing = map[obj["reason"]];
            let sum = obj["_timeSpan"];
            if (existing) {
                sum = existing['TotalDuration'];
                
                sum += obj["_timeSpan"];


            } else {
                existing = obj;

            }

            existing["TotalDuration"] = sum;
            map[existing["reason"]] = existing;
            return map;
        }, {});




        let probab = Analytics.findlikeliestCause(JSON.parse(JSON.stringify(this.props.data)), this.props.reach, "reason");
        console.log("prob array ", probab);

        let frequencyOut = Analytics.findFrequencyPerPeriod(this.props.data, (d) => d.start, this.props.reach, (d) => d.reason);
        let frequencyPerPeriod = frequencyOut[0]
        let getFrequency = frequencyOut[1];
        let frequency_key = frequencyOut[2];
        console.log("frequencyPerPeriod", frequencyPerPeriod);
        let totalTime =0;
        for (let d in data) {
            let key = data[d]["reason"];
            let duration = totalDurations[key];
            data[d]["TotalDuration"] = duration["TotalDuration"] / 1000;
            totalTime += duration["TotalDuration"];
            //  let dependent = probab[key]["_innerReach"];
            let rootCause = probab.find(el => el["reason"] === key);
            data[d]["totalDependencyTime"] = rootCause["totalDependencyTime"];
            

            data[d]["weight"] = rootCause["weight"];
            let depdendentsObject = rootCause["_insideReach"];
            let dependent=[];
            let depIndex=0;
            
            for(let item in depdendentsObject){
                
                dependent[depIndex++]=depdendentsObject[item];
            }
            
            data[d]["dependents"]  =dependent;
            data[d][frequency_key] = Number.parseFloat(getFrequency(frequencyPerPeriod[key])).toPrecision(2);
        }
        
        console.log("frequency key ", frequency_key)
        let sorted = Analytics.sortData(data, "TotalDuration", Analytics.sortDirection.asc);

        let cumulativeDuration =0;
        for(let item in sorted ){
            cumulativeDuration += sorted[item] ["TotalDuration"]/(totalTime/1000);
            sorted[item]["lineGraph"] =  cumulativeDuration;
        
        }

        //let sorted = data.sort((a,b) =>{ console.log(" sort algorithm", frequency_key); return a[frequency_key] < b[frequency_key];});
        console.log("Probability ", probab);
        console.log("Sorted  ", sorted);
        console.log("Final data ", data);


        this.state = { data: sorted, getAverageFrequency: (d) => Number.parseFloat(d["lineGraph"]).toPrecision(2) };
    }



    componentDidMount() {
        this.createHistogram()
    }
    componentDidUpdate() {
        this.createHistogram()
    }
    /***
     * Expects data to have the structure {reasion, count}
     * height
     * width
     * margin = ({top: 20, right: 0, bottom: 30, left: 40})
     */
    createHistogram() {

        const margin = this.props.margin;
        const height = this.props.height;
        const width = this.props.width;
        const key = "reason";
        const barWidth = 50;
        const insideReachKey = "_insideReach";
        //Creating Axis
        let rangeXScale = [margin.left, width - margin.right];


        let x = scaleBand()
            .domain(this.state.data.map(d => d.reason))
            .range(rangeXScale)
            .padding(0.1);

        const currentBarWidth = x.bandwidth() > barWidth ? barWidth : x.bandwidth();

        //manipulates the range of axis to create a divider between them. Consider instead inrease the domain 
        let dividerSpace = 0;
        let domainScale = [0, max(this.state.data, d => d.TotalDuration)];
        let rangeScale = [height - margin.bottom, dividerSpace + margin.top];

        let y = scaleLinear().domain(domainScale).range(rangeScale);
        let xAxisTranslate = "translate(0," + (height - margin.bottom) + ")";

        let xAxis = g => g.attr("transform", xAxisTranslate).call(axisBottom(x).tickSizeOuter(0));

        let yAxis = g => g.attr("transform", 'translate(' + margin.left + ',0)').call(axisLeft(y)).call(g => g.select(".domain").remove());


        //Main

        let maxTotalTime = max(this.state.data, d => d.weight);
        let gradColorStart = { red: 0, green: 0, blue: 150 };
        let gradColorEnd = { red: 200, green: 0, blue: 0 };


        let svg = select(this.node);


        svg.append("g")
            .attr("class", "bars")

            .selectAll("rect")
            .data(this.state.data)
            .join("rect")
            .attr("x", (d) => { return x(d.reason) })
            .attr("y", d => y(d.TotalDuration))
            .attr("height", (d) => {
                let calcHeight = y(0) - y(d.TotalDuration);
                return calcHeight;
            })
            .attr("fill", (d) => {

                return ColorGradient(Number.parseFloat(d.weight / maxTotalTime).toPrecision(2), gradColorStart, gradColorEnd)
            })

            .attr("width", currentBarWidth);

        svg.append("g")
            .attr("class", "x-axis")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-1.5em")
            .attr("dy", "-1.2em")
            .attr("font-size", "1.4em")
            .attr("font-family", 'Times New Roman')
            .attr("transform", function (d) {
                return "rotate(-65)"
            });

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis)
            .attr("font-size", "1.4em")
            .attr("font-family", 'Times New Roman');

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margin.left / 2)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("font-size", "1.4em")
            .attr("font-family", 'Times New Roman')
            .text("Duration(Seconds)");

        this.createlineGraph(x, currentBarWidth);

    }



    createlineGraph(x, currentBarWidth) {

        const margin = this.props.margin;
        const height = this.props.height;
        const key = "reason";
        const durationKey = "TotalDuration";
        const getAverageFrequency = this.state.getAverageFrequency;

        let svg = select(this.node);

        let graphDomain = [0, max(this.state.data, (d) => getAverageFrequency(d))];
        let graphRange = [height - margin.bottom, margin.top];

        //   let graphRange = rangeScale;


        let yGraphy = scaleLinear().domain(graphDomain).range(graphRange);

        let yRightAxis = g => g.attr("transform", 'translate(' + 0 + ',0)').call(axisRight(yGraphy)).call(g => g.select(".domain").remove());
        /*
                    svg.append("g")
                        .attr("class", "y-axisLinear")
                        .attr("font-size", "1.5em")
                        .attr("font-family", 'Times New Roman')
                        .call(yRightAxis); */

        svg.append("linearGradient")
            .attr("id", "line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0)
            .attr("y1", yGraphy(0))
            .attr("x2", 0)
            .attr("y2", yGraphy(max))
            .selectAll("stop")
            .data([
                { offset: "0%", color: "blue" },
                { offset: "100%", color: "red" }
            ])
            .enter().append("stop")
            .attr("offset", function (d) { return d.offset; })
            .attr("stop-color", function (d) { return d.color; });



        svg.append("path")
            .datum(this.state.data)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("d", line()
                .x(function (d) { let posx = x(d[key]) + currentBarWidth / 2; return posx })
                .y(function (d) { return yGraphy(getAverageFrequency(d)) })
            )

        svg.append("g").selectAll("circle")
            .data(this.state.data).join("circle")
            .attr("fill", "blue)")
            .attr("stroke", "yellow")
            .attr("r", 10)
            .attr("cx", function (d) { let posx = x(d[key]) + currentBarWidth / 2; return posx })
            .attr("cy", function (d) { return yGraphy(getAverageFrequency(d)) })
            .on("click", this.props.onClick);

        svg.selectAll("text.graph")
            .data(this.state.data)
            .enter()
            .append("text")
            .attr("x", function (d) { let posx = x(d[key]) + currentBarWidth / 2; return posx })
            .attr("y", function (d) { return (yGraphy(getAverageFrequency(d))-40) })
            .attr("dy", "1em")
            .attr("font-size", "1.4em")
            .attr("font-family", 'Times New Roman')
            .text((d)=>getAverageFrequency(d));
    }




    render() {
        return <svg ref={node => this.node = node}
            width={this.props.width} height={this.props.height} viewBox="0 0 1000 1000">
            yoho
        </svg>

    }
};

export default ParetoDragram;
