let handleMemberJoined = async (MemberId) =>{
    //console.log('A new member has joined the room', MemberId)
    addMemberToDom(MemberId);
    let members = await channel.getMembers();
    memberCount(members);

    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    addWellcomeToDom(`Wellcome to the room ${roomId} with ${name}`)
    
}

let addMemberToDom =  async (MemberId) =>{

    let {name} = await rtmClient.getUserAttributesByKeys(MemberId, ['name'])
    let membersWrapper = document.getElementById('member__list')
    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`
    membersWrapper.insertAdjacentHTML('beforeend', memberItem)
}

let sendMessage = async (e) =>{
    e.preventDefault();
    
    let message = e.target.message.value;
    channel.sendMessage({text:JSON.stringify({'type':'chat', 'message':message, 'displayName':displayName})})
    addMessageToDom(displayName, message);

    e.target.reset();

}

let addMessageToDom = (name,message) =>{
    let messChat = document.getElementById('message');
    let newMess = ` <div class="message_chat">
                        <div class="message_body">
                            <strong class="message_author"> ${name}</strong>
                            <p class="message_text"> ${message}</p>
                        </div>
                    </div>`
    messChat.insertAdjacentHTML('beforeend', newMess);
    let lastMess= document.querySelector('#message .message_chat:last-child');
    if(lastMess){
        lastMess.scrollIntoView();
    }
}

let addWellcomeToDom = (wellcomMess) =>{
    let messChat = document.getElementById('message');
    let newMess = ` <div class="message_chat">
                        <div class="message_wellcome">
                            
                            <p class="message_text"> ${wellcomMess}</p>
                        </div>
                    </div>`
    messChat.insertAdjacentHTML('beforeend', newMess);
    let lastMess= document.querySelector('#message .message_chat:last-child');
    if(lastMess){
        lastMess.scrollIntoView();
    }
}





let memberCount = async (members) =>{
    let count = document.getElementById('members__count');
    count.innerText = members.length;
}

let handleMemberLeft = async (MemberId) =>{
    removeMemberFromDom(MemberId);

    let members = await channel.getMembers();
    memberCount(members);
}

let removeMemberFromDom = async(MemberId) =>{
    let membersWrapper = document.getElementById(`member__${MemberId}__wrapper`);
    let name = membersWrapper.getElementsByClassName('member_name')[0].textContent;
    membersWrapper.remove();
    addWellcomeToDom(`${name} has left`)
}

let handleChanelMessage = async (messageData, MemberId) =>{
    
    let data = JSON.parse(messageData.text);
    if(data.type==='chat'){
        addMessageToDom(data.displayName, data.message);
    }
    
}

let leaveChanel = async () =>{
    await channel.leave();
    await rtmClient.logout();
}

let getMembers = async () => {
    let members = await channel.getMembers();
    memberCount(members);
    for (let i = 0; members.length > i; i++){
        addMemberToDom(members[i])
    }
    
}

// Thêm sự kiện beforeunload để đăng xuất khỏi kênh trước khi đóng trang
window.addEventListener('beforeunload', leaveChanel);
let messageForm = document.getElementById('message__form');
messageForm.addEventListener('submit', sendMessage)

