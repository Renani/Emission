import React, { Component } from 'react';
import './App.css';
import { axisBottom, axisLeft, axisRight } from 'd3-axis'
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import { extent, max, min, range } from "d3-array";
import {transition} from 'd3-transition';

class BarchartAnimated extends Component {

    constructor(props) {
        super(props)
        this.createBarChart = this.createBarChart.bind(this)
    }

    componentDidMount() {
        this.createBarChart()
    }
    componentDidUpdate() {
        this.createBarChart()
    }
    createBarChart() {
        const node = this.node;
        const getXValue = this.props.getXValue;
        const getYValue = this.props.getYValue;
        const height = this.props.height;
        const width = this.props.width;
        const margin = this.props.margin;
        // append the svg object to the body of the page
        var svg = select(node);

        // Parse the Data


        // X axis
        let rangeXScale = [margin.left, this.props.width - margin.right];


        let x = scaleBand()
            .domain(this.props.data.map((d)=>this.props.getXValue(d)))
            .range(rangeXScale)
            .padding(0.1);


        svg.append("g")
            .attr("transform", "translate(0," + (height-margin.bottom) + ")")
            .call(axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .attr("font-size", "1.4em")
            .attr("font-family", 'Times New Roman')
            .style("text-anchor", "end");

        // Add Y axis
        var y = scaleLinear()
            .domain([0, max(this.props.data, d => getYValue(d))])
            .range([(height-margin.bottom), 0]);
        svg.append("g")
            .attr("transform", 'translate(' + margin.left + ',0)')
            .call(axisLeft(y));
            //let yAxis = g => g.attr("transform", 'translate(' + margin.left + ',0)').call(axisLeft(y)).call(g => g.select(".domain").remove());
        // Bars
        svg.selectAll("mybar")
            .data(this.props.data)
            .enter()
            .append("rect")
            .attr("x", function (d) { return x(getXValue(d)); })
            .attr("width", x.bandwidth())
            .attr("fill", "#69b3a2")
            // no bar at the beginning thus:
            .attr("height", function (d) { return (height-margin.bottom) - y(0); }) // always equal to 0
            .attr("y", function (d) { return y(0); })

        // Animation
        svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function (d) { return y(getYValue(d)); })
            .attr("height", function (d) { return (height-margin.bottom) - y(getYValue(d)); })
            .delay(function (d, i) {  return (i * 100) });


    }

    render() {
        return<div> 
            <h2> {this.props.title}</h2>
            <svg ref={node => this.node = node}
            width={this.props.width} height={this.props.height}>
        </svg>
        </div>
    }

}

export default BarchartAnimated;