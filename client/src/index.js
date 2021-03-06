import {
    AppBar,
    Card,
    CardContent,
    Container,
    CssBaseline,
    Toolbar,
    Typography,
} from "@material-ui/core";
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
import React from 'react';
import ReactDOM from 'react-dom';
// import './load_books';
import {
    BrowserRouter,
    Route,
    Switch,
} from "react-router-dom";
import Book from "./Book";
import Chapter from "./Chapter";

import firebase, { auth } from "./firebase";
import Header from "./Header";
import Home from "./Home";
import Individual from "./Individual";
import { UserProvider } from "./UserContext"

function App({user}) {
    return <UserProvider value={user}>
        <CssBaseline />
        {user
            ? <BrowserRouter>
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
            </BrowserRouter>
            : <React.Fragment>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6">
                            Sign In
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Container>
                    <Card elevation={2}>
                        <CardContent>
                            First sign in below, then you can browse my <em>The
                            Wheel of Time</em> notes.
                        </CardContent>
                    </Card>
                </Container>
            </React.Fragment>}
    </UserProvider>;
}

const ui = new firebaseui.auth.AuthUI(auth);
auth.onAuthStateChanged(function (user) {
    if (user) {
        user.canWrite = user.email === "bboisvert@gmail.com";
    }
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
