import { Typography } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router-dom";

function Book() {
    const {id} = useParams();
    return <Typography>Book {id}</Typography>;
}

export default Book;
