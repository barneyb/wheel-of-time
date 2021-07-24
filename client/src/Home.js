import { Button } from "@material-ui/core";
import React from "react";
import { auth } from "./firebase";
import {
    useUser,
    useUserInfo,
} from "./UserContext";

function Home() {
    const user = useUser();
    const [info] = useUserInfo();
    return <React.Fragment>
        {user && <Button variant={"contained"} color={"secondary"}
                         onClick={() => auth.signOut()}>
            SIGN OUT
        </Button>}
        <div>
            <h2>Why Hello!</h2>
            <p>You look great, by the way. Very healthy.</p>
        </div>
        <pre>info: {JSON.stringify(info, null, 3)}</pre>
        <pre>user: {JSON.stringify(user, null, 3)}</pre>
    </React.Fragment>;
}

export default Home;
