import debounce from "debounce-promise";
import React from "react";
import { useQuery } from "react-query";

let db;
document.addEventListener('DOMContentLoaded', () => {
    db = firebase.firestore();
});

function docToObject(doc) {
    return {
        id: doc.id,
        data: doc.data(),
    };
}

function queryToList(qSnap) {
    const result = [];
    qSnap.forEach(d => result.push(docToObject(d)))
    return result;
}

export function promiseBookList() {
    return db.collection("books")
        .orderBy("_order")
        .get()
        .then(queryToList);
}

export function useBookList() {
    return useQuery(
        "book-list",
        promiseBookList,
        {staleTime: Infinity},
    );
}

export function promiseChapterList(bookId) {
    return db.collection("books")
        .doc(bookId)
        .collection("chapters")
        .orderBy("_order")
        .get()
        .then(queryToList);
}

export function useChapterList(bookId) {
    return useQuery(
        ["chapter-list", bookId],
        () => promiseChapterList(bookId),
        {staleTime: Infinity},
    );
}

export const promiseTitleSearch = debounce(function (title) {
    if (title.length < 2) {
        return Promise.resolve([]);
    }
    return db.collection("objects")
        .where("title", ">=", title)
        .where("title", "<", title + "\uFFFF")
        .orderBy("title")
        .limit(20)
        .get()
        .then(queryToList);
}, 300);

export function useTitleSearch(title) {
    title = title.trim();
    return useQuery(
        ["title-search", title],
        () => promiseTitleSearch(title),
    );
}
