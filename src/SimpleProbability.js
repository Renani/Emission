import React, { Component } from 'react';
import './App.css';
import { emissionData } from './emissionData.js'
import Analytics from './Analytics'
import { Card, Feed, Container } from 'semantic-ui-react'
import DataTable from './DataTable';
import { ViewConfig } from './ViewConfig';
class SimpleProbability extends Component {
    constructor(props) {
        super(props);

        console.log("running Constructor");


        let data = {};
        if (!this.props.data) {
            data = emissionData.emissionData;
        } else {
            data = this.props.data;

        }

        data = Analytics.findFrequency(data, "reason");
        this.state = { data: data };


    }

 
    render() {
        return (
            <Container>
                <Container> Nr of rows {this.state.data.length} </Container>
                <DataTable data={this.state.data}></DataTable>
            </Container>

        )

    }
};

export default SimpleProbability;