// noinspection NodeCoreCodingAssistance

const fs = require('fs');
const assert = require('assert');

function getWords(s) {
    return s.replace(/[^a-z ]+/ig, "")
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

const prelude = `@prefix : <http://wot.barneyb.com/wot/> .
@prefix dc: <http://purl.org/dc/terms/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xml: <http://www.w3.org/XML/1998/namespace> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@base <http://wot.barneyb.com/wot/> .
`

// chapters = chapters.slice(0, 2) // todo: remove
//     .concat(chapters.slice(88, 90))
//     .concat(chapters.slice(351, 353))
//     .concat(chapters.slice(chapters.length - 1));
books = new Set(chapters.map(c => c.book));

const blocks = [prelude];
books.forEach(b => blocks.push(`
### ${b.id}
:${b.id} rdf:type owl:NamedIndividual ,
        :Book ;
    dc:date "${b.date}"^^xsd:date ;
    dc:identifier "${b.tag}" ;
    dc:title "${escapeTurtle(b.title)}" ;
    :chronologyOrder ${b.chron} ;
    rdfs:label "${escapeTurtle(b.title)}" .
`))

chapters.forEach(c => blocks.push(`
### ${c.book.tag} / ${c.id}
:${c.id} rdf:type owl:NamedIndividual ,
        :Chapter ;
    dc:isPartOf :${c.book.id} ;
    dc:title "${escapeTurtle(c.title)}" ;
    :chapterNumber ${c.chron} ;
    rdfs:label "${escapeTurtle(c.title)}" .
`));

fs.writeFileSync("target/books.ttl", blocks.join(""), "utf8")
