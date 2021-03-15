import React from 'react';

class PrettyPrintJson extends React.Component {
    render() {
         // data could be a prop for example
         // const { data } = this.props;
         return (<div><pre>{JSON.stringify(this.props.data, null, 2) }</pre></div>);
    }
}

export default PrettyPrintJson;