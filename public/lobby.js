let form =  document.getElementById('lobby__form');

let displayName = sessionStorage.getItem('display_name')
if(displayName){
    form.name.value = displayName;
}
let invite = (e) =>{
    e.preventDefault();

    sessionStorage.setItem('display_name', e.target.name.value);
    let inviteCode = e.target.room.value;
    let password = e.target.password.value
    
    window.location = `index.html?room=${inviteCode}&&password=${password}`;
}

form.addEventListener('submit', invite)