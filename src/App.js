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
} from 'semantic-ui-react'
import CommonCause from './CommonCause';
import BeautifyData from './emission/BeautifyData'
import { emissionData } from './emissionData.js'


class App extends React.Component {


  constructor(props) {
    super(props);

    var data = emissionData.emissionData;

    this.state = { activeItem:{}, sidebarButtonToggleState: true, data: BeautifyData.addDateTimeFromMillis(data) };

  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state;
    let content=<Container>Nothing selected yet</Container>;

    console.log("activeItem chosen " +(activeItem === ViewConfig.probability), activeItem);
    if (activeItem === ViewConfig.BarChart)
      content = <BarChart data={[5, 10, 1, 3]} size={[2000, 500]} />;
    else if (activeItem === ViewConfig.WorldMap) {
      content = <WorldMap></WorldMap>
    } else if (activeItem === ViewConfig.DataTable) {

      content = <DataTable data={this.state.data}></DataTable>
    } else if (activeItem === ViewConfig.probability) {
      console.log("yoohoo");
      content = <CommonCause mode={ViewConfig.probability}  ></CommonCause>
    } else if (activeItem === ViewConfig.combination) {
      content = <CommonCause mode={ViewConfig.combination}></CommonCause>
    }


    return (
      <div>
        <Grid columns={1}>

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
                </Menu>
              </Sidebar>

              <Sidebar.Pusher className="pusher">
                <Segment basic style={{ minHeight: 200, maxheight: 500 }}>
                  <div className='App-header'>
                    <h2>Emission</h2>

                  </div>

                  <div className='App-body'>
                    {content}
                  </div>
                </Segment>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default App;
