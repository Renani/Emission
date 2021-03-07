import React, { Component } from 'react';
import './App.css';
import { emissionData } from './emissionData.js'
import { select } from 'd3-selection';

class DataTable extends Component {


    constructor(props) {
        super(props);

        this.getSortDirection = this.getSortDirection.bind(this);
        this.setSortDirection = this.setSortDirection.bind(this);

        console.log("running Constructor");
        var data = {};
        if (!this.props.data) {
            data = emissionData.emissionData;
        } else {
            data = this.props.data;
        }

        data = data.map(entry => {
            var startDate = new Date(entry.start).toISOString ();
            var endDate = new Date(entry.end).toISOString ();

            console.log("date", new Date(entry.start));
            return {
                'StartDate': startDate,
                'endDate': endDate,
                'Reason': entry.reason,
                'Start': entry.start,
                'End': entry.end

            }
        });

        this.state = { data: data, rows: {}, sortAscending: true };

    }



    getSortDirection() {
        return this.state.sortAscending;
    }

    setSortDirection(booleanValue) {
        this.setState({ sortAscending: booleanValue })
    }

    createDataTable() {

        console.log("this.state.data", this.state)
        const node = this.node;



        var table = select(node).append('table');
        console.log("state data at createTable ", this.state)
        var titles = Object.keys(this.state.data[0]);
        console.log("Row Headers obtained from data", titles)


        var headers = table.append('thead').append('tr')
            .selectAll('th')
            .data(titles).enter()
            .append('th')
            .text(function (d) {
                return d;
            }).on('click', (i, d) => {

                var sortAcending = this.getSortDirection();

                var headers = select(this.node).selectAll(' thead tr th');
                headers.attr('class', 'header');

                var rows = select(this.node).selectAll("tbody tr");
                console.log("rows", rows);
                console.log("d parameter", d);
                console.log("i param", i);


                if (sortAcending) {

                    rows.sort(function (a, b) { return b[d] < a[d]; });

                    this.setSortDirection(false);
                    i.originalTarget.className = 'aes';
                } else {
                    rows.sort((a, b) => { return b[d] > a[d]; });
                    this.setSortDirection(true);
                    i.originalTarget.className = 'des';
                }
            });

        var rows = table.append('tbody').selectAll('tr')
            .data(this.state.data).enter()
            .append('tr');
        rows.selectAll('td')
            .data(function (d) {
                return titles.map(function (k) {
                    return { 'value': d[k], 'name': k };
                });
            }).enter()
            .append('td')
            .attr('data-th', function (d) {
                return d.name;
            })
            .text(function (d) {
                return d.value;
            });

        this.setState({ rows: rows });

    }

     
    componentDidMount() {

        this.createDataTable();

    }
    componentDidUpdate() {

    }


    render() {
        return (
            <div id="page-wrap" ref={node => this.node = node}>  </div>
        )
    }
};

export default DataTable;