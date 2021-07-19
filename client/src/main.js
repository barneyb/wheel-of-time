import {
    AppBar,
    CssBaseline,
    Toolbar,
    Typography,
} from "@material-ui/core";
import React from 'react';
import ReactDOM from 'react-dom';
// import './load_books';
import {
    QueryClient,
    QueryClientProvider,
} from 'react-query'
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
import { UserProvider } from "./UserContext"

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

function App({user}) {
    return <QueryClientProvider client={queryClient}>
        <UserProvider value={user}>
            <BrowserRouter>
                <CssBaseline />
                <React.Fragment>
                    {user
                        ? <Header />
                        : <AppBar position="static">
                            <Toolbar>
                                <Typography variant="h6">
                                    Log In
                                </Typography>
                            </Toolbar>
                        </AppBar>
                    }
                    {user && <Switch>
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
                    </Switch>}
                </React.Fragment>
            </BrowserRouter>
        </UserProvider>
    </QueryClientProvider>;
}

const auth = firebase.auth();
const ui = new firebaseui.auth.AuthUI(auth);
auth.onAuthStateChanged(function (user) {
    ReactDOM.render(<App user={user} />, document.querySelector('#app'));
    if (!user) {
        ui.start('#firebaseui-auth-container', {
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            ],
            callbacks: {
                // don't redirect; rerendering <App /> is enough
                signInSuccessWithAuthResult: () => false,
            },
        });
    }
}, function (error) {
    console.log(error);
});
