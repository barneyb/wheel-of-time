import {
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
import { ReactQueryDevtools } from "react-query/devtools";
import {
    BrowserRouter,
    Route,
    Switch,
} from "react-router-dom";
import Book from "./Book";
import Chapter from "./Chapter";
import Header from "./Header";
import Home from "./Home";
import Individual from "./Individual";

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            keepPreviousData: true,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

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
        <BrowserRouter>
            <CssBaseline />
            {domReady
                ? <React.Fragment>
                    <Header />
                    <Switch>
                        <Route exact path="/">
                            <Home />
                        </Route>
                        <Route exact path="/b/:id">
                            <Book />
                        </Route>
                        <Route path="/b/:bookId/c/:id">
                            <Chapter />
                        </Route>
                        <Route exact path="/i/:id">
                            <Individual />
                        </Route>
                    </Switch>
                </React.Fragment>
                : <Typography>Hang tight...</Typography>}
        </BrowserRouter>
    </QueryClientProvider>;
}

ReactDOM.render(<App />, document.querySelector('#app'));
