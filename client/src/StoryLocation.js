import { DialogContent } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";
import {
    useBookList,
    useChapterList,
} from "./Firestore";
import useLocalStorage from "./useLocalStorage";

const STARTING_LOCATION = {
    book: "TheEyeOfTheWorld",
    chapter: "EarlierRavens",
    _order: 100,
};

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
                    {items.map((it) => (
                        <ListItem
                            button
                            onClick={() => handleListItemClick(it)}
                            selected={it.id === selectedId}
                            key={it.id}
                        >
                            {itemRenderer(it)}
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    </React.Fragment>;
}

function StoryLocation() {
    const [storyLocation, setStoryLocation] = useLocalStorage(
        "story-location",
        STARTING_LOCATION,
    );
    const {data: bookList, isFetching} = useBookList();
    const {data: chapterList, isFetching: isFetchingChapters} = useChapterList(
        storyLocation.book);

    if (isFetching) {
        return "The Wheel of Time";
    }

    return <React.Fragment>
        <SelectionLabel
            dialogTitle={"Select Book"}
            items={bookList}
            selectedId={storyLocation.book}
            labelRenderer={it => it?.data.tag}
            itemRenderer={it =>
                <ListItemText primary={it.data.title} />}
            onChange={value => setStoryLocation({
                book: value.id,
                chapter: value.data.firstChapter.id,
                _order: value.data._order * 100,
            })}
        />
        {!isFetchingChapters && <SelectionLabel
            dialogTitle={"Select Chapter"}
            items={chapterList}
            selectedId={storyLocation.chapter}
            labelRenderer={it => it ? `: ${it.data.title}` : null}
            itemRenderer={it =>
                <ListItemText
                    primary={`${it.data.chapter ? `${it.data.chapter}. ` : ''}${it.data.title}`} />}
            onChange={value => setStoryLocation(s => ({
                ...s,
                chapter: value.id,
                _order: value.data._order,
            }))}
        />}
    </React.Fragment>;
}

export default StoryLocation;
