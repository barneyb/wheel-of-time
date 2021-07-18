export function getWords(s) {
    return s.replace(/n't( |$)/g, "nt$1")
        .replace(/'(re|s|ll|d)( |$)/g, "$1$2")
        .replace(/s'( |$)/g, "s$1")
        .replace(/[^a-z]+/ig, " ")
        .split(" ")
        .map(w => w.trim())
        .filter(w => w);
}

export function capitalize(w) {
    return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase();
}

export function getId(s) {
    return getWords(s)
        .map(capitalize)
        .join("");
}
