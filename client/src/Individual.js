import {
    Box,
    Container,
    debounce,
    Grid,
    IconButton,
    TextField,
    Typography,
} from "@material-ui/core";
import {
    Add as AddIcon,
    Close as CloseIcon,
} from "@material-ui/icons";
import React from "react";
import { useParams } from "react-router-dom";
import {
    promiseFact,
    useFacts,
    useIndividual,
} from "./Firestore";
import { useUser } from "./UserContext";
import useStoryLocation from "./useStoryLocation";

function getSearchString(str, cursor) {
    for (let i = cursor - 1; i >= 0; i--) {
        const c = str.charAt(i);
        if (c === ']') return;
        if (c === '[') {
            return str.substring(i + 1, cursor);
        }
    }
}

function Individual() {
    const {id} = useParams();
    const doc = useIndividual(id);
    const user = useUser();
    const [storyLocation] = useStoryLocation();
    const [open, setOpen] = React.useState(false);
    const [fact, setFact] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const facts = useFacts(doc.id, storyLocation);
    React.useEffect(
        () => {
            if (!facts.isLoading && facts.empty && !open) {
                setOpen(true);
            }
        },
        // deliberately don't want to retrigger if the user acts
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [facts.isLoading, facts.empty],
    )

    const handleOpen = e => {
        e.preventDefault();
        setOpen(true);
    };

    const handleClose = e => {
        e.preventDefault();
        setOpen(false);
        setFact("");
    };

    const handleChange = e => {
        setFact(e.target.value);
        queueCompletionProcessing(e);
    };

    const doCompletions = debounce((value, selectionStart) => {
        console.log("SEARCH", getSearchString(value, selectionStart))
    }, 300);

    const queueCompletionProcessing = e => {
        const {
            value,
            selectionStart,
            selectionEnd,
        } = e.target;
        if (selectionStart === selectionEnd) {
            doCompletions(value, selectionStart);
        }
    };

    const handleKeyUp = e => {
        if (e.key === "Enter") {
            handleSubmit(e);
        } else if (e.key === "Escape") {
            handleClose(e);
        } else {
            queueCompletionProcessing(e);
        }
    }

    const handleSubmit = e => {
        e.preventDefault();
        if (!fact.trim()) {
            setFact("");
            return;
        }
        setSaving(true);
        promiseFact(doc.id, fact, storyLocation)
            .then(() => {
                setFact("");
                setOpen(false);
            })
            .finally(() => setSaving(false));
    };

    return <Container>
        {doc.exists
            ? <React.Fragment>
                <Grid container justifyContent={"space-between"}>
                    <Grid item>
                        <Typography
                            variant={"h4"}
                            component={"h1"}
                        >
                            {doc.get("title")}
                        </Typography>
                    </Grid>
                    {user.canWrite && <Grid item>
                        <IconButton
                            onClick={open ? handleClose : handleOpen}
                            style={{float: "right"}}
                        >
                            {open ? <CloseIcon /> : <AddIcon />}
                        </IconButton>
                    </Grid>}
                </Grid>
                {user.canWrite && open && <form
                    onSubmit={handleSubmit}
                >
                    <TextField
                        fullWidth
                        autoFocus
                        autoComplete={"off"}
                        variant={"outlined"}
                        size={"small"}
                        placeholder={"Add note..."}
                        disabled={saving}
                        value={fact}
                        multiline
                        onChange={handleChange}
                        onKeyUp={handleKeyUp}
                        onClick={queueCompletionProcessing}
                    />
                </form>}
                <ul>
                    {facts.docs.map(f => <Typography
                        key={f.id}
                        variant={"body1"}
                        component={"li"}
                    >
                        {f.get("fact")}
                    </Typography>)}
                </ul>
            </React.Fragment>
            :
            <Typography
                variant={"h4"}
                component={"h1"}
            >
                <Box
                    component={"span"}
                    fontFamily={"monospace"}
                >
                    {id}
                </Box>
                ? Huh?
            </Typography>}
    </Container>;
}

export default Individual;
