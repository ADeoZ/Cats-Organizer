import DOM from './DOM';

export default class FileLoader {
  constructor(element, requestClass) {
    // Собираем элементы
    this.parentElement = element;
    this.formElement = this.parentElement.querySelector('.chaos_form');
    this.mainElement = this.parentElement.querySelector('.chaos_main');
    this.clipElement = this.formElement.querySelector('.chaos_form_clip');
    this.inputElement = this.formElement.querySelector('.chaos_form_input');
    this.buttonElement = this.formElement.querySelector('.chaos_file_button');
    this.dropplace = this.parentElement.querySelector('.chaos_dropplace');

    // Заводим вспомогательные классы
    this.request = requestClass;

    // Привязываем контекст
    this.openForm = this.openForm.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.showDropPlace = this.showDropPlace.bind(this);
    this.hideDropPlace = this.hideDropPlace.bind(this);
    this.loadFile = this.loadFile.bind(this);
  }

  // Открываем форму прикрепления файла
  openForm() {
    const ifFormOpen = this.formElement.querySelector('.chaos_file_label');
    if (ifFormOpen) {
      return
    }
    this.closeElement = DOM.getCloseForm();
    this.formElement.prepend(this.closeElement);
    this.addFormElement = DOM.getAddForm();
    this.inputElement.replaceWith(this.addFormElement);
    this.inputFileElement = this.addFormElement.querySelector('input.chaos_file_hidden');
    this.dropplace = DOM.createDropPlace();
    this.mainElement.prepend(this.dropplace);
    this.closeElement.addEventListener('click', this.closeForm);
    this.mainElement.addEventListener('dragover', this.showDropPlace);
    this.dropplace.addEventListener('dragleave', this.hideDropPlace);
    this.dropplace.addEventListener('drop', this.loadFile);
    this.inputFileElement.addEventListener('change', this.loadFile);
  }

  // Закрываем форму
  closeForm() {
    this.closeElement.remove();
    this.clipElement.classList.remove('chaos_form_clip_active');
    this.addFormElement.replaceWith(this.inputElement);
  }

  // Отображаем область Drag and Drop
  showDropPlace(event) {
    event.preventDefault();
    this.dropplace.style.visibility = 'visible';
  }

  // Скрываем область Drag and Drop
  hideDropPlace() {
    this.dropplace.style.visibility = 'hidden';
  }

  // Отправляем файл
  loadFile(event) {
    event.preventDefault();
    this.hideDropPlace();
    this.mainElement.removeEventListener('dragover', this.showDropPlace);
    this.closeForm();

    const file = this.inputFileElement.files[0] || event.dataTransfer.files[0];
    const formData = new FormData();
    formData.append('file', file);
    this.request.sendFile(formData);
  }
}
