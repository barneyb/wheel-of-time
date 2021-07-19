import { DialogContent } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";
import {
    useBookChapters,
    useBooks,
} from "./Firestore";
import useStoryLocation from "./useStoryLocation";

function SelectionLabel({
                            dialogTitle = "Select one",
                            labelRenderer = it => it ? it.id : "undefined",
                            itemRenderer = it => <ListItemText
                                primary={labelRenderer(it)} />,
                            items = [],
                            onChange,
                            selectedId,
                        }) {
    const [open, setOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState();
    React.useEffect(
        () => {
            setSelectedItem(selectedId ? items.find(it => it.id === selectedId) : null);
        },
        [selectedId, items],
    )

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleListItemClick = value => {
        setOpen(false);
        if (value !== selectedItem) {
            onChange(value);
        }
    }

    return <React.Fragment>
        {selectedId && <span
            onClick={handleOpen}
            style={{
                cursor: "pointer",
            }}
        >
            {labelRenderer(selectedItem)}
        </span>}
        <Dialog onClose={handleClose}
                aria-labelledby="simple-dialog-title"
                open={open}
        >
            <DialogTitle id="simple-dialog-title">{dialogTitle}</DialogTitle>
            <DialogContent>
                <List>
                    {items.map((it) => {
                        const selected = it.id === selectedId;
                        return (
                            <ListItem
                                button
                                onClick={() => handleListItemClick(it)}
                                selected={selected}
                                autoFocus={selected}
                                key={it.id}
                            >
                                {itemRenderer(it)}
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>
        </Dialog>
    </React.Fragment>;
}

function StoryLocation() {
    const [storyLocation, setStoryLocation] = useStoryLocation();
    const books = useBooks();
    const chapters = useBookChapters(storyLocation.book);

    if (books.empty) {
        return "TWoT: Loading...";
    }

    return <React.Fragment>
        <SelectionLabel
            dialogTitle={"Select Book"}
            items={books.docs}
            selectedId={storyLocation.book}
            labelRenderer={it => it?.get("tag")}
            itemRenderer={it =>
                <ListItemText primary={it.get("title")} />}
            onChange={value => setStoryLocation({
                book: value.id,
                chapter: value.get("firstChapter").id,
                _order: value.get("_order") * 100,
            })}
        />
        {!chapters.empty && <SelectionLabel
            dialogTitle={"Select Chapter"}
            items={chapters.docs}
            selectedId={storyLocation.chapter}
            labelRenderer={it => it ? `: ${it.get("title")}` : null}
            itemRenderer={it => {
                const ch = it.get("chapter");
                return <ListItemText
                    primary={`${ch ? `${ch}. ` : ''}${it.get("title")}`} />;
            }}
            onChange={value => setStoryLocation(s => ({
                ...s,
                chapter: value.id,
                _order: value.get("_order"),
            }))}
        />}
    </React.Fragment>;
}

export default StoryLocation;
