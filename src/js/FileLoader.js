import DOM from './DOM';

export default class FileLoader {
  constructor(element, request) {
    // Собираем элементы
    this.parentElement = element;
    this.formElement = this.parentElement.querySelector('.chaos_form');
    this.mainElement = this.parentElement.querySelector('.chaos_main');
    this.inputElement = this.formElement.querySelector('.chaos_form_input');
    this.buttonElement = this.formElement.querySelector('.chaos_file_button');
    this.dropplace = this.parentElement.querySelector('.chaos_dropplace');

    // Привязываем контекст
    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.showDropPlace = this.showDropPlace.bind(this);
  }

  openForm() {
    this.addFormElement = DOM.getAddForm();
    this.addButtonElement = DOM.getAddButton();
    this.inputElement.replaceWith(this.addFormElement);
    this.addFormElement.after(this.addButtonElement);
    this.buttonElement = this.formElement.querySelector('.chaos_file_button');
    this.buttonElement.addEventListener('click', this.closeForm);

    this.dropplace = DOM.createDropPlace();
    this.mainElement.prepend(this.dropplace);
    this.mainElement.addEventListener('dragover', this.showDropPlace);
  }

  closeForm() {
    this.addFormElement.replaceWith(this.inputElement);
    this.buttonElement.remove();
  }

  showDropPlace() {
    this.dropplace.style.visibility = 'visible';
  }
}
