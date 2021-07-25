import React from "react";

function Title({of}) {
    let title;
    if (typeof of === "string") {
        title = of;
    } else {
        if ('get' in of && 'id' in of) {
            title = of.get("title") || of.id;
        } else {
            title = `${of}`;
        }
    }
    const firstChar = title?.charAt(0);
    if (firstChar >= 'a' && firstChar <= 'z') {
        return <i>{title}</i>;
    }
    return title;
}

export default Title;
