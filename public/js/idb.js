let db;

const request = indexedDB.open('Spender', 1);
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) { 
       uploadbudget();
    }
  };
  
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };
  function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    budgetObjectStore.add(record);
}
function uploadbudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            }
          })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
            
              const transaction = db.transaction(['new_budget'], 'readwrite');
              
              const budgetObjectStore = transaction.objectStore('new_budget');
              // clear all items in your store
              budgetObjectStore.clear();
    
              alert('All saved budget has been submitted!');
            })
            .catch(err => {
              console.log(err);
            });
        }
      };
}

      // listen for app coming back online
window.addEventListener('online', uploadbudget);