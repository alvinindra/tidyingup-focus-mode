// Menggunakan dynamic import untuk menghindari error build
let dbPromise;

// Fungsi untuk initialize database
export const initDB = async () => {
  try {
    // Dynamic import untuk idb
    const { openDB } = await import('idb');
    
    dbPromise = openDB('FocusModeDB', 1, {
      upgrade(db) {
        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', {
            keyPath: 'id',
            autoIncrement: true,
          });
          sessionsStore.createIndex('createdAt', 'createdAt');
        }

        // Notes store
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', {
            keyPath: 'id',
            autoIncrement: true,
          });
          notesStore.createIndex('createdAt', 'createdAt');
        }

        // Books store
        if (!db.objectStoreNames.contains('books')) {
          const booksStore = db.createObjectStore('books', {
            keyPath: 'id',
            autoIncrement: true,
          });
          booksStore.createIndex('isComplete', 'isComplete');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      },
    });
    
    return dbPromise;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    // Fallback ke localStorage
    return null;
  }
};

export const DB = {
  async getAll(storeName) {
    if (!dbPromise) await initDB();
    try {
      return (await dbPromise).getAll(storeName);
    } catch (error) {
      console.warn('IndexedDB not available, using localStorage fallback');
      return this.getFromLocalStorage(storeName);
    }
  },

  async get(storeName, id) {
    if (!dbPromise) await initDB();
    try {
      return (await dbPromise).get(storeName, id);
    } catch (error) {
      console.warn('IndexedDB not available, using localStorage fallback');
      const items = this.getFromLocalStorage(storeName);
      return items.find(item => item.id === id) || null;
    }
  },

  async set(storeName, value) {
    if (!dbPromise) await initDB();
    try {
      return (await dbPromise).put(storeName, value);
    } catch (error) {
      console.warn('IndexedDB not available, using localStorage fallback');
      return this.saveToLocalStorage(storeName, value);
    }
  },

  async delete(storeName, id) {
    if (!dbPromise) await initDB();
    try {
      return (await dbPromise).delete(storeName, id);
    } catch (error) {
      console.warn('IndexedDB not available, using localStorage fallback');
      return this.deleteFromLocalStorage(storeName, id);
    }
  },

  async clear(storeName) {
    if (!dbPromise) await initDB();
    try {
      return (await dbPromise).clear(storeName);
    } catch (error) {
      console.warn('IndexedDB not available, using localStorage fallback');
      localStorage.removeItem(`focusmode_${storeName}`);
    }
  },

  // Fallback methods menggunakan localStorage
  getFromLocalStorage(storeName) {
    try {
      return JSON.parse(localStorage.getItem(`focusmode_${storeName}`)) || [];
    } catch {
      return [];
    }
  },

  saveToLocalStorage(storeName, value) {
    const items = this.getFromLocalStorage(storeName);
    if (value.id) {
      const index = items.findIndex(item => item.id === value.id);
      if (index !== -1) {
        items[index] = { ...items[index], ...value };
      } else {
        items.push(value);
      }
    } else {
      value.id = Date.now();
      items.push(value);
    }
    localStorage.setItem(`focusmode_${storeName}`, JSON.stringify(items));
    return value;
  },

  deleteFromLocalStorage(storeName, id) {
    const items = this.getFromLocalStorage(storeName);
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(`focusmode_${storeName}`, JSON.stringify(filteredItems));
  }
};