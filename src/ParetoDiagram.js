import React, { Component } from 'react';
import './App.css';
import Analytics from './Analytics'
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { extent, max, min, range } from "d3-array";
import { line } from "d3-shape"

class ParetoDragram extends Component {
    constructor(props) {
        super(props)
        this.createHistogram = this.createHistogram.bind(this)
        this.createlineGraph = this.createlineGraph.bind(this)
        let data = Analytics.findFrequency(this.props.data, "reason");
        console.log("Data", this.props.data);
        let graphData = Analytics.findLongest(this.props.data, false);

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
        });




        let probab = Analytics.findlikeliestCause(JSON.parse(JSON.stringify(this.props.data)), this.props.reach, "reason");

        for (let d in data) {
            let key = data[d]["reason"];
            let duration = totalDurations[key];
            data[d]["TotalDuration"] = duration["TotalDuration"] / (1000);


        }

        let sorted = Analytics.sortData(data, "TotalDuration", Analytics.sortDirection.Desc);
        console.log("Probability ", probab);
        console.log("Sorted", sorted);


        this.state = { data: data, graphData: sorted, dataProbabilty: probab };
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
        const durationKey = "TotalDuration";
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
        let domainScale = [0, max(this.state.data, d => d.count)];
        let rangeScale = [height - margin.bottom, dividerSpace + margin.top];

        let y = scaleLinear().domain(domainScale).range(rangeScale);
        let xAxisTranslate = "translate(0," + (height - margin.bottom) + ")";

        let xAxis = g => g.attr("transform", xAxisTranslate).call(axisBottom(x).tickSizeOuter(0));

        let yAxis = g => g.attr("transform", 'translate(' + margin.left + ',0)').call(axisLeft(y)).call(g => g.select(".domain").remove());


        //Main


        let svg = select(this.node);


        svg.append("g")
            .attr("class", "bars")
            .attr("fill", "steelblue")
            .selectAll("rect")
            .data(this.state.data)
            .join("rect")
            .attr("x", (d) => { return x(d.reason) })
            .attr("y", d => y(d.count))
            .attr("height", (d) => {
                let calcHeight = y(0) - y(d.count);
                return calcHeight;
            })

            .attr("width", currentBarWidth);

        svg.append("g")
            .attr("class", "x-axis")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-2em")
            .attr("dy", "-1.5em")
            .attr("font-size", "14px")
            .attr("transform", function (d) {
                return "rotate(-45)"
            });

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        this.createlineGraph(x, currentBarWidth);

        let linearDomainScale = [0, max(this.state.dataProbabilty, (d) => {
            //calculate dependencies over a limit
            let dependent = d[insideReachKey];
            return d.count//ignore
        })];
        let xLin = scaleLinear()
            .domain(this.state.data.map(d => d.reason))
            .range(rangeXScale);



        let first = this.state.data[0];
        svg.append("linearGradient")
            .attr("id", "bar-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", x(first[key]))
            .attr("y1", 0)
            .attr("x2", 10)
            .attr("y2", 0)
            .selectAll("stop")
            .data([
                { offset: "0%", color: "blue" },
                { offset: "100%", color: "red" }
            ])
            .enter().append("stop")
            .attr("offset", function (d) { return d.offset; })
            .attr("stop-color", function (d) { return d.color; });

    }



    createlineGraph(x, currentBarWidth) {

        const margin = this.props.margin;
        const height = this.props.height;
        const key = "reason";
        const durationKey = "TotalDuration";

        let svg = select(this.node);

        let graphDomain = [0, max(this.state.graphData, d => d.TotalDuration)];
        let graphRange = [height - margin.bottom, margin.top];

        //   let graphRange = rangeScale;


        let yGraphy = scaleLinear().domain(graphDomain).range(graphRange);

        let yRightAxis = g => g.attr("transform", 'translate(' + 0 + ',0)').call(axisRight(yGraphy)).call(g => g.select(".domain").remove());

        svg.append("g")
            .attr("class", "y-axis")
            .call(yRightAxis);

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
            .datum(this.state.graphData)
            .attr("fill", "none")
            .attr("stroke", "url(#line-gradient)")
            .attr("stroke-width", 3)
            .attr("d", line()
                .x(function (d) { let posx = x(d[key]) + currentBarWidth / 2; return posx })
                .y(function (d) { return yGraphy(d[durationKey]) })
            )

        svg.append("g").selectAll("circle")
            .data(this.state.graphData).join("circle")
            .attr("fill", "url(#line-gradient)")
            .attr("stroke", "url(#line-gradient)")
            .attr("r", 10)
            .attr("cx", function (d) { let posx = x(d[key]) + currentBarWidth / 2;; return posx })
            .attr("cy", function (d) { return yGraphy(d[durationKey]) });
    }




    render() {
        return <svg ref={node => this.node = node}
            width={this.props.width} height={this.props.height}>
            yoho
        </svg>

    }
};

export default ParetoDragram;
