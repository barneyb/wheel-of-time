import {
    alpha,
    makeStyles,
    TextField,
} from "@material-ui/core";
import {
    Autocomplete,
    createFilterOptions,
} from "@material-ui/lab";
import React from "react";
import { useTitleSearch } from "./Firestore";

const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
    autocomplete: {
        width: "100%",
    },
    textField: {
        width: "100%",
        padding: theme.spacing(1, 2),
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    input: {
        color: theme.palette.common.white,
    },
}));

function Search({
                    onBlur,
                    onCreate,
                    onSelect,
                }) {
    const classes = useStyles();
    const [value, setValue] = React.useState("");

    const handleSelect = (e, value) => {
        if (!value) return;
        if (typeof value === "string") {
            // hit ENTER
            onCreate && onCreate(value);
            return;
        }
        if (value.inputValue) {
            // picked the Add "xxx" option
            onCreate && onCreate(value.inputValue);
            return;
        }
        // a normal one
        onSelect && onSelect(value.id);
    }

    const handleInputChange = (e, value) =>
        setValue(value);

    const handleBlur = () => {
        setValue("");
        onBlur && onBlur();
    }

    const matches = useTitleSearch(value);

    return <Autocomplete
        className={classes.autocomplete}
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        clearOnEscape
        inputValue={value}
        onInputChange={handleInputChange}
        renderInput={({InputProps, ...params}) => (
            <TextField
                {...params}
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
        options={matches.docs}
        filterOptions={(options, params) => {
            const filtered = filter(options, params);

            // Suggest the creation of a new value
            if (onCreate && params.inputValue.length >= 2 && !filtered.some(o => o.get(
                "title") === params.inputValue)) {
                filtered.push({
                    inputValue: params.inputValue,
                });
            }

            return filtered;
        }}
        getOptionLabel={(option) => {
            if (typeof option === "string") {
                // hit ENTER in the field
                return option;
            }
            // dynamic Add "xxx" above
            if (option.inputValue) {
                return option.inputValue;
            }
            // a "normal" one
            return option.get("title");
        }}
        renderOption={(option) => option.inputValue ? `Add "${option.inputValue}"` : option.get(
            "title")}
        onChange={handleSelect}
    />;
}

export default Search;
