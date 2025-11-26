import { StoryModel } from './story-model.js';

export class StoryPresenter {
  constructor(view) {
    this.model = new StoryModel();
    this.view = view;
    
    this.model.addListener(() => this._displayStories());
  }

  async showStories() {
    this._displayStories();
  }

  async addStory(title, content, image = null) {
    if (!title.trim() || !content.trim()) {
      throw new Error('Judul dan konten tidak boleh kosong');
    }

    this.model.addStory({
      title,
      content,
      image,
      likes: 0,
      comments: [],
    });
  }

  async deleteStory(id) {
    this.model.deleteStory(id);
  }

  _displayStories() {
    const stories = this.model.getStories();
    this.view.showStories(stories);
  }
}