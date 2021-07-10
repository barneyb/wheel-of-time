// noinspection NodeCoreCodingAssistance,JSUnusedLocalSymbols

const fs = require('fs');
const assert = require('assert');

function getWords(s) {
    return s.replace(/'/g, "")
        .replace(/[^a-z]+/ig, " ")
        .split(" ")
        .map(w => w.trim())
        .filter(w => w);
}

function capitalize(w) {
    return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase();
}

function getTag(s) {
    return getWords(s)
        .map(w => w.charAt(0))
        .join("");
}

function getId(s) {
    return getWords(s)
        .map(capitalize)
        .join("");
}

function getKey(s) {
    return getTag(s).toLowerCase();
}

function parseCsv(body) {
    return body
        .trim()
        .split("\n")
        .map(parseCsvRecord)
}

function parseCsvWithHeaders(body) {
    const records = parseCsv(body)
    const headers = records.shift();
    return records.map(r => getStructViaHeaders(r, headers));
}

function parseCsvRecord(line) {
    return line.split("|");
}

function renderCsv(records) {
    return records
        .map(renderCsvRecord)
        .join("\n");
}

function renderCsvWithHeaders(structs, headers) {
    const records = structs.map(s => getRecordViaHeaders(s, headers));
    records.unshift(headers);
    return renderCsv(records);
}

function renderCsvRecord(r) {
    return r.join("|");
}

function getStructViaHeaders(record, headers) {
    return headers.reduce((obj, k, i) => {
        obj[k] = record[i];
        return obj;
    }, {});
}

function getRecordViaHeaders(struct, headers) {
    return headers.map(k => struct[k]);
}

function uniqueIndex(items, keyExtractor) {
    return items.reduce((obj, it) => {
        const key = keyExtractor(it);
        if (Object.hasOwnProperty.call(obj, key)) {
            throw new Error(`Non-unique key '${key}'`);
        }
        obj[key] = it;
        return obj;
    }, {});
}

function index(items, keyExtractor) {
    return items.reduce((obj, it) => {
        const key = keyExtractor(it);
        if (Object.hasOwnProperty.call(obj, key)) {
            obj[key].push(it);
        } else {
            obj[key] = [it];
        }
        return obj;
    }, {});
}

function escapeTurtle(s) {
    return s.replace(/"/g, "\\\"");
}

let books = parseCsvWithHeaders(fs.readFileSync("books.csv", "utf8"))
    .map(b => ({
        ...b,
        id: getId(b.title),
        tag: getTag(b.title),
        key: getKey(b.title),
        chapters: [],
    }));
const booksByKey = uniqueIndex(books, it => it.key);

let chapters = parseCsvWithHeaders(fs.readFileSync("chapters.csv", "utf8"))
    .map(c => ({
        ...c,
        book: booksByKey[c.book],
        id: getId(c.title),
    }));
const uniquer = new Set();
const dupes = new Set();
chapters.forEach(c => {
    assert(c.book, `${c.title} has no book`);
    if (uniquer.has(c.id)) {
        dupes.add(c.id)
    } else {
        uniquer.add(c.id);
    }
});
chapters
    .filter(c => dupes.has(c.id))
    .forEach(c => c.id = `${c.id}_${c.book.tag}`);

// chapters = chapters.slice(0, 2) // todo: remove
//     .concat(chapters.slice(34, 36))
//     .concat(chapters.slice(88, 90))
//     .concat(chapters.slice(351, 353))
//     .concat(chapters.slice(chapters.length - 1));

chapters.forEach(c => c.book.chapters.push({
    title: c.title,
    id: getId(c.title),
}));

fs.writeFileSync(
    "public/books.json",
    JSON.stringify(
        books
            .filter(b => b.chapters.length > 0)
            .sort((a, b) => a.date < b.date ? -1 : 1),
        (k, v) => {
            if (k === "book" || k === "key") {
                return undefined;
            } else if (k === "chron") {
                return parseInt(v);
            } else {
                return v;
            }
        },
        3,
    ),
    "utf8",
)
