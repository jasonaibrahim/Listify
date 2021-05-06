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

import { getListableRootElement, isListableSite, parseElement, parseQueryParams } from './parse';
import { ChecklistItem } from './checklist';
import { loadChecklist, sendSaveMessage } from './storage';

export const STORAGE_KEY = '__LISTIFY__CHECKLIST_ITEMS';
export const STORAGE_COUNT_KEY = '__LISTIFY__CHECKLIST_COUNT';

const current = window.location.hostname;
const params = parseQueryParams();

const isListable = isListableSite(current, params);

if (isListable) {
  console.info('Valid Listable site');
}

loadChecklist().then(checklist => {
  if (isListable) {
    populateChecklistFromPage(checklist);
    embellishPageWithChecklistItems(checklist);
  }
});

function populateChecklistFromPage(checklist) {
  const listableRoot = getListableRootElement(current);
  if (listableRoot) {
    for (const item of listableRoot.children) {
      try {
        const content = parseElement(item, 'google');

        if (content) {
          checklist.addItem(
            ChecklistItem({ content })
          );

          sendSaveMessage(STORAGE_COUNT_KEY, checklist.counter);
        }

      } catch (err) {
        console.warn('Encountered an error while trying to scrape search result', err.message);
      }
    }
  } else {
    console.warn('No valid listable root element found');
  }
}

function embellishPageWithChecklistItems(checklist) {
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
            checklist,
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
            checklist,
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

function handleCheckboxChange(event, element, checklist, checklistItem) {
  if (event.target.checked) {
    element.style.textDecoration = 'line-through';
  } else {
    element.style.textDecoration = 'auto';
  }

  checklist.markCompleted(checklistItem, event.target.checked);

  sendSaveMessage(
    STORAGE_KEY,
    checklist.getItems(),
  );
}

function handleTextareaChange(event, element, checklist, checklistItem) {
  checklist.updateNotes(checklistItem, event.target.value);

  sendSaveMessage(
    STORAGE_KEY,
    checklist.getItems(),
  );
}
