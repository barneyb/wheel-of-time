import { Typography } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router-dom";

function Individual() {
    const {id} = useParams();
    return <Typography>Individual {id}</Typography>;
}

export default Individual;
