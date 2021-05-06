export class Checklist {
  constructor(items, counter) {
    this.items = items || [];
    this.counter = counter || 1;
  }

  addItem(item) {
    if (this.items.filter(i => i.id === item.id).length === 0) {
      this.items.push({
        ...item,
        createdAt: new Date(),
        id: this.incrementCounter(),
      });
    }
  }

  getItems() {
    return this.items;
  }

  incrementCounter() {
    this.counter += 1;
    return this.counter;
  }

  markCompleted(item, completed) {
    const checklistItem = this.items.filter(i => i.id === item.id).pop();
    if (checklistItem) {
      if (completed) {
        checklistItem.completedAt = new Date();
      } else {
        checklistItem.completedAt = null;
      }
    }
  }

  updateNotes(item, notes) {
    const checklistItem = this.items.filter(i => i.id === item.id).pop();
    if (checklistItem) {
      checklistItem.notes = notes;
    }
  }
}

export function ChecklistItem(params) {
  const { content } = params;

  let notes = '';
  let completedAt = null;

  return {
    content,
    notes,
    completedAt,
  };
}
