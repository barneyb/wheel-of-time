import {
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
} from "@material-ui/core";
import React from "react";
import { auth } from "./firebase";
import { useUser } from "./UserContext";

function Home() {
    const user = useUser();
    const name = user?.displayName;
    return <Container>
        {user && <Button variant={"contained"} color={"secondary"}
                         onClick={() => auth.signOut()}
                         style={{float: "right"}}>
            SIGN OUT
        </Button>}
        <Typography variant="h5">
            Why Hello{name && `, ${name}`}!
        </Typography>
        <Typography>
            You look great, by the way. Very healthy.
        </Typography>
        <Grid container spacing={1}>
            <Grid item xs={12} sm={4}>
                <Card elevation={2}>
                    <CardContent>
                        Click the book abbreviation or chapter title in the
                        top left to indicate where you are in the series. This
                        prevents spoilers!
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card elevation={2}>
                    <CardContent>
                        Click the search icon in the top right to find
                        information. Right now it's case-sensitive prefix
                        search, which is lame-sauce. "Ran" will work, but "ran"
                        or "Thor" will not.
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card elevation={2}>
                    <CardContent>
                        Search "Home" to get back to this page.
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        {/*<pre>info: {JSON.stringify(useUserInfo()[0], null, 3)}</pre>*/}
        {/*<pre>user: {JSON.stringify(user, null, 3)}</pre>*/}
    </Container>;
}

export default Home;
