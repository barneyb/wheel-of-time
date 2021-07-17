import {
    AppBar,
    IconButton,
    makeStyles,
    Toolbar,
    Typography,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";
import React from "react";
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
    return <AppBar position="static">
        <Toolbar>
            <Typography
                variant="h6"
                className={classes.title}
            >
                <StoryLocation />
            </Typography>
            <IconButton edge="end" className={classes.searchButton}
                        color="inherit" aria-label="search">
                <SearchIcon />
            </IconButton>
        </Toolbar>
    </AppBar>;
}

export default Header;
