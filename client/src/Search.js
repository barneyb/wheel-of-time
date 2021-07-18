import {
    alpha,
    makeStyles,
    TextField,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";

const EMPTY_ARRAY = [];

const useStyles = makeStyles((theme) => ({
    autocomplete: {
        width: "100%",
    },
    textField: {
        color: theme.palette.common.white,
        width: "100%",
        padding: theme.spacing(1, 2),
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
    },
    input: {
        color: theme.palette.common.white,
    },
}));

function Search({
                    onBlur,
                }) {
    const classes = useStyles();
    const [value, setValue] = React.useState("");

    const handleInputChange = e =>
        setValue(e.target.value || "");

    const handleBlur = () => {
        setValue("");
        onBlur && onBlur();
    }

    // const {
    //     data: options,
    //     isFetching,
    // } = useTitleSearch(value);
    const options = EMPTY_ARRAY

    return <Autocomplete
        className={classes.autocomplete}
        freeSolo
        inputValue={value}
        onInputChange={handleInputChange}
        options={options.map((option) => option.id)}
        renderInput={({InputProps, ...params}) => (
            <TextField {...params}
                       InputProps={{
                           ...InputProps,
                           className: classes.input,
                       }}
                       variant="standard"
                       autoFocus
                       placeholder="Search…"
                       className={classes.textField}
                       onBlur={handleBlur}
            />
        )}
    />;
}

export default Search;
