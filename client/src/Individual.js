import {
    Container,
    Typography,
} from "@material-ui/core";
import React from "react";
import { useParams } from "react-router-dom";
import { useIndividual } from "./Firestore";

function Individual() {
    const {id} = useParams();
    const doc = useIndividual(id);

    return <Container>
        <Typography variant={"h2"}>{doc.get("title")}</Typography>
        {doc.exists
            ? <pre>{JSON.stringify({
                id: doc.id,
                data: doc.data(),
            }, null, 3)}</pre>
            : `Unknown '${id}'`}
    </Container>;
}

export default Individual;
