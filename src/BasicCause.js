import React, { Component } from 'react';
import './App.css';
import { emissionData } from './emissionData.js'
import Analytics from './Analytics'
import { Card, Feed, Container } from 'semantic-ui-react'
import DataTable from './DataTable';
import { ViewConfig } from './ViewConfig';
class BasicCause extends Component {
    constructor(props) {
        super(props);

        


        let data = {};
        if (!this.props.data) {
            data = JSON.parse(JSON.stringify(emissionData.emissionData));
        } else {
            data = this.props.data;

        }
 
        data =  Analytics.findlikeliestCause(data, this.props.reach,"reason");
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

export default BasicCause;