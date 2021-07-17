import {
    Button,
    CssBaseline,
    Typography,
} from "@material-ui/core";
import React from 'react';
import ReactDOM from 'react-dom';
// import './load_books';
import {
    QueryClient,
    QueryClientProvider,
} from 'react-query'
import Header from "./Header";

// Create a client
const queryClient = new QueryClient()

function App() {
    const [domReady, setDomReady] = React.useState(false);
    React.useEffect(() => {
        if (document.readyState !== "loading") {
            setDomReady(true);
            return;
        }
        function cleanup() {
            document.removeEventListener('readystatechange', listener);
        }

        function listener() {
            cleanup();
            setDomReady(true);
        }

        document.addEventListener('readystatechange', listener);
        return cleanup;
    }, [])
    return <QueryClientProvider client={queryClient}>
        <CssBaseline />
        {domReady ? <React.Fragment>
            <Header />
            <div>
                <h2>Why Hello!</h2>
                <p>You look great, by the way. Very healthy.</p>
            </div>
            <Button variant="contained" color="primary">
                Hello World
            </Button>
        </React.Fragment> : <Typography>Hang tight...</Typography> }
    </QueryClientProvider>;
}

ReactDOM.render(<App />, document.querySelector('#app'));
