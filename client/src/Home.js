import React from "react";

function Home() {
    return <React.Fragment>
        {[...new Array(12)].map((n, i) =>
        <div key={i}>
            <h2>Why Hello!</h2>
            <p>You look great, by the way. Very healthy.</p>
        </div>)}
    </React.Fragment>;
}

export default Home;
