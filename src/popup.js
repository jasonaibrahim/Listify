'use strict';

import './popup.css';
import { loadChecklist } from './storage';

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    loadChecklist().then(checklist => {
      console.log(checklist);
      if (checklist) {
        populatePopupContent(checklist);
      }
    });
  });

  function populatePopupContent(checklist) {
    const root = document.getElementById('listify-root');

    const checklistBrowser = document.createElement('div');
    checklistBrowser.classList.add('list-group');

    checklist
      .getItems()
      .sort((a, b) => {
        if (a.completedAt) {
          return 1;
        } else {
          return -1;
        }
      })
      .forEach(item => {
        const listItem = document.createElement('a');
        listItem.classList.add(
          'list-group-item',
          'list-group-item-action',
          'd-flex',
          'justify-content-between',
          'align-items-center'
        );
        listItem.innerText = item.content.lines.filter(line => line).join('\n');
        const icon = document.createElement('svg');
        icon.innerHTML = `
          <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M6.146 10.146l-.353.354.707.707.354-.353-.708-.708zM9.5 7.5l.354.354.353-.354-.353-.354L9.5 7.5zM6.854 4.146L6.5 3.793l-.707.707.353.354.708-.708zm0 6.708l3-3-.708-.708-3 3 .708.708zm3-3.708l-3-3-.708.708 3 3 .708-.708zM7.5 1A6.5 6.5 0 0114 7.5h1A7.5 7.5 0 007.5 0v1zM1 7.5A6.5 6.5 0 017.5 1V0A7.5 7.5 0 000 7.5h1zM7.5 14A6.5 6.5 0 011 7.5H0A7.5 7.5 0 007.5 15v-1zm0 1A7.5 7.5 0 0015 7.5h-1A6.5 6.5 0 017.5 14v1z" fill="currentColor"></path></svg>
        `
        listItem.appendChild(icon);

        if (item.completedAt) {
          listItem.style.textDecoration = 'line-through';

          const helpText = document.createElement('small');
          helpText.classList.add('text-muted');
          helpText.innerText = `\nMarked Done ${new Date(item.completedAt).toDateString()}`;

          listItem.appendChild(helpText);
        }

        checklistBrowser.appendChild(listItem);
      });

    root.appendChild(checklistBrowser);
  }
})();
