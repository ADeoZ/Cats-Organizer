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
    this.hideDropPlace = this.hideDropPlace.bind(this);
    this.dropFile = this.dropFile.bind(this);
  }


  openForm() {
    this.addFormElement = DOM.getAddForm();
    this.inputElement.replaceWith(this.addFormElement);

    this.dropplace = DOM.createDropPlace();
    this.mainElement.prepend(this.dropplace);
    this.mainElement.addEventListener('dragover', this.showDropPlace); // убирать на drop
    this.dropplace.addEventListener('dragleave', this.hideDropPlace);
    this.dropplace.addEventListener('drop', this.dropFile);
  }

  closeForm() {
    this.addFormElement.replaceWith(this.inputElement);
  }

  showDropPlace(event) {
    event.preventDefault();
    this.dropplace.style.visibility = 'visible';
  }

  hideDropPlace() {
    this.dropplace.style.visibility = 'hidden';
  }

  dropFile(event) {
    event.preventDefault();
    this.hideDropPlace();
    this.closeForm();
    console.log(event.dataTransfer.files[0]);
  }
}
