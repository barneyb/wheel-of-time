import {
    AppBar,
    IconButton,
    makeStyles,
    Toolbar,
    Typography,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import React from "react";
import { useHistory } from "react-router-dom";
import { promiseIndividual } from "./Firestore";
import Search from "./Search";
import StoryLocation from "./StoryLocation";
import { useUser } from "./UserContext";
import useStoryLocation from "./useStoryLocation";

const useStyles = makeStyles((theme) => ({
    title: {
        flexGrow: 1,
        whiteSpace: "nowrap",
        overflow: "auto",
    },
    searchButton: {
        marginLeft: theme.spacing(2),
    },
}));

function Header() {
    const classes = useStyles();
    const history = useHistory();
    const [open, setOpen] = React.useState(false);
    const [storyLocation] = useStoryLocation();
    const user = useUser();

    if (!user) {
        return <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">
                    Log In
                </Typography>
            </Toolbar>
        </AppBar>
    }

    return <AppBar position="static">
        <Toolbar>
            <Typography
                variant="h6"
                className={classes.title}
                style={{
                    display: open ? "none" : "block",
                }}
            >
                <StoryLocation />
            </Typography>
            {open && <Search
                onBlur={() => setTimeout(() => setOpen(false), 100)}
                onSelect={id => {
                    history.push(`/i/${id}`, {id});
                    setOpen(false);
                }}
                onNav={path => history.push(path)}
                onCreate={user.canWrite ? title => {
                    promiseIndividual(title, storyLocation)
                        .then(ref => history.push(
                            `/i/${ref.id}`,
                            {id: ref.id},
                        ));
                    setOpen(false);
                } : undefined}
            />}
            <IconButton edge="end"
                        className={open ? undefined : classes.searchButton}
                        color="inherit" aria-label="search"
                        onClick={() => setOpen(o => !o)}>
                <SearchIcon />
            </IconButton>
        </Toolbar>
    </AppBar>;
}

export default Header;
