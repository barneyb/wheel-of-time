import { Typography } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router-dom";
import { useIndividual } from "./Firestore";

function Individual() {
    const {id} = useParams();
    const q = useIndividual(id);
    if (q.isError) {
        return <Typography>
            {q.error.message || ("" + q.error)}
        </Typography>;
    }
    const {
        data: doc,
    } = q;
    return <div>Individual {id}
        <pre>{JSON.stringify(doc, null, 3)}</pre>
    </div>;
}

export default Individual;
