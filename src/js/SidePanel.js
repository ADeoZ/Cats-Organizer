import DOM from './DOM';

export default class SidePanel {
  constructor(element, requestClass) {
    // Собираем элементы
    this.parentElement = element;
    this.listElement = this.parentElement.querySelector('.chaos_side_list');

    // Заводим вспомогательные классы
    this.request = requestClass;

    // Привязываем контекст
    this.render = this.render.bind(this);
    this.closeCategory = this.closeCategory.bind(this);
    this.showCategoryItems = this.showCategoryItems.bind(this);

    // Объект для обработки категорий хранилища
    this.categoryItems = {
      links: { class: 'chaos_side_links', text: 'Ссылки', handler: DOM.createSideLinkElement },
      favourites: { class: 'chaos_side_favourites', text: 'Избранное', handler: DOM.createSideFavouriteElement },
      image: { class: 'chaos_side_images', text: 'Изображения', handler: DOM.createSideImageElement },
      file: { class: 'chaos_side_files', text: 'Файлы', handler: DOM.createSideFileElement },
      video: { class: 'chaos_side_videos', text: 'Видео', handler: DOM.createSideVideoElement },
      audio: { class: 'chaos_side_audios', text: 'Аудио', handler: DOM.createSideAudioElement },
    };
  }

  // Отрисовываем список категорий хранилища
  render(data) {
    this.listElement.innerHTML = '';
    // eslint-disable-next-line guard-for-in
    for (const type in data) {
      const sideElement = DOM.createSideElement(
        this.categoryItems[type].class, this.categoryItems[type].text, data[type],
      );
      this.listElement.append(sideElement);
      if (data[type] > 0) {
        // sideElement.addEventListener('click', this.classNames[type].handler);
        sideElement.addEventListener('click', () => {
          this.openCategory(this.categoryItems[type].text);
          this.request.send('storage', type);
        });
      }
    }
  }

  // Открытие категории хранилища
  openCategory(text) {
    const subheadElement = DOM.createSideSubheadElement(text);
    const closeElement = subheadElement.querySelector('.chaos_side_close');
    this.listElement.replaceWith(subheadElement);
    closeElement.addEventListener('click', this.closeCategory);
  }

  // Закрываем категорию, возвращаем список
  closeCategory() {
    this.parentElement.querySelector('.chaos_side_subhead').remove();
    this.parentElement.querySelector('.chaos_side_list').remove();
    this.parentElement.append(this.listElement);
  }

  // Отрисовываем элементы категории
  showCategoryItems(data) {
    const categoryListElement = DOM.createSideCategoryList();
    for (const item of data.data) {
      const categoryElement = this.categoryItems[data.category]
        .handler(item.name, this.request.server);
      categoryListElement.append(categoryElement);
      categoryElement.querySelector('.chaos_side_open_select').addEventListener('click', () => this.request.send('select', item.messageId));
    }
    this.parentElement.append(categoryListElement);
  }

  // // Отрисовываем список ссылок
  // showLinksItems(data) {
  //   const categoryListElement = DOM.createSideCategoryList();
  //   for (const item of data.data) {
  //     const linkElement = DOM.createSideLinksElement(item.link);
  //     categoryListElement.append(linkElement);
  //     linkElement.addEventListener('click', () => this.request.send('select', item.messageId));
  //   }
  //   this.parentElement.append(categoryListElement);
  // }

  // // Отрисовываем список изображений
  // showImageItems(data) {
  //   const categoryListElement = DOM.createSideCategoryList();
  //   for (const item of data.data) {
  //     const imageElement = DOM.createSideLinksElement(item.link);
  //     categoryListElement.append(linkElement);
  //     linkElement.addEventListener('click', () => this.request.send('select', item.messageId));
  //   }
  //   this.parentElement.append(categoryListElement);
  // }
}
