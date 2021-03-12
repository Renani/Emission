import React, { Component } from 'react';
import './App.css';
import Analytics from './Analytics'
import { select } from 'd3-selection';
import { scaleBand, scaleLinear } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { extent, max, min, range } from "d3-array";
import {line  } from "d3-shape"

class ParetoDragram extends Component {
    constructor(props) {
        super(props)
        this.createHistogram = this.createHistogram.bind(this)
        let data = Analytics.findFrequency(this.props.data, "reason");
        data = Analytics.sortData(data, "count");
        this.state = { data: data };
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

        //Creating Axis
        let rangeXScale = [margin.left, width - margin.right];

        console.log("rangexScale ", rangeXScale);
        let x = scaleBand()
            .domain(this.state.data.map(d => d.reason))
            .range(rangeXScale)
            .padding(0.1);

        let domainScale = [0, max(this.state.data, d => d.count)];
        let rangeScale = [height - margin.bottom, margin.top];
        console.log("y range", rangeScale);

        let y = scaleLinear().domain(domainScale).range(rangeScale);
        let xAxisTranslate = "translate(0," + (height - margin.bottom) + ")";
        console.log("xAxisTranslate", xAxisTranslate);

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
            .attr("x", (d) => { console.log("calculcated x", d); return x(d.reason) })
            .attr("y", d => y(d.count))
            .attr("height", (d) => {
                let calcHeight = y(0) - y(d.count);

                return calcHeight;
            })
            .attr("width", x.bandwidth());

        console.log("x function ", x);
        svg.append("g")
            .attr("class", "x-axis")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

            svg.append("linearGradient")
            .attr("id", "line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0)
            .attr("y1", y(0))
            .attr("x2", 0)
            .attr("y2", y(max))
            .selectAll("stop")
              .data([
                {offset: "0%", color: "blue"},
                {offset: "100%", color: "red"}
              ])
            .enter().append("stop")
              .attr("offset", function(d) { return d.offset; })
              .attr("stop-color", function(d) { return d.color; });

              svg.append("path")
              .datum(this.state.data)
              .attr("fill", "none")
              .attr("stroke", "url(#line-gradient)" )
              .attr("stroke-width", 2)
              .attr("d",line()
                .x(function(d) { return x(d.reason) })
                .y(function(d) { return y(d.count) })
                )


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
