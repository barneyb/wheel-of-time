import React from "react";
import { firestore as db } from "./firebase";
import RE_REF from "./RE_REF";
import { getId } from "./stringUtils";

const COL_BOOKS = "books";
const COL_CHAPTERS = "chapters";
const COL_INDIVIDUALS = "individuals";
const COL_FACTS = "facts";

// XxxReference -> XxxSnapshot
function useSnapshotOfXxxWithInit(refOrQuery, init) {
    const [snap, setSnap] = React.useState(init);
    React.useEffect(
        () => refOrQuery.onSnapshot(setSnap),
        [refOrQuery],
    );
    return snap;
}

// DocumentReference -> DocumentSnapshot
export function useDocSnapshot(ref) {
    return useSnapshotOfXxxWithInit(ref, {
        id: ref.id,
        ref,
        get: () => undefined,
        data: () => undefined,
        isFetching: true,
    });
}

// Query -> QuerySnapshot
export function useQuerySnapshot(query) {
    return useSnapshotOfXxxWithInit(query, {
        empty: true,
        size: 0,
        docs: [],
        forEach: () => undefined,
        isFetching: true,
    });
}

// () -> QuerySnapshot
export function useBooks() {
    const ref = React.useMemo(
        () => db.collection(COL_BOOKS)
            .orderBy("_order"),
        [],
    );
    return useQuerySnapshot(ref);
}

// String -> QuerySnapshot
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

// String -> QuerySnapshot
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

// String -> DocumentSnapshot
export function useIndividual(id) {
    const ref = React.useMemo(
        () => db.collection(COL_INDIVIDUALS).doc(id),
        [id],
    );
    return useDocSnapshot(ref);
}

// String -> StoryLocation -> QuerySnapshot
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

// String -> StoryLocation -> Promise<DocumentReference>
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

// String -> StoryLocation -> Promise<[String, Set<ID>]>
function promiseFactWithReferencedIndividualsIDs(fact, storyLocation) {
    fact = fact.trim();
    const rawRefs = new Set((fact.match(RE_REF) || [])
        .map(s => s.substr(1, s.length - 2)));
    return Promise.all([...rawRefs].map(idOrTitle =>
        db.collection(COL_INDIVIDUALS)
            .doc(idOrTitle)
            .get()
            .then(snap => {
                if (snap.exists) return snap.id;
                return promiseIndividual(idOrTitle, storyLocation)
                    .then(ref => {
                        fact = fact.replaceAll(
                            `[${idOrTitle}]`,
                            `[${ref.id}]`,
                        );
                        return ref.id;
                    });
            }),
    ))
        .then(ids => [fact, new Set(ids)]);
}

function promiseFactReference(id, factRef, storyLocation) {
    return db.collection(COL_INDIVIDUALS)
        .doc(id)
        .collection(COL_FACTS)
        .add({
            _ref: factRef,
            _at: storyLocation._order,
            _ts: Date.now(),
        });
}

// String -> String -> StoryLocation -> Promise<DocumentReference>
export function promiseNewFact(individualId, fact, storyLocation) {
    // ensure all referenced individuals exist, and get their IDs in the fact
    return promiseFactWithReferencedIndividualsIDs(fact, storyLocation)
        .then(([fact, reffedIndivIds]) =>
            db.collection(COL_INDIVIDUALS)
                .doc(individualId)
                .get()
                .then(iSnap =>
                    Promise.all([
                        // ensure the individual's _at is early enough
                        iSnap.get("_at") <= storyLocation._order
                            ? iSnap
                            : iSnap.ref.update({
                                _at: storyLocation._order,
                            }),
                        // add the fact to the individual
                        iSnap.ref
                            .collection(COL_FACTS)
                            .add({
                                fact,
                                _at: storyLocation._order,
                                _ts: Date.now(),
                            }),
                        reffedIndivIds,
                    ]))
                .then(([ignored, factRef, reffedIndivIds]) =>
                    // add a refFact to each referenced individual, pointed at factRef
                    Promise.all([...reffedIndivIds].map(id =>
                        promiseFactReference(id, factRef, storyLocation),
                    ))
                        .then(() => factRef)),
        );
}

// Iterable<T> -> (T -> String) -> Object<T>
function groupBy(iterable, extractKey) {
    const result = {};
    iterable.forEach(it => {
        const key = extractKey(it);
        if (!(key in result)) {
            result[key] = [it];
        } else {
            result[key].push(it);
        }
    })
    return result;
}

// DocumentReference -> String -> StoryLocation -> Promise<DocumentReference>
export function promiseFactUpdate(factRef, fact, storyLocation) {
    // ensure all referenced individuals exist, and get their IDs in the fact
    return promiseFactWithReferencedIndividualsIDs(fact, storyLocation)
        .then(([fact, reffedIndivIds]) =>
            Promise.all([
                factRef.update({
                    fact,
                }),
                db.collectionGroup("facts")
                    .where("_ref", "==", factRef)
                    .get()
                    .then(qSnap => {
                        const byIndivId = groupBy(qSnap.docs, s =>
                            s.ref.parent.parent.id);
                        const promisedActions = [];
                        Object.entries(byIndivId)
                            .forEach(([indivId, refSnaps]) => {
                                if (reffedIndivIds.has(indivId)) return;
                                promisedActions.push(refSnaps.map(s =>
                                    s.ref.delete()));
                            });
                        promisedActions.push([...reffedIndivIds]
                            .filter(id => !(id in byIndivId))
                            .map(id => promiseFactReference(
                                id,
                                factRef,
                                storyLocation,
                            )))
                        return Promise.all(promisedActions);
                    }),
            ]))
        .then(() => factRef);
}
