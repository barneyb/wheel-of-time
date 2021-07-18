import { Typography } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router-dom";

function Chapter() {
    const {
        id,
        bookId,
    } = useParams();
    return <Typography>Chapter {id} (of {bookId})</Typography>;
}

export default Chapter;
