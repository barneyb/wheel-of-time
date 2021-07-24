import { firestore } from "./firebase";

document.addEventListener('DOMContentLoaded', function () {
    fetch("books.json")
        .then(r => r.json())
        .then(r => {
            const db = firestore;
            return r.forEach((b, i) => {
                const bookDoc = db.collection("books").doc(b.id);
                bookDoc.set({
                    _order: i + 1,
                    _pub_order: i + 1,
                    _story_order: b.chron,
                    tag: b.tag,
                    title: b.title,
                    pubDate: new Date(b.date + "Z"),
                });
                const chaps = bookDoc.collection("chapters");
                b.chapters.forEach((c, j) => {
                    const data = {
                        _order: (i + 1) * 100 + j,
                        title: c.title,
                    };
                    if (c.chron >= 1 && c.chron < 99) {
                        data.chapter = c.chron;
                    }
                    const chapDoc = chaps.doc(c.id);
                    chapDoc.set(data);
                    if (j === 0) {
                        bookDoc.update({
                            firstChapter: chapDoc,
                        });
                    }
                });
            });
        });
});
