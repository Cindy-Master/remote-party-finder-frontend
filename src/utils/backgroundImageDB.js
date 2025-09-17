// IndexedDB 工具类用于存储背景图片
class BackgroundImageDB {
  constructor() {
    this.dbName = 'BackgroundImageDB';
    this.version = 1;
    this.storeName = 'images';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 如果对象存储不存在则创建
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveImage(file) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const imageData = {
        id: 'background-image', // 固定ID，只保存一张背景图
        file: file,
        name: file.name,
        type: file.type,
        size: file.size,
        timestamp: Date.now()
      };

      const request = store.put(imageData);

      request.onsuccess = () => resolve(imageData);
      request.onerror = () => reject(request.error);
    });
  }

  async getImage() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get('background-image');

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.file) {
          // 返回文件对象
          resolve(result.file);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete('background-image');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async hasImage() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get('background-image');

      request.onsuccess = () => {
        resolve(!!request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// 创建单例实例
export const backgroundImageDB = new BackgroundImageDB();