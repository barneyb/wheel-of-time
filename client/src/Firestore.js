import React from "react";
import { firestore as db } from "./firebase";
import { getId } from "./stringUtils";

const COL_BOOKS = "books";
const COL_CHAPTERS = "chapters";
const COL_INDIVIDUALS = "individuals";
const COL_FACTS = "facts";

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

export function useFacts(individualId, storyLocation) {
    const ref = React.useMemo(
        () => db.collection(COL_INDIVIDUALS)
            .doc(individualId)
            .collection(COL_FACTS)
            .where("_at", "<=", storyLocation._order)
            .orderBy("_at", "desc")
            .orderBy("_ts", "desc"),
        [individualId, storyLocation._order],
    );
    return useQueryRef(ref);
}

export function promiseIndividual(title, storyLocation) {
    return new Promise(resolve => {
        title = title.trim();
        const ref = db.collection(COL_INDIVIDUALS).doc(getId(title));
        resolve(ref.get().then(snap => {
            if (snap.exists) return;
            return ref.set({
                title,
                _at: storyLocation._order,
            }).then(() => ref);
        }));
    });
}

export function promiseFact(individualId, fact, storyLocation) {
    return new Promise(resolve => {
        fact = fact.trim();
        resolve(db.collection(COL_INDIVIDUALS)
            .doc(individualId)
            .collection(COL_FACTS)
            .add({
                fact,
                _at: storyLocation._order,
                _ts: Date.now(),
            }));
    });
}
