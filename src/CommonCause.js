import React, { Component } from 'react';
import './App.css';
import { emissionData } from './emissionData.js'
import Analytics from './Analytics'
import { Card, Feed, Container } from 'semantic-ui-react'
import DataTable from './DataTable';
import { ViewConfig } from './ViewConfig';
class CommonCause extends Component {
    constructor(props) {
        super(props);

        console.log("running Constructor");


        var data = {};
        if (!this.props.data) {
            data = emissionData.emissionData;
        } else {
            data = this.props.data;
        }

        switch (this.props.mode) {
            case ViewConfig.probability:
                let newSet = Analytics.findFrequency(data, "reason");
                this.state = { data: newSet };
                break;
            case ViewConfig.combination:
                let newSet2 = Analytics.findCombination(data, "reason");
                this.state = { data: newSet2 };
                break;
        }

    }

    componentDidMount() {

    }
    componentDidUpdate() {

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

export default CommonCause;