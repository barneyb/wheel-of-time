import React from "react";
import { firestore as db } from "./firebase";
import { getId } from "./stringUtils";

const COL_BOOKS = "books";
const COL_CHAPTERS = "chapters";
const COL_INDIVIDUALS = "individuals";
const COL_FACTS = "facts";

// XxxSnapshot
function useSnapshotOfXxxWithInit(refOrQuery, init) {
    const [snap, setSnap] = React.useState(init);
    React.useEffect(
        () => refOrQuery.onSnapshot(setSnap),
        [refOrQuery],
    );
    return snap;
}

// DocumentSnapshot
export function useDocSnapshot(ref) {
    return useSnapshotOfXxxWithInit(ref, {
        id: ref.id,
        ref,
        get: () => undefined,
        data: () => undefined,
        isFetching: true,
    });
}

// QuerySnapshot
export function useQuerySnapshot(query) {
    return useSnapshotOfXxxWithInit(query, {
        empty: true,
        size: 0,
        docs: [],
        forEach: () => undefined,
        isFetching: true,
    });
}

// QuerySnapshot
export function useBooks() {
    const ref = React.useMemo(
        () => db.collection(COL_BOOKS)
            .orderBy("_order"),
        [],
    );
    return useQuerySnapshot(ref);
}

// QuerySnapshot
export function useBookChapters(bookId) {
    const ref = React.useMemo(
        () => db.collection(COL_BOOKS)
            .doc(bookId)
            .collection(COL_CHAPTERS)
            .orderBy("_order"),
        [bookId],
    );
    return useQuerySnapshot(ref);
}

// QuerySnapshot
export function useTitleSearch(title) {
    const ref = React.useMemo(
        () => db.collection(COL_INDIVIDUALS)
            .where("title", ">=", title)
            .where("title", "<", title + "\uFFFF")
            .orderBy("title")
            .limit(20),
        [title],
    );
    return useQuerySnapshot(ref);
}

// DocumentSnapshot
export function useIndividual(id) {
    const ref = React.useMemo(
        () => db.collection(COL_INDIVIDUALS).doc(id),
        [id],
    );
    return useDocSnapshot(ref);
}

// QuerySnapshot
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
    return useQuerySnapshot(ref);
}

// Promise<DocumentReference>
export function promiseIndividual(title, storyLocation) {
    return new Promise(resolve => {
        title = title.trim();
        const ref = db.collection(COL_INDIVIDUALS).doc(getId(title));
        resolve(ref.get().then(snap => {
            if (snap.exists) return ref;
            return ref.set({
                title,
                _at: storyLocation._order,
            }).then(() => ref);
        }));
    });
}

// Promise<DocumentReference>
export function promiseFact(individualId, fact, storyLocation) {
    return new Promise(resolve => {
        fact = fact.trim();
        const indivs = db.collection(COL_INDIVIDUALS);
        const rawRefs = new Set();
        (fact.match(/\[([^\]]+)]/g) || []) // DUPLICATED!
            .map(s => s.substr(1, s.length - 2))
            .forEach(idOrTitle => rawRefs.add(idOrTitle));
        const idRefs = new Set();
        // ensure all the referred-to individuals exist
        resolve(Promise.all(Array.from(rawRefs).map(idOrTitle =>
            indivs.doc(idOrTitle)
                .get()
                .then(snap => {
                    if (snap.exists) return snap;
                    return promiseIndividual(idOrTitle, storyLocation)
                        .then(ref => {
                            fact = fact.replaceAll(
                                `[${idOrTitle}]`,
                                `[${ref.id}]`,
                            );
                            return ref;
                        });
                })
                .then(refOrSnap => idRefs.add(refOrSnap.id)),
        ))
            .then(() =>
                // ensure the individual's _at is early enough
                indivs.doc(individualId)
                    .get()
                    .then(snap => {
                        if (snap.get("_at") > storyLocation._order) {
                            return snap.ref.update({
                                _at: storyLocation._order,
                            });
                        }
                    }),
            )
            .then(() =>
                // now add the fact to the individual
                indivs.doc(individualId)
                    .collection(COL_FACTS)
                    .add({
                        fact,
                        _at: storyLocation._order,
                        _ts: Date.now(),
                    }))
            .then(factRef =>
                // now add a refFact to each of idRef's documents, pointed at factRef
                Promise.all(Array.from(idRefs).map(id =>
                    indivs.doc(id).collection(COL_FACTS).add({
                        _ref: factRef,
                        _at: storyLocation._order,
                        _ts: Date.now(),
                    }),
                ))
                    .then(() => factRef),
            ));
    });
}
