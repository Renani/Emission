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
        let data = Analytics.findFrequency(this.props.data, "reason");

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

        for (let d in data) {
            let key = data[d]["reason"];
            let duration = totalDurations[key];
            data[d]["TotalDuration"] = duration["TotalDuration"] / (1000 );
        }
        data = Analytics.sortData(data, "TotalDuration", Analytics.sortDirection.Desc);

        console.log("data after sort", totalDurations);

        this.state = { data: data, graphData: data };
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
        console.log("create Histogram!", this.state.data);
        const margin = this.props.margin;
        const height = this.props.height;
        const width = this.props.width;
        const key = "reason";
        const durationKey = "TotalDuration";
        const barWidth=50;

        //Creating Axis
        let rangeXScale = [margin.left, width - margin.right];

        console.log("rangexScale ", rangeXScale);
        let x = scaleBand()
            .domain(this.state.data.map(d => d.reason))
            .range(rangeXScale)
            .padding(0.1);

        const currentBarWidth = x.bandwidth()>barWidth?barWidth:x.bandwidth();

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



        let graphDomain = [0, max(this.state.graphData, d => d.TotalDuration)];
        let graphRange = [height - margin.bottom, margin.top];

        //   let graphRange = rangeScale;
        console.log("y range", graphRange);
        console.log("y domain margin", margin);
        console.log("y domain height", height);
        console.log("y domain ", graphDomain);

        let yGraphy = scaleLinear().domain(graphDomain).range(graphRange);
        console.log("yGraphy axis func", yGraphy);
        let yRightAxis = g => g.attr("transform", 'translate(' + 0 + ',0)').call(axisRight(yGraphy)).call(g => g.select(".domain").remove());
        console.log("right y", yRightAxis);
        svg.append("g")
            .attr("class", "y-axis")
            .call(yRightAxis);


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
            .attr("width",currentBarWidth);

        console.log("x function ", x);
        svg.append("g")
            .attr("class", "x-axis")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".3em")
            .attr("transform", function (d) {
                return "rotate(-65)"
            });


        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);



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
                .x(function (d) { let posx = x(d[key]) + x.bandwidth() / 2; return posx })
                .y(function (d) { return yGraphy(d[durationKey]) })
            )

        svg.append("g").selectAll("circle")
            .data(this.state.graphData).join("circle")
            .attr("fill", "url(#line-gradient)")
            .attr("stroke", "url(#line-gradient)")
            .attr("r", 10)
            .attr("cx", function (d) { let posx = x(d[key]) + x.bandwidth() / 2;; return posx })
            .attr("cy", function (d) { return yGraphy(d[durationKey]) });


        console.log("x Func", x);
    }



    render() {
        return <svg ref={node => this.node = node}
            width={this.props.width} height={this.props.height}>
            yoho
        </svg>

    }
};

export default ParetoDragram;
