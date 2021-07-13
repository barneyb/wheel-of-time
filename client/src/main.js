import { CssBaseline, Button } from "@material-ui/core";
import update from './update.js';
import React from 'react';
import ReactDOM from 'react-dom';
// import './load_books';

update();

function App() {
    return <React.Fragment>
        <CssBaseline />
        <Button variant="contained" color="primary">
            Hello World
        </Button>
    </React.Fragment>
    ;
}

ReactDOM.render(<App />, document.querySelector('#app'));
