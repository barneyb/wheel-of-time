
document.addEventListener('DOMContentLoaded', function () {
    fetch("books.json")
        .then(r => r.json())
        .then(r => {
            const db = firebase.firestore();
            return r.forEach((b, i) => {
                const bookDoc = db.collection("books").doc(b.id);
                bookDoc.set({
                    _order: i,
                    _pub_order: i,
                    _story_order: b.chron,
                    title: b.title,
                    pubDate: new Date(b.date + "Z"),
                });
                const chaps = bookDoc.collection("chapters");
                b.chapters.forEach((c, j) => chaps.doc(c.id).set({
                    _order: j,
                    title: c.title,
                }));
            });
        });
});
