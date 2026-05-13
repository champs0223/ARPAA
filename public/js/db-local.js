/**
 * Sistema de Banco de Dados Local (localStorage + IndexedDB)
 * Sem dependência de MySQL - Tudo armazenado localmente
 */

class DBLocal {
  constructor() {
    this.dbName = 'ARPAA_DB';
    this.version = 1;
    this.db = null;
    this.init();
  }

  /**
   * Inicializar IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Base de dados local inicializada');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Criar tabelas
        if (!db.objectStoreNames.contains('animais')) {
          db.createObjectStore('animais', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('adotantes')) {
          db.createObjectStore('adotantes', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('adocoes')) {
          db.createObjectStore('adocoes', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('usuarios')) {
          db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('resgates')) {
          db.createObjectStore('resgates', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('tratamentos')) {
          db.createObjectStore('tratamentos', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('vacinas')) {
          db.createObjectStore('vacinas', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  /**
   * Adicionar/Atualizar registro
   */
  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log(`✅ ${storeName}: registro salvo`);
        resolve(request.result);
      };
    });
  }

  /**
   * Obter todos os registros
   */
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Obter um registro por ID
   */
  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Deletar registro
   */
  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log(`✅ ${storeName}: registro deletado`);
        resolve();
      };
    });
  }

  /**
   * Limpar toda a tabela
   */
  async clear(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log(`✅ ${storeName}: tudo deletado`);
        resolve();
      };
    });
  }
}

// Instância global do banco de dados
const dbLocal = new DBLocal();
