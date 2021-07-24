import {
    Container,
    TextField,
    Typography,
} from "@material-ui/core";
import React from "react";
import { useParams } from "react-router-dom";
import {
    promiseFact,
    useFacts,
    useIndividual,
} from "./Firestore";
import { useUser } from "./UserContext";
import useStoryLocation from "./useStoryLocation";

function Fact({fact}) {
    return <pre>{fact.id}
        {JSON.stringify(fact.data(), null, 3)}</pre>
}

function NewFact({doc, storyLocation}) {
    const [fact, setFact] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    const handleChange = e =>
        setFact(e.target.value);

    const handleSubmit = e => {
        e.preventDefault();
        if (!fact.trim()) {
            setFact("");
            return;
        }
        setSaving(true);
        promiseFact(doc, fact, storyLocation)
            .then(() => setFact(""))
            .finally(() => setSaving(false));
    };

    return <form
        onSubmit={handleSubmit}
    >
        <TextField
            fullWidth
            variant={"outlined"}
            size={"small"}
            placeholder={"Add note..."}
            disabled={saving}
            value={fact}
            onChange={handleChange}
        />
    </form>;
}

function Facts({doc}) {
    const user = useUser();
    const [storyLocation] = useStoryLocation();
    const facts = useFacts(doc.id, storyLocation);

    return <React.Fragment>
        {user.canWrite && <NewFact doc={doc} />}
        {facts.docs.map(f => <Fact
            key={f.id}
            fact={f}
        />)}
    </React.Fragment>;
}

function Individual() {
    const {id} = useParams();
    const doc = useIndividual(id);

    return <Container>
        {doc.exists
            ? <React.Fragment>
                <Typography variant={"h4"}
                            component={"h1"}>{doc.get("title")}</Typography>
                <pre>{JSON.stringify({
                    id: doc.id,
                    data: doc.data(),
                }, null, 3)}</pre>
                <Facts doc={doc} />
            </React.Fragment>
            : `Unknown '${id}'`}
    </Container>;
}

export default Individual;
