import { Button } from "@material-ui/core";
import React from "react";
import { auth } from "./firebase";
import { useUser } from "./UserContext";

function Home() {
    const user = useUser();
    const name = user?.displayName;
    return <React.Fragment>
        <div>
            <h2>Why Hello{name && `, ${name}`}!</h2>
            <p>You look great, by the way. Very healthy.</p>
        </div>
        {user && <Button variant={"contained"} color={"secondary"}
                         onClick={() => auth.signOut()}>
            SIGN OUT
        </Button>}
        {/*<pre>info: {JSON.stringify(useUserInfo()[0], null, 3)}</pre>*/}
        {/*<pre>user: {JSON.stringify(user, null, 3)}</pre>*/}
    </React.Fragment>;
}

export default Home;
