let db;
// this script block allows us to save data to the browser while offline
const request = indexedDB.open("budget", 2);

request.onerror = e => {
    console.log("Error: " + e.target.errorCode);
};

request.onsuccess = event => {
    db = request.result;
    console.log(request.result)
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onupgradeneeded = ({target}) => {
    const db = target.result;
    db.createObjectStore("transactions", {keyPath: "transactionsID", autoIncrement: true});
};

function checkDatabase() {
    const transactions = db.transaction(["transactions"], "readwrite");
    const transactionsStore = transactions.objectStore("transactions");
    const getAll = transactionsStore.getAll();

    request.onsuccess = () => {
        // transactionsStore.clear();

        // transactionsStore.add({name: "payday", value: 20});

        // const getRequest = transactionsStore.get(1);
        // getRequest.onsuccess = () => {
        // console.log(getRequest.result);
        // };
        // getRequest.onsuccess = e => {
        // console.log("Error: ", e.target);
        // };

        if (getAll.result.length > 0) {
            $.ajax({
                type: "POST",
                url: "/api/transaction/bulk",
                data: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                },
                success: function(msg){
                    const transaction = db.transaction(["transactions"], "readwrite");
                    const store = transaction.objectStore("transactions");
                    store.clear();
                    populateTable();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log(getAll.result);
                    console.log("Failed to Save DB");
                    console.log(XMLHttpRequest, textStatus, errorThrown)
                }
            });
        }
    };

}



window.addEventListener("online", checkDatabase)
