import { STORAGE_COUNT_KEY, STORAGE_KEY } from './content';
import { Checklist } from './checklist';

export async function loadChecklist() {
  const counter = await loadCounterFromStorage();
  const items = await loadChecklistFromStorage();

  if (items) {
    return new Checklist(items, counter);
  } else {
    return new Checklist([], counter);
  }
}

export async function loadChecklistFromStorage() {
  const items = await getStoredValue(STORAGE_KEY);

  if (items) {
    return items;
  } else {
    return null;
  }
}

export async function loadCounterFromStorage() {
  let counter = await getStoredValue(STORAGE_COUNT_KEY);

  if (counter) {
    return counter;
  } else {
    return 1;
  }
}

export async function getStoredValue(key) {
  return await sendRetrieveMessage(key);
}

export function sendRetrieveMessage(key) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        type: 'RETRIEVE',
        payload: {
          key,
        }
      },
      response => {
        resolve(response);
      }
    )
  });
}

export function sendSaveMessage(key, value) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage(
      {
        type: 'SAVE',
        payload: {
          key,
          value
        },
      },
      response => {
        console.info('Successfully saved Listify checklist');
      }
    );
  });
}
