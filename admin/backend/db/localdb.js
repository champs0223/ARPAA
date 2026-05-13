const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'data.json');
const initialStore = {
  usuarios: [],
  animais: [],
  adotantes: [],
  adocoes: [],
  resgates: [],
  tratamentos: [],
  vacinas: [],
  historico_animal: []
};

const writeStore = (store) => {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), 'utf8');
};

const readStore = () => {
  if (!fs.existsSync(dataFile)) {
    writeStore(initialStore);
  }

  const raw = fs.readFileSync(dataFile, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    writeStore(initialStore);
    return JSON.parse(JSON.stringify(initialStore));
  }
};

const ensureStore = () => {
  if (!fs.existsSync(dataFile)) {
    writeStore(initialStore);
  }
};

const parseId = (id) => String(id);

const getAll = (collection) => {
  const store = readStore();
  return Array.isArray(store[collection]) ? [...store[collection]] : [];
};

const getById = (collection, id) => {
  const store = readStore();
  const items = Array.isArray(store[collection]) ? store[collection] : [];
  return items.find((item) => parseId(item.id) === parseId(id)) || null;
};

const findOne = (collection, predicate) => {
  return getAll(collection).find(predicate) || null;
};

const filterItems = (collection, predicate) => {
  return getAll(collection).filter(predicate);
};

const nextId = (collection) => {
  const items = getAll(collection);
  const numericIds = items
    .map((item) => Number(item.id))
    .filter((value) => Number.isInteger(value) && !Number.isNaN(value));

  return numericIds.length === 0 ? 1 : Math.max(...numericIds) + 1;
};

const insertItem = (collection, item) => {
  const store = readStore();
  store[collection] = Array.isArray(store[collection]) ? store[collection] : [];

  const newItem = {
    ...item,
    id: item.id != null && item.id !== '' ? item.id : nextId(collection),
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || item.created_at || new Date().toISOString()
  };

  store[collection].push(newItem);
  writeStore(store);
  return newItem;
};

const updateItem = (collection, id, updatedFields) => {
  const store = readStore();
  store[collection] = Array.isArray(store[collection]) ? store[collection] : [];

  const index = store[collection].findIndex((item) => parseId(item.id) === parseId(id));
  if (index === -1) {
    return null;
  }

  const existing = store[collection][index];
  const updated = {
    ...existing,
    ...updatedFields,
    id: existing.id,
    updated_at: new Date().toISOString()
  };

  store[collection][index] = updated;
  writeStore(store);
  return updated;
};

const deleteById = (collection, id) => {
  const store = readStore();
  store[collection] = Array.isArray(store[collection]) ? store[collection] : [];

  const index = store[collection].findIndex((item) => parseId(item.id) === parseId(id));
  if (index === -1) {
    return false;
  }

  store[collection].splice(index, 1);
  writeStore(store);
  return true;
};

const testConnection = async () => {
  try {
    ensureStore();
    console.log('✓ Conexão com armazenamento local estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('✗ Erro ao conectar ao armazenamento local:', error.message);
    return false;
  }
};

module.exports = {
  ensureStore,
  testConnection,
  getAll,
  getById,
  findOne,
  filterItems,
  insertItem,
  updateItem,
  deleteById
};
