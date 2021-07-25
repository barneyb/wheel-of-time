import {
    Chip,
    Container,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    makeStyles,
    Paper,
    TextField,
    Typography,
} from "@material-ui/core";
import {
    Add as AddIcon,
    Close as CloseIcon,
    Edit as EditIcon,
} from "@material-ui/icons";
import React from "react";
import {
    Link,
    useHistory,
    useParams,
} from "react-router-dom";
import {
    promiseFactUpdate,
    promiseIndividual,
    promiseNewFact,
    useDocSnapshot,
    useFacts,
    useIndividual,
    useTitleSearch,
} from "./Firestore";
import RE_REF from "./RE_REF";
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
        textDecorationColor: theme.palette.info.main,
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

function IndividualChip({id, ...props}) {
    const history = useHistory();
    const snap = useIndividual(id);
    return <Chip
        label={snap.get("title") || id}
        onClick={() => history.push(`/i/${id}`)}
        {...props}
        size={"small"}
        variant={"outlined"}
    />;
}

function factRenderParts(text) {
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

function Fact({snap, canWrite, storyLocation}) {
    const [open, setOpen] = React.useState(false);
    const [fact, setFact] = React.useState(snap.get("fact"));
    React.useEffect(
        () => {
            setFact(snap.get("fact"))
        },
        [snap],
    )
    const [saving, setSaving] = React.useState(false);

    const handleOpen = e => {
        e.preventDefault();
        setOpen(true);
    };

    const handleCancel = () => {
        setOpen(false);
        setFact(snap.get("fact"));
    };

    const handleSubmit = () => {
        if (!fact.trim()) {
            setFact("");
            return;
        }
        setSaving(true);
        promiseFactUpdate(snap.ref, fact, storyLocation)
            .then(() => {
                setOpen(false);
            })
            .finally(() => setSaving(false));
    };

    return <ListItem
        variant={"body1"}
        alignItems={"flex-start"}
        divider
    >
        <ListItemText>
            {canWrite && open
                ? <EditFact
                    value={fact}
                    saving={saving}
                    onChange={setFact}
                    onCancel={handleCancel}
                    onCommit={handleSubmit}
                />
                : factRenderParts(fact)}
        </ListItemText>
        {canWrite && <ListItemSecondaryAction>
            <IconButton
                edge="end"
                aria-label="edit"
                onClick={open ? handleCancel : handleOpen}
            >
                {open ? <CloseIcon /> : <EditIcon />}
            </IconButton>
        </ListItemSecondaryAction>}
    </ListItem>;
}

const useRefStyles = makeStyles(theme => ({
    chip: {
        marginRight: theme.spacing(0.5),
    },
}))

function FactRef({docRef}) {
    const classes = useRefStyles();
    const snap = useDocSnapshot(docRef);
    const srcRef = React.useMemo(
        () => docRef?.parent?.parent,
        [docRef],
    );
    const fact = snap.get("fact");
    return <ListItem
        variant={"body1"}
        divider
    >
        <ListItemText>
            {srcRef?.id && <IndividualChip
                key={"src"}
                id={srcRef.id}
                className={classes.chip}
            />}
            {fact ? factRenderParts(fact) : "..."}
        </ListItemText>
    </ListItem>;
}

function EditFact({
                      value = "",
                      saving = false,
                      onChange,
                      onCommit,
                      onCancel,
                  }) {
    const inputRef = React.useRef();
    const [search, setSearch] = React.useState(null);

    const handleChange = e => {
        onChange && onChange(e.target.value);
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
            handleCancel(e)
        } else {
            queueCompletionProcessing(e);
        }
    }

    const handleSelectSuggestion = (start, end, text) => {
        const prefix = value.substr(0, start);
        const suffix = value.substr(end);
        inputRef.current.focus();
        inputRef.current.setRangeText(`[${text}]`, start, end, "end");
        onChange && onChange(`${prefix}[${text}]${suffix}`);
        setSearch(null);
    };

    const handleCancel = e => {
        e.preventDefault();
        onCancel && onCancel();
    };

    const handleSubmit = e => {
        e.preventDefault();
        onCommit && onCommit();
    };

    return <form
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
            value={value}
            multiline
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            onClick={queueCompletionProcessing}
        />
        {search && search.text && <Suggest
            search={search}
            onSelect={handleSelectSuggestion}
        />}
    </form>;
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

    const handleCancel = () => {
        setOpen(false);
        setFact("");
    };

    const handleSubmit = () => {
        if (!fact.trim()) {
            setFact("");
            return;
        }
        setSaving(true);
        promiseNewFact(doc.id, fact, storyLocation)
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
                    onClick={open ? handleCancel : handleOpen}
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
                    <EditFact
                        value={fact}
                        saving={saving}
                        onChange={setFact}
                        onCancel={handleCancel}
                        onCommit={handleSubmit}
                    />
                </Paper>}
                <List
                    dense
                >
                    {facts.docs.map(f => f.get("_ref")
                        ? <FactRef
                            key={f.id}
                            docRef={f.get("_ref")}
                        />
                        : <Fact
                            key={f.id}
                            snap={f}
                            canWrite={user.canWrite}
                            storyLocation={storyLocation}
                        />)}
                </List>
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
    const history = useHistory();
    const [title, setTitle] = React.useState(id);

    const handleSubmit = e => {
        e.preventDefault();
        promiseIndividual(title, storyLocation)
            .then(ref => history.push(
                `/i/${ref.id}`,
                {id: ref.id},
            ));
    }

    const handleKeyUp = e => {
        if (e.key === "Enter") {
            handleSubmit(e);
        }
    }

    return <form onSubmit={handleSubmit}>
        <Grid container alignItems={"center"}>
            <Grid item>
                <TextField
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyUp={handleKeyUp}
                />
            </Grid>
            <Grid item>
                ...doesn't exist?
            </Grid>
        </Grid>
    </form>;
}

export default Individual;
