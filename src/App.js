import logo from './logo.svg';
import './App.css';
import BarChart from './BarChart.js';
import WorldMap from './WorldMap.js';
import React from 'react';
import 'semantic-ui-css/semantic.min.css'
import { ViewConfig } from './ViewConfig'
import DataTable from './DataTable.js';
import {
  Checkbox,
  Grid,
  Header,
  Icon,
  Image,
  Menu,
  Segment,
  Sidebar,
  Button,
  SidebarPusher,
  List
} from 'semantic-ui-react'


class App extends React.Component {


  constructor(props) {
    super(props);
    this.state = { activeItem: ViewConfig.BarChart, sidebarButtonToggleState: true };
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state;
    if (activeItem === ViewConfig.BarChart)
      var content = <BarChart data={[5, 10, 1, 3]} size={[2000, 500]} />;
    else if (activeItem === ViewConfig.WorldMap) {
      var content = <WorldMap></WorldMap>
    } else if (activeItem === ViewConfig.DataTable) {
      var content = <DataTable></DataTable>
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
                </Menu>
              </Sidebar>

              <Sidebar.Pusher className="pusher">
                <Segment basic style={{ minHeight: 200, maxheight:500 }}>
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
