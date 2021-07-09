import DOM from './DOM';

export default class PinMessage {
  constructor(messageClass, requestClass) {
    // Заводим вспомогательные классы
    this.messageClass = messageClass;
    this.request = requestClass;

    // Привязываем контекст
    this.pinMessage = this.pinMessage.bind(this);
    this.unpinMessage = this.unpinMessage.bind(this);
    this.markPinnedMessage = this.markPinnedMessage.bind(this);
    this.unmarkPinnedMessage = this.unmarkPinnedMessage.bind(this);
    this.showPinnedMessage = this.showPinnedMessage.bind(this);
    this.removePinnedMessage = this.removePinnedMessage.bind(this);
  }

  // Запрос на закрепление сообщения
  pinMessage(event) {
    const messageId = this.messageClass.messages.get(event.target.closest('.chaos_messages_message'));

    if (messageId === this.pinnedMessage) {
      return;
    }

    this.request.send('pin', messageId);
    this.messageClass.closeMessageTools(event);
  }

  // Запрос на снятие сообщения из закрепленного
  unpinMessage() {
    this.request.send('unpin', this.pinnedMessage);
  }

  // Добавляем метку закреплённого сообщения
  markPinnedMessage(messageId) {
    this.unmarkPinnedMessage();

    const messageElement = [...this.messageClass.messages.entries()]
      .filter(({ 1: id }) => id === messageId).map(([key]) => key);

    const pinMarkElement = DOM.getPinMark();
    messageElement[0].querySelector('.chaos_message_header').prepend(pinMarkElement);
    pinMarkElement.addEventListener('click', this.unpinMessage);
  }

  // Удаляем метку закреплённого с сообщения
  unmarkPinnedMessage() {
    const markElement = this.messageClass.messagesElement.querySelector('.chaos_message_pin');
    if (markElement) {
      markElement.remove();
    }
    this.removePinnedMessage();
  }

  // Прикрепляем плашку с закреплённым сообщением
  showPinnedMessage(type, id, message, geo, date) {
    this.removePinnedMessage();
    this.pinnedMessage = id;

    const messageElement = this.messageClass.buildMessageElement(type, id, message, geo, date);
    this.pinnedMessageElement = DOM.getPinnedMessage(messageElement.querySelector('.chaos_message_body'));
    this.messageClass.messagesElement.append(this.pinnedMessageElement);
    const closeElement = this.pinnedMessageElement.querySelector('.chaos_pinned_close');
    closeElement.addEventListener('click', this.unpinMessage);
    const selectElement = this.pinnedMessageElement.querySelector('.chaos_pinned_select');
    selectElement.addEventListener('click', () => this.request.send('select', this.pinnedMessage));
  }

  // Удаляем плашку закреплённого сообщения
  removePinnedMessage() {
    if (this.messageClass.messagesElement.querySelector('.chaos_pinned')) {
      this.pinnedMessageElement.remove();
      this.pinnedMessage = '';
    }
  }
}
