import Chaos from './Chaos';

const chat = new Chaos(document.querySelector('.chaos_organizer'), 'localhost:7070');
chat.init();

// const file = document.querySelector('.chaos_form_input');
// file.addEventListener('change', () => {
//   const gotFile = file.files[0];
//   console.log(gotFile);
//   console.log(gotFile.type);

//   const image = URL.createObjectURL(gotFile);
//   console.log({ name: 'object', url: image });
//   // const blob = new Blob(gotFile, { type: 'image/png' });
//   // console.log(blob);
//   const fileReader = new FileReader();

//   fileReader.readAsArrayBuffer(file.files[0]);
// });

// /http[^\s`'"]+/g
