import { demo, validateState } from './model.mjs';
export const STORAGE_KEY = 'radar-ruptura:v1';
export function load(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  return raw === null ? demo() : validateState(JSON.parse(raw));
}
export function save(storage, next, expectedRevision) {
  const raw = storage.getItem(STORAGE_KEY);
  if ((raw === null && expectedRevision !== 0) || (raw !== null && JSON.parse(raw).revision !== expectedRevision)) throw new Error('Os dados mudaram em outra aba. Recarregue a página antes de continuar.');
  const updated = {...next, revision: expectedRevision + 1};
  validateState(updated);
  storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
