import './App.css';
import BarChart from './BarChart.js';
import WorldMap from './WorldMap.js';
import React from 'react';
import 'semantic-ui-css/semantic.min.css'
import { ViewConfig } from './ViewConfig'
import DataTable from './DataTable.js';
import {
  Grid,
  Menu,
  Segment,
  Sidebar,
  Container
} from 'semantic-ui-react';
import { select } from 'd3-selection';

import BeautifyData from './emission/BeautifyData'
import { emissionData } from './emissionData.js'
import SimpleProbability from './SimpleProbability';
import Combination from './Combination';
import BasicCause from './BasicCause';
import ParetoDragiam from './ParetoDiagram';
import { Period } from './Period.js';
import Analytics from './Analytics';
import Longest from './longest';

class App extends React.Component {



  constructor(props) {
    super(props);

    var data = emissionData.emissionData;

    this.state = { activeItem: {}, sidebarButtonToggleState: true, data: BeautifyData.addDateTimeFromMillis(data), chosenSelection: undefined };

  }

  handleItemClick = (e, { name }) => {
    this.setState({ activeItem: name })
  }



  render() {
    const { activeItem } = this.state;
    let content = <Container>Nothing selected yet</Container>;

    const reach = Period.Day * 3; //setting rootcause to be calculcated based on 3 days

    console.log("activeItem chosen " + ViewConfig.ParetoDiagram, activeItem);

    if (activeItem === ViewConfig.BarChart) {
      //    let frequency =  Analytics.findFrequencyPerPeriod(this.state.data,(d)=>{ return d.Start;} , Period.Day*7, (d)=>{ return d.Reason})
      content = <BarChart data={[10, 4, 1, 3, 5]} dataCallBack={(d) => d.length} size={[1000, 1000]} />;
    }
    else if (activeItem === ViewConfig.WorldMap) {
      content = <WorldMap></WorldMap>
    } else if (activeItem === ViewConfig.DataTable) {
      content = <DataTable data={this.state.data}></DataTable>
    } else if (activeItem === ViewConfig.probability) {
      content = <SimpleProbability   ></SimpleProbability>
    } else if (activeItem === ViewConfig.combination) {
      content = <Combination></Combination>
    } else if (activeItem === ViewConfig.basicCause) {
      content = <BasicCause reach={reach}></BasicCause>
    } else if (activeItem === ViewConfig.ParetoDiagram) {
      const self = this;
      function handleMouseOver2(d, i) {  // Add interactivity

        self.setState(i);
     
      }
      content = <Container><ParetoDragiam data={emissionData.emissionData} margin={{ top: 50, right: 0, bottom: 150, left: 150 }} width={1000} height={1000} reach={reach} onClick={handleMouseOver2}></ParetoDragiam></Container>
    }else if (activeItem === ViewConfig.LongestEntry){
      content = <Longest data={this.state.data}></Longest>
    }


    return (
      <div>
        <div className='App-header'>
          <h2>Emission</h2>

        </div>
        <Grid columns={2}>

          <Grid.Column>
            <Sidebar.Pushable as={Segment}>
              <Sidebar
                as={Menu}
                animation='slide out'
                icon='labeled'
                width="wide"
                vertical
                inverted
                visible={this.state.sidebarButtonToggleState}>
                <Menu vertical inverted>
                  <Menu.Item
                    name='BarChart'
                    active={activeItem === ViewConfig.BarChart}
                    onClick={this.handleItemClick}
                  />

                  <Menu.Item
                    name='WorldMap'
                    active={activeItem === ViewConfig.WorldMap}
                    onClick={this.handleItemClick}
                  />

                  <Menu.Item
                    name='DataTable'
                    active={activeItem === ViewConfig.DataTable}
                    onClick={this.handleItemClick}
                  />

                  <Menu.Item
                    name='Probability'
                    active={activeItem === ViewConfig.probability}
                    onClick={this.handleItemClick}
                  />


                  <Menu.Item
                    name='Combination'
                    active={activeItem === ViewConfig.combination}
                    onClick={this.handleItemClick}
                  />


                  <Menu.Item
                    name='LongestEntry'
                    active={activeItem === ViewConfig.LongestEntry}
                    onClick={this.handleItemClick}
                  />

                  <Menu.Item
                    name='basicCause'
                    active={activeItem === ViewConfig.basicCause}
                    onClick={this.handleItemClick}
                  />
                  <Menu.Item
                    name='ParetoDiagram'
                    active={activeItem === ViewConfig.ParetoDiagram}
                    onClick={this.handleItemClick}
                  />

                </Menu>
              </Sidebar>

              <Sidebar.Pusher className="pusher">
                <Segment basic style={{ minHeight: 200, maxheight: 500 }}>


                  <div className='App-body'>
                    {content}
                  </div>
                </Segment>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Grid.Column>
          <Grid.Column>
            <Container>hallais</Container>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default App;
