import debounce from "debounce-promise";
import React from "react";
import {
    useMutation,
    useQuery,
} from "react-query";
import { getId } from "./stringUtils";
import useStoryLocation from "./useStoryLocation";

const db = firebase.firestore();

const COL_BOOKS = "books";
const COL_CHAPTERS = "chapters";
const COL_INDIVIDUALS = "individuals";

function docToObject(doc) {
    if (!doc.exists) throw new Error(`${doc.id} doesn't exist`);
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
    return db.collection(COL_BOOKS)
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
    return db.collection(COL_BOOKS)
        .doc(bookId)
        .collection(COL_CHAPTERS)
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
    return db.collection(COL_INDIVIDUALS)
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

export function promiseIndividual(id) {
    return db.collection(COL_INDIVIDUALS)
        .doc(id)
        .get()
        .then(docToObject);
}

export function useIndividual(id) {
    return useQuery(
        ["individual", id],
        () => promiseIndividual(id),
    )
}

export function useCreator() {
    const [sl] = useStoryLocation();
    return useMutation(title => {
        title = title.trim();
        const id = getId(title);
        return db.collection(COL_INDIVIDUALS)
            .doc(id)
            .set({
                title,
                _order: sl._order,
            })
            .then(() => id);
    });
}
