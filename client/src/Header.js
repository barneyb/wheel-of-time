import {
    AppBar,
    IconButton,
    makeStyles,
    Toolbar,
    Typography,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import React from "react";
import Search from "./Search";
import StoryLocation from "./StoryLocation";

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
    const [open, setOpen] = React.useState(false);

    return <AppBar position="static">
        <Toolbar>
            {open
                ? <Search
                    onBlur={() => setTimeout(() => setOpen(false), 100)}
                />
                : <Typography
                    variant="h6"
                    className={classes.title}
                >
                    <StoryLocation />
                </Typography>
            }
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
