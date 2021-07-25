import {
    Chip,
    Container,
    Grid,
    IconButton,
    List,
    ListItem,
    makeStyles,
    Paper,
    TextField,
    Typography,
} from "@material-ui/core";
import {
    Add as AddIcon,
    Close as CloseIcon,
} from "@material-ui/icons";
import React from "react";
import {
    Link,
    useHistory,
    useParams,
} from "react-router-dom";
import { firestore } from "./firebase";
import {
    promiseFact,
    promiseIndividual,
    useDocSnapshot,
    useFacts,
    useIndividual,
    useQuerySnapshot,
    useTitleSearch,
} from "./Firestore";
import { useUser } from "./UserContext";
import useStoryLocation from "./useStoryLocation";

function getSearchString(str, cursor) {
    for (let i = cursor - 1; i >= 0; i--) {
        const c = str.charAt(i);
        if (c === ']') return;
        if (c === '[') {
            const start = i;
            const text = str.substring(i + 1, cursor);
            let end = str.length;
            for (i = cursor; i < str.length; i++) {
                const c = str.charAt(i);
                if (c === ' ') {
                    // end at first space by default
                    end = Math.min(i, end);
                }
                if (c === '[') {
                    // if we hit another injection, we're too far
                    break;
                }
                if (c === ']') {
                    // explicit end, so use that
                    end = i + 1;
                    break;
                }
            }
            return {
                start,
                text,
                end,
            }
        }
    }
}

function Suggest({
                     search: {
                         start, end, text,
                     },
                     onSelect,
                 }) {
    const matches = useTitleSearch(text);
    if (matches.empty) return null;

    const handleClick = d =>
        onSelect && onSelect(start, end, d.id);

    return <List>
        {matches.docs.map(d =>
            <ListItem
                key={d.id}
                onClick={() => handleClick(d)}
            >
                {d.get("title")}
            </ListItem>)}
    </List>;
}

const useLinkStyles = makeStyles(theme => ({
    root: {
        color: "inherit",
        textDecorationStyle: "dotted",
        textDecorationThickness: "1px",
        textDecorationColor: theme.palette.text.disabled,
    },
}));

function IndividualLink({id}) {
    const classes = useLinkStyles();
    const snap = useIndividual(id);
    return <Link
        className={classes.root}
        to={`/i/${id}`}
    >
        {snap.get("title") || id}
    </Link>;
}

function IndividualChip({id}) {
    const history = useHistory();
    const snap = useIndividual(id);
    return <Chip
        size={"small"}
        variant={"outlined"}
        label={snap.get("title") || id}
        onClick={() => history.push(`/i/${id}`)}
    />;
}

function factRenderParts(text) {
    const RE_REF = /\[([^\]]+)]/g; // DUPLICATED!
    let curr = 0;
    const parts = [];
    let match;
    while ((match = RE_REF.exec(text))) {
        if (curr < match.index) {
            parts.push(text.substring(curr, match.index));
        }
        parts.push(<IndividualLink
            key={curr}
            id={match[1]}
        />); // the ID
        curr = match.index + match[0].length;
    }
    if (curr < text.length) {
        parts.push(text.substr(curr));
    }
    return parts;
}

function Fact({snap, component = "li"}) {
    const parts = factRenderParts(snap.get("fact"));
    return <Typography
        variant={"body1"}
        component={component}
    >
        {parts}
    </Typography>;
}

function FactRef({docRef, component = "li"}) {
    const snap = useDocSnapshot(docRef);
    const srcRef = React.useMemo(
        () => docRef?.parent?.parent,
        [docRef],
    );
    const src = useDocSnapshot(srcRef);
    let body;
    if (snap.isFetching || src.isFetching) {
        body = "...";
    } else {
        body = [
            <IndividualChip
                key={"src"}
                id={src.id}
            />,
            " ",
            ...factRenderParts(snap.get("fact")),
        ]
    }
    return <Typography
        variant={"body1"}
        component={component}
    >
        {body}
    </Typography>;
}

function Individual() {
    const {id} = useParams();
    const doc = useIndividual(id);
    const user = useUser();
    const [storyLocation] = useStoryLocation();
    const [open, setOpen] = React.useState(false);
    const [fact, setFact] = React.useState("");
    React.useEffect(() => {
        setOpen(false);
        setFact("");
    }, [id]);
    const inputRef = React.useRef();
    const [search, setSearch] = React.useState(null);
    const [saving, setSaving] = React.useState(false);
    const facts = useFacts(doc.id, storyLocation);
    React.useEffect(
        () => {
            if (!facts.isFetching && facts.empty && !open) {
                setOpen(true);
            }
        },
        // deliberately don't want to retrigger if the user acts
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [facts.isFetching, facts.empty],
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

    const queueCompletionProcessing = e => {
        const {
            value,
            selectionStart,
            selectionEnd,
        } = e.target;
        if (selectionStart === selectionEnd) {
            setSearch(getSearchString(value, selectionStart));
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

    const handleSelectSuggestion = (start, end, text) => {
        const prefix = fact.substr(0, start);
        const suffix = fact.substr(end);
        inputRef.current.focus();
        inputRef.current.setRangeText(`[${text}]`, start, end, "end");
        setFact(`${prefix}[${text}]${suffix}`);
        setSearch(null);
    };

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
                {user.canWrite && <IconButton
                    onClick={open ? handleClose : handleOpen}
                    style={{float: "right"}}
                >
                    {open ? <CloseIcon /> : <AddIcon />}
                </IconButton>}
                <Typography
                    variant={"h4"}
                    component={"h1"}
                >
                    {doc.get("title")}
                </Typography>
                {user.canWrite && open && <Paper
                    elevation={2}
                >
                    <form
                        onSubmit={handleSubmit}
                    >
                        <TextField
                            inputRef={inputRef}
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
                        {search && search.text && <Suggest
                            search={search}
                            onSelect={handleSelectSuggestion}
                        />}
                    </form>
                </Paper>}
                <ul>
                    {facts.docs.map(f => f.get("_ref")
                        ? <FactRef
                            key={f.id}
                            docRef={f.get("_ref")}
                        />
                        : <Fact
                            key={f.id}
                            snap={f}
                        />)}
                </ul>
            </React.Fragment>
            : user.canWrite
                ? <Unknown
                    id={id}
                    storyLocation={storyLocation}
                />
                : <Typography
                    variant={"h4"}
                    component={"h1"}
                >
                    '{id}' Not Found
                </Typography>}
    </Container>;
}

function Unknown({id, storyLocation}) {
    const [title, setTitle] = React.useState(id);
    return <form onSubmit={e => {
        e.preventDefault();
        promiseIndividual(title, storyLocation);
    }}>
        <Grid container alignItems={"center"}>
            <Grid item>
                <TextField
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </Grid>
            <Grid item>
                ...doesn't exist?
            </Grid>
        </Grid>
    </form>;
}

export default Individual;
