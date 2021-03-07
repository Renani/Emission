import React, { Component } from 'react';
import './App.css';
import emissionData from './emissionData.js'


class CommonCause extends Component {
    constructor(props) {
        super(props);
        this.createCommonCause = this.createCommonCause.bind(this)
        console.log("running Constructor");


        var data = {};
        if (!this.props.data) {
            data = emissionData.emissionData;
        } else {
            data = this.props.data;
        }
        this.state = { data: data }
    }

    componentDidMount() {
        
    }
    componentDidUpdate() {
        
    }

    
    findFrequency (){
        var enabledCount = data.reduce(
            (accumulator, currentValue) => accumulator.concat(currentValue), []
          ).filter(item => item.reason).length
    }
    findLongest(){

    }
    findlikeliestCause(){
       //gå igjennom hvert element EL1
       //Identifisert neste element (EL2) i liste,lag en array B ut av det og antall ganger det skjer.
       //for hvert element i array B, del antall ganger det skjer på frekvensen på EL1.
    }


    render() {
        return (
            <Card>
                <Card.Content>
                    <Card.Header>Recent Activity</Card.Header>
                </Card.Content>
                <Card.Content>
                    <Feed>
                        <Feed.Event>
                            <Feed.Label image='/images/avatar/small/jenny.jpg' />
                            <Feed.Content>
                                <Feed.Date content='1 day ago' />
                                <Feed.Summary>
                                    You added <a>Jenny Hess</a> to your <a>coworker</a> group.
                    </Feed.Summary>
                            </Feed.Content>
                        </Feed.Event>

                        <Feed.Event>
                            <Feed.Label image='/images/avatar/small/molly.png' />
                            <Feed.Content>
                                <Feed.Date content='3 days ago' />
                                <Feed.Summary>
                                    You added <a>Molly Malone</a> as a friend.
                    </Feed.Summary>
                            </Feed.Content>
                        </Feed.Event>

                        <Feed.Event>
                            <Feed.Label image='/images/avatar/small/elliot.jpg' />
                            <Feed.Content>
                                <Feed.Date content='4 days ago' />
                                <Feed.Summary>
                                    You added <a>Elliot Baker</a> to your <a>musicians</a> group.
                    </Feed.Summary>
                            </Feed.Content>
                        </Feed.Event>
                    </Feed>
                </Card.Content>
            </Card>

        )

    }
};

export default CommonCause;