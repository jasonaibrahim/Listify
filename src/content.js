'use strict';

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

import './content.css';

import { getListableRootElement, isListableSite, parseElement, parseQueryParams } from './helpers/parse';
import { Checklist, ChecklistItem } from './Checklist';

const STORAGE_KEY = '__LISTIFY__CHECKLIST_ITEMS';
const STORAGE_COUNT_KEY = '__LISTIFY__CHECKLIST_COUNT';

const current = window.location.hostname;
const params = parseQueryParams();

// the CheckList items
const checklist = loadChecklist();

const isListable = isListableSite(current, params);

if (isListable) {
  console.info('Valid Listable site');

  populateChecklistFromPage();
  embellishPageWithChecklistItems();
}

function populateChecklistFromPage() {
  const listableRoot = getListableRootElement(current);
  if (listableRoot) {
    for (const item of listableRoot.children) {
      try {
        const content = parseElement(item, 'google');

        checklist.addItem(
          ChecklistItem({ content })
        );

        window.localStorage.setItem(
          STORAGE_COUNT_KEY,
          checklist.counter.toString(),
        );

      } catch (err) {
        console.warn('Encountered an error while trying to scrape search result', err.message);
      }
    }
  } else {
    console.warn('No valid listable root element found');
  }
}

function embellishPageWithChecklistItems() {
  const listableRoot = getListableRootElement(current);

  if (listableRoot) {
    for (const item of listableRoot.children) {
      const checklistItem = checklist.getItems().find(i => {
        return item.innerText === i.content.raw;
      });

      const itemId = (
        checklistItem ? checklistItem.id : Math.random()
      );

      const listableElement = document.createElement('div');
      listableElement.classList.add('listify-item');
      listableElement.id = 'listify-item-' + itemId;

      listableElement.innerHTML = `
        <div class="listify-item__completion">
          <input type="checkbox" id="check-${itemId}" />
          <label for="check-${itemId}">Done</label>
        </div>
        <div class="listify-item__notes">
          <textarea placeholder="Notes" id="textarea-${itemId}"></textarea>
        </div>
      `;

      const checkbox = listableElement.querySelector(
        `#check-${itemId}`
      );

      if (checkbox) {
        checkbox.addEventListener('change', event =>
          handleCheckboxChange(
            event,
            item,
            checklistItem
          )
        );

        // decorate if already actioned
        if (checklistItem.completedAt) {
          checkbox.setAttribute('checked', 'checked');
        }
      }

      const textarea = listableElement.querySelector(
        `#textarea-${itemId}`
      );

      if (textarea) {
        textarea.addEventListener('keyup', event =>
          handleTextareaChange(
            event,
            item,
            checklistItem
          )
        );

        // decorate if already actioned
        if (checklistItem.notes) {
          textarea.value = checklistItem.notes;
        }
      }

      // decorate the item with strike-through text if already actioned
      if (checklistItem.completedAt) {
        item.style.textDecoration = 'line-through';
      }

      item.appendChild(listableElement);
    }
  } else {
    console.warn('No valid listable root element found');
  }
}

function handleCheckboxChange(event, element, checklistItem) {
  if (event.target.checked) {
    element.style.textDecoration = 'line-through';
  } else {
    element.style.textDecoration = 'auto';
  }

  checklist.markCompleted(checklistItem, event.target.checked);

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(checklist.getItems()),
  );
}

function handleTextareaChange(event, element, checklistItem) {
  checklist.updateNotes(checklistItem, event.target.value);

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(checklist.getItems()),
  );
}

function loadChecklist() {
  const counter = loadCounterFromStorage();
  const items = window.localStorage.getItem(STORAGE_KEY);

  if (items) {
    return new Checklist(JSON.parse(items), counter);
  } else {
    return new Checklist([], counter);
  }
}

function loadCounterFromStorage() {
  let counter = window.localStorage.getItem(STORAGE_COUNT_KEY);

  if (counter) {
    return parseInt(counter);
  } else {
    return 1;
  }
}

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  response => {
    console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});
