import {
    alpha,
    makeStyles,
    SvgIcon,
    TextField,
} from "@material-ui/core";
import { ArrowForwardOutlined as ArrowForwardIcon } from "@material-ui/icons";
import {
    Autocomplete,
    createFilterOptions,
} from "@material-ui/lab";
import React from "react";
import { useTitleSearch } from "./Firestore";

const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
    textField: {
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
                    onNav,
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
        if (value.nav) {
            onNav && onNav(value.nav);
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
        freeSolo
        fullWidth
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
                fullWidth
                variant="standard"
                autoCapitalize={"words"}
                autoFocus
                placeholder="Search…"
                className={classes.textField}
                onBlur={handleBlur}
            />
        )}
        options={matches.docs}
        filterOptions={(options, params) => {
            const filtered = filter(options, params);

            if (params.inputValue.length >= 2) {
                // Suggest the creation of a new value
                if (onCreate && !filtered.some(o =>
                    o.get("title") === params.inputValue)) {
                    filtered.push({
                        inputValue: params.inputValue,
                    });
                }
                if (onNav && "home".indexOf(params.inputValue.toLowerCase()) === 0) {
                    filtered.push({
                        nav: "/",
                        inputValue: "Home",
                    })
                }
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
        renderOption={(option) => {
            if (option.nav) {
                return <React.Fragment>
                    <SvgIcon>
                        <ArrowForwardIcon />
                    </SvgIcon>
                    {option.inputValue}
                </React.Fragment>
            }
            if (option.inputValue) {
                return `Add "${option.inputValue}"`;
            }
            return option.get("title");
        }}
        onChange={handleSelect}
    />;
}

export default Search;
