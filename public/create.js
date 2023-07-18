let form_create =  document.getElementById('lobby__form');
let displayName_create = sessionStorage.getItem('display_name')
if(displayName_create){
  form_create.name.value = displayName_create;
}
let createRoom = (e) => {
    e.preventDefault(); 
  
    sessionStorage.setItem('display_name', e.target.name.value);

    let roomCode = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 8; i++) {
      roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  let password = e.target.password.value
  
    // db.database().ref('room').push(roomInfo).then(() => {
    //   // Chuyển hướng đến trang index.html với mã phòng được tạo ra
    //   window.location = `index.html?room=${roomCode}`;
    // });
    window.location = `index.html?room=${roomCode}&&password=${password}`;
  };
  form_create.addEventListener('submit', createRoom);
