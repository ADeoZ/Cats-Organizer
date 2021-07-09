import DOM from './DOM';

export default class Favourites {
  constructor(messageClass, requestClass) {
    // Заводим вспомогательные классы
    this.messageClass = messageClass;
    this.request = requestClass;

    // Привязываем контекст
    this.addToFavourites = this.addToFavourites.bind(this);
    this.removeFromFavourites = this.removeFromFavourites.bind(this);
    this.showFavouriteMark = this.showFavouriteMark.bind(this);
    this.removeFavouriteMark = this.removeFavouriteMark.bind(this);
  }

  // Запрос на добавление в избранное
  addToFavourites(event) {
    const messageId = this.messageClass.messages.get(event.target.closest('.chaos_messages_message'));

    const isFavouriteMark = event.target.closest('.chaos_messages_message').querySelector('.chaos_message_favourite');
    if (isFavouriteMark) {
      return;
    }

    this.request.send('favourite', messageId);
    this.messageClass.closeMessageTools(event);
  }

  // Запрос на удаление из избранного
  removeFromFavourites(event) {
    const messageId = this.messageClass.messages.get(event.target.closest('.chaos_messages_message'));
    this.request.send('favouriteRemove', messageId);
  }

  // Добавляем метку избранного на сообщение
  showFavouriteMark(messageId) {
    const messageElement = [...this.messageClass.messages.entries()]
      .filter(({ 1: id }) => id === messageId).map(([key]) => key);

    const favouriteElement = DOM.getFavouriteMark();
    messageElement[0].querySelector('.chaos_message_header').prepend(favouriteElement);
    favouriteElement.addEventListener('click', this.removeFromFavourites);
  }

  // Удаляем метку избранного с сообщения
  removeFavouriteMark(messageId) {
    const messageElement = [...this.messageClass.messages.entries()]
      .filter(({ 1: id }) => id === messageId).map(([key]) => key);
    messageElement[0].querySelector('.chaos_message_favourite').remove();
  }
}
