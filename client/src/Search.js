import {
    alpha,
    CircularProgress,
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
                    onCreate,
                    onSelect,
                }) {
    const classes = useStyles();
    const [value, setValue] = React.useState("");

    const handleSelect = (e, value) => {
        if (typeof value === "string") {
            // hit ENTER
            onCreate && onCreate(value);
            return;
        }
        if (value && value.inputValue) {
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

    const {
        data: options,
        isFetching,
    } = useTitleSearch(value);

    return <Autocomplete
        className={classes.autocomplete}
        freeSolo
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        inputValue={value}
        onInputChange={handleInputChange}
        renderInput={({InputProps, ...params}) => (
            <TextField
                {...params}
                InputProps={{
                    ...InputProps,
                    endAdornment: isFetching
                        ? <CircularProgress color="inherit" size={20} />
                        : InputProps.endAdornment,
                    className: classes.input,
                }}
                variant="standard"
                autoFocus
                placeholder="Search…"
                className={classes.textField}
                onBlur={handleBlur}
            />
        )}
        options={options || []}
        filterOptions={(options, params) => {
            const filtered = filter(options, params);

            // Suggest the creation of a new value
            if (params.inputValue.length >= 2 && !filtered.some(o => o.data.title === params.inputValue)) {
                filtered.push({
                    inputValue: params.inputValue,
                    data: {
                        title: `Add "${params.inputValue}"`,
                    },
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
            return option.data.title;
        }}
        renderOption={(option) => option.data.title}
        onChange={handleSelect}
    />;
}

export default Search;
