export class StoryModel {
  constructor() {
    this.stories = [];
    this.listeners = [];
  }

  addStory(story) {
    this.stories.push({
      ...story,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
    this._notifyListeners();
  }

  getStories() {
    return this.stories.slice().reverse(); // Return newest first
  }

  deleteStory(id) {
    this.stories = this.stories.filter(story => story.id !== id);
    this._notifyListeners();
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  _notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}