import React from "react";
import { getId } from "./stringUtils";

const db = firebase.firestore();

const COL_BOOKS = "books";
const COL_CHAPTERS = "chapters";
const COL_INDIVIDUALS = "individuals";

function useRefWithInit(ref, init) {
    const [snap, setSnap] = React.useState(init);
    React.useEffect(
        () => ref.onSnapshot(doc => setSnap(doc)),
        [ref],
    );
    return snap;
}

function useDocRef(ref) {
    return useRefWithInit(ref, {
        id: ref.id,
        ref,
        get: () => undefined,
        data: () => undefined,
        isFetching: true,
    });
}

function useQueryRef(ref) {
    return useRefWithInit(ref, {
        empty: true,
        size: 0,
        docs: [],
        forEach: () => undefined,
        isFetching: true,
    });
}

export function useBooks() {
    const ref = React.useMemo(
        () => db.collection(COL_BOOKS)
            .orderBy("_order"),
        [],
    );
    return useQueryRef(ref);
}

export function useBookChapters(bookId) {
    const ref = React.useMemo(
        () => db.collection(COL_BOOKS)
            .doc(bookId)
            .collection(COL_CHAPTERS)
            .orderBy("_order"),
        [bookId],
    );
    return useQueryRef(ref);
}

export function useTitleSearch(title) {
    const ref = React.useMemo(
        () => db.collection(COL_INDIVIDUALS)
            .where("title", ">=", title)
            .where("title", "<", title + "\uFFFF")
            .orderBy("title")
            .limit(20),
        [title],
    );
    return useQueryRef(ref);
}

export function useIndividual(id) {
    const ref = React.useMemo(
        () => db.collection(COL_INDIVIDUALS).doc(id),
        [id],
    );
    return useDocRef(ref);
}

export function promiseIndividualId(title, storyLocation) {
    return new Promise((resolve) => {
        title = title.trim();
        const ref = db.collection(COL_INDIVIDUALS).doc(getId(title));
        resolve(ref.get().then(snap => {
            if (snap.exists) return snap.id;
            return ref.set({
                title,
                _at: storyLocation._order,
            }).then(() => ref.id);
        }));
    });
}
