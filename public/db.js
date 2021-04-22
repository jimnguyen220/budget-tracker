let db;
// this script block allows us to save data to the browser while offline
const request = indexedDB.open("budget", 2);

request.onerror = e => {
    console.log("Error: " + e.target.errorCode);
};

request.onupgradeneeded = ({target}) => {
    const db = target.result;
    db.createObjectStore("transactions", { autoIncrement: true});
};

request.onsuccess = event => {
    db = event.target.result
    console.log(request.result)
    if (navigator.onLine) {
        checkDatabase();
    }
};

function saveRecord(record) {
    db = request.result;
    const transactions = db.transaction(["transactions"], "readwrite");
    const transactionsStore = transactions.objectStore("transactions");

    transactionsStore.add(record);

};

function checkDatabase() {
    db = request.result;
    const transactions = db.transaction(["transactions"], "readwrite");
    const transactionsStore = transactions.objectStore("transactions");
    const getAll = transactionsStore.getAll();

    getAll.onsuccess = () => {

        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                // if successful, open a transaction on your pending db
                const transaction = db.transaction(["transactions"], "readwrite");

                // access your pending object store
                const store = transaction.objectStore("transactions");

                // clear all items in your store
                store.clear();
            });

        }
    };

}



window.addEventListener("online", checkDatabase)
