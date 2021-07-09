export default class DOM {
  // Основной шаблон для всех сообщений в ленту
  static createMessageContainer(bodyElement, geo, date) {
    const dateFormat = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const messageElement = document.createElement('div');
    messageElement.classList.add('chaos_messages_message');
    messageElement.innerHTML = `
      <div class="chaos_message_header">
        <div class="chaos_message_tools"></div>
      </div>
      <div class="chaos_message_body">
        ${bodyElement}
      </div>`;

    if (geo) {
      messageElement.innerHTML += `
        <div class="chaos_message_geo">
          <div class="chaos_geo_icon"></div>
          <a href="https://yandex.ru/maps/?text=${geo}" target="_blank">[${geo}]</a>
        </div>`;
    }

    messageElement.innerHTML += `
      <div class="chaos_message_date">
        ${dateFormat.format(date)}
      </div>`;

    return messageElement;
  }

  // Элемент текстового сообщения ленты
  static createMessageElement(text, geo, date) {
    const textElement = `<p>${this.linkify(text)}</p>`;
    return DOM.createMessageContainer(textElement, geo, date);
  }

  // Элемент сообщения с изображением в ленту
  static createImageElement(url, fileName, geo, date) {
    const imageElement = `<img class="chaos_messages_image" src="${url}/${fileName}">`;
    return DOM.createMessageContainer(imageElement, geo, date);
  }

  // Элемент сообщения с видео в ленту
  static createVideoElement(url, fileName, geo, date) {
    const videoElement = `<video class="chaos_messages_video" src="${url}/${fileName}" controls></video>`;
    return DOM.createMessageContainer(videoElement, geo, date);
  }

  // Элемент сообщения с аудио в ленту
  static createAudioElement(url, fileName, geo, date) {
    const audioElement = `<audio class="chaos_messages_audio" src="${url}/${fileName}" controls></audio>`;
    return DOM.createMessageContainer(audioElement, geo, date);
  }

  // Элемент сообщения с произвольным файлом в ленту
  static createFileElement(url, fileName, geo, date) {
    const fileElement = `
      <div class="chaos_messages_file">
        <a href="${url}/${fileName}">
          <div class="chaos_messages_file_bg"></div>
        </a>
        <a href="${url}/${fileName}">${fileName}</a>
      </div>`;
    return DOM.createMessageContainer(fileElement, geo, date);
  }

  // Элементы управления для сообщения (удалить, закрепить, избранное)
  static createToolsElements() {
    const toolsElements = document.createElement('div');
    toolsElements.classList.add('chaos_message_tools_container');
    toolsElements.innerHTML = `
        <div class="chaos_message_tools_delete"></div>
        <div class="chaos_message_tools_pin"></div>
        <div class="chaos_message_tools_favourite"></div>
      `;
    return toolsElements;
  }

  // Элемент с меткой для избранного сообщения
  static getFavouriteMark() {
    const favouriteElement = document.createElement('div');
    favouriteElement.classList.add('chaos_message_favourite');
    return favouriteElement;
  }

  // Элемент с меткой для избранного сообщения
  static getPinMark() {
    const pinMarkElement = document.createElement('div');
    pinMarkElement.classList.add('chaos_message_pin');
    return pinMarkElement;
  }

  // Плашка закреплённого сообщения
  static getPinnedMessage(element) {
    const pinnedElement = document.createElement('div');
    pinnedElement.classList.add('chaos_pinned');
    pinnedElement.innerHTML = `
        <div class="chaos_pinned_container">
          ${element.innerHTML}
        </div>
        <div class="chaos_pinned_side">
          <div class="chaos_pinned_title">Закреплённое сообщение <div class="chaos_pinned_close"></div></div>
          <div class="chaos_pinned_select"></div>
        </div>
      `;
    return pinnedElement;
  }

  // Контейнер выбранного (selected) из хранилища сообщения
  static createSelectContainer(date) {
    const selectContainerElement = document.createElement('div');
    selectContainerElement.classList.add('chaos_messages', 'chaos_select_container');

    const dateFormat = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    selectContainerElement.innerHTML = `
    <div class="chaos_select_header">
      Сообщение от ${dateFormat.format(date)}
      <div class="chaos_select_close"></div>
    </div>`;
    return selectContainerElement;
  }

  // Элемент отображения ошибки соединения
  static createErrorConnectionElement() {
    const connectionErrorElement = document.createElement('div');
    connectionErrorElement.classList.add('chaos_connection_error');
    return connectionErrorElement;
  }

  // Элементы категорий хранилища
  static createSideElement(className, text, count) {
    const sideElement = document.createElement('li');
    sideElement.classList.add('chaos_side_item', className);
    sideElement.innerHTML = `${text}: <span>${count}</span>`;
    return sideElement;
  }

  // Заголовок открытой категории хранилища
  static createSideSubheadElement(text) {
    const subheadElement = document.createElement('div');
    subheadElement.classList.add('chaos_side_subhead');
    subheadElement.innerHTML = `<h3>${text}</h3><div class="chaos_side_close"></div>`;
    return subheadElement;
  }

  // Список для элементов открытой категории хранилища
  static createSideCategoryList() {
    const categoryListElement = document.createElement('ul');
    categoryListElement.classList.add('chaos_side_list');
    return categoryListElement;
  }

  // Основной шаблон для всех элементов открытой категории
  static createSideElementContainer(bodyElement) {
    const listElement = document.createElement('li');
    listElement.classList.add('chaos_side_item', 'chaos_side_open_item');
    listElement.innerHTML = `
      <div class="chaos_side_open_container">
        <div class="chaos_side_open_select"></div>
        <div class="chaos_side_open_element">
          ${bodyElement}
        </div>
      </div>
    `;
    return listElement;
  }

  // Элементы открытой категории ссылок
  static createSideLinkElement(link) {
    const bodyElement = `<p><a href="${link}">${link}</a></p>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элементы открытой категории изображений
  static createSideImageElement(fileName, url) {
    const bodyElement = `<img class="chaos_messages_image" src="${url}/${fileName}">`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элементы открытой категории видео
  static createSideVideoElement(fileName, url) {
    const bodyElement = `<video class="chaos_messages_video" src="${url}/${fileName}" controls></video>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элементы открытой категории аудио
  static createSideAudioElement(fileName, url) {
    const bodyElement = `<audio class="chaos_messages_audio" src="${url}/${fileName}" controls></audio>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элементы открытой категории файлов
  static createSideFileElement(fileName, url) {
    const bodyElement = `<p><a href="${url}/${fileName}">${fileName}</a></p>`;
    const listElement = DOM.createSideElementContainer(bodyElement);
    return listElement;
  }

  // Элемент описание категории избранного
  static createFavouritesDescription(count, dateFrom, dateTo) {
    const listElement = document.createElement('li');
    listElement.classList.add('chaos_side_item', 'chaos_side_open_item');

    const dateFormat = new Intl.DateTimeFormat('ru', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    listElement.innerHTML = `
      <div class="chaos_side_open_container">
        <div class="chaos_side_open_element">
          <p class="chaos_side_favourites_description">Всего сообщений: <b>${count}</b><br>
          С <b>${dateFormat.format(dateFrom)}</b><br>
          По <b>${dateFormat.format(dateTo)}</b></p>
        </div>
      </div>
    `;
    return listElement;
  }

  // Форма для отправки файла
  static getAddForm() {
    const addFormElement = document.createElement('label');
    addFormElement.classList.add('chaos_file_label');
    addFormElement.innerHTML = `
      <div class="chaos_file_input">Кликни или Кинь</div>
      <input type="file" class="chaos_file_hidden">`;
    return addFormElement;
  }

  // Форма для записи медиа (аудио/видео)
  static getMediaForm(type) {
    const mediaContainerElement = document.createElement('div');
    mediaContainerElement.classList.add('chaos_media_container');
    mediaContainerElement.innerHTML = `
      <div class="chaos_media_record"></div>
      <div class="chaos_media_status">
        Ожидание ${type}
      </div>
      <div class="chaos_media_stop"></div>`;
    return mediaContainerElement;
  }

  // Элемент с географическими координатами
  static createGeoElement(value) {
    const geoElement = document.createElement('div');
    geoElement.classList.add('chaos_geo');
    geoElement.innerHTML = `
      <div class="chaos_geo_icon"></div>
      [${value}]
      <div class="chaos_geo_close"></div>
      `;
    return geoElement;
  }

  // Ошибка недоступности записи медиа
  static errorMediaForm() {
    const mediaContainerElement = document.createElement('div');
    mediaContainerElement.classList.add('chaos_media_container');
    mediaContainerElement.innerHTML = `
      <div class="chaos_media_status">
        Ваш браузер не поддерживает запись медиа
      </div>`;
    return mediaContainerElement;
  }

  // Элемент для закрытия формы
  static getCloseForm() {
    const closeElement = document.createElement('div');
    closeElement.classList.add('chaos_form_close');
    return closeElement;
  }

  // Область сброса файла для Drag and Drop
  static createDropPlace() {
    const dropplaceContainerElement = document.createElement('div');
    dropplaceContainerElement.classList.add('chaos_dropplace_container');
    dropplaceContainerElement.innerHTML = '<div class="chaos_dropplace"></div>';
    return dropplaceContainerElement;
  }

  // Делаем все ссылки в сообщении кликабельными
  static linkify(text) {
    const textWithLinks = text.replace(/((http:\/\/|https:\/\/){1}(www)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-?%#&-]*)*\/?)/gi, '<a href="$1">$1</a>');
    return textWithLinks;
  }
}
