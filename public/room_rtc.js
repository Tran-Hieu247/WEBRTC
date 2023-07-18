const APP_ID = "04f61fdd278e4f6b8848ed52999d4df0";
const APP_CERTIFICATE = "c2d31c8e1f8c4f279c9e9b0cece7ae4a";
let uid = sessionStorage.getItem('uid');
if(!uid){
    uid = String(Math.floor(Math.random()*10000));
    sessionStorage.setItem('uid', uid);
}

let token = null;

let client;

//rmt client
let rtmClient;
let channel;

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString);
let roomId = urlParams.get('room');

if(!roomId){
    roomId = 'main'
}

let displayName = sessionStorage.getItem('display_name');
if(!displayName){
    window.location = 'create.html'
}

let localTracks = [];
let remoteUsers = {};
let localScreenTracks;
let sharingScreen= false;

// token = AgoraRTC.generateToken({
//     appID: APP_ID,
//     appCertificate: APP_CERTIFICATE, // Thay APP_CERTIFICATE bằng khóa bí mật đã tạo từ bước 1
//     channel: roomId,
//     uid: uid
// });

let joinRoomInit = async ()=>{
    
    rtmClient = await AgoraRTM.createInstance(APP_ID);
    
    await rtmClient.login({uid,token});
    

    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName});
    
    channel = await rtmClient.createChannel(roomId);
    
    await channel.join()
    channel.on('MemberJoined', handleMemberJoined);
    channel.on('MemberLeft', handleMemberLeft);
    channel.on('ChannelMessage', handleChanelMessage);
    //channel.on('Success', initWhiteBoardCanvas);
    getMembers();
    
    client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})
    await client.join(APP_ID, roomId, token, uid)

    client.on('user-published', handleUserPublished);
    client.on('user-left', handleUserLeft);

    

    // Đăng ký sự kiện để nhận thông tin vẽ từ kênh truyền Agora RTM và vẽ lên canvas
    // channel.on('MessageFromPeer', function (message, uid) {
    //     if (message.type === 'draw') {
    //         ctx.beginPath();
    //         ctx.moveTo(lastX, lastY);
    //         ctx.lineTo(message.data.x, message.data.y);
    //         ctx.stroke();
    //         lastX = message.data.x;
    //         lastY = message.data.y;
    //     }
    // });

    // Khởi tạo whiteboard sau khi kênh channel đã join thành công
    
    
    
    joinStream();

}


let joinStream = async() =>{
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks({},{encoderConfig:{
        width:{min: 640, ideal: 1920, max: 1920},
        height:{min:480, ideal: 1080, max:1080}
    }})

    let player = `<div class="video__container" id="user-container-${uid}">
                        <div class="video-player" id="user-${uid}"><div>
                    </div>`
 
    document.getElementById('streams__container').insertAdjacentHTML('beforeend',  player)
    document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame)
    
    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[0], localTracks[1]]);
    
     
}

let handleUserPublished = async (user, mediaType) =>{
    remoteUsers[user.uid] = user;

    await client.subscribe(user, mediaType)

    let player = document.getElementById(`user-container-${user.uid}`)
        if(player===null){
            player = `<div class="video__container" id="user-container-${user.uid}">
                            <div class="video-player" id="user-${user.uid}"><div>
                    </div>`
            document.getElementById('streams__container').insertAdjacentHTML('beforeend',  player)
            document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame)

      }
      if(displayFrame.style.display){
        let videoFrames= document.getElementById(`user-container-${user.uid}`)
        videoFrames.style.height = '100px';
        videoFrames.style.width = '100px';
      }
    
    if(mediaType === 'video'){
        user.videoTrack.play(`user-${user.uid}`);
    }  
    if(mediaType === 'audio'){
        user.audioTrack.play();
    }  
}

let handleUserLeft = async (user) =>{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()

    if(userIdInDisplayFrame===`user-container-${user.uid}`){
        displayFrame.style.display = null;

        let videoFrames = document.getElementsByClassName('video__container');

        for(let i=0; videoFrames.length >i;i++){
            videoFrames[i].style.height='300px';
            videoFrames[i].style.width='300px';
        }
    }
}
/*
let switchToCamera = async () =>{
    let player = `<div class="video__container" id="user-container-${uid}">
                        <div class="video-player" id="user-${uid}"><div>
                    </div>`
    displayFrame.insertAdjacentHtml('beforeend', player);

    await localTracks[0].setMuted(true);
    await localTracks[1].setMuted(true);

    document.getElementById('mic-btn').classList.remove('active');
    document.getElementById('screen-btn').classList.remove('active');

    localTracks[1].play(`user-${uid}`);
    await client.publish([localTracks[1]]);

}
*/

let switchToCamera = async () => {
    
    let player = `<div class="video__container" id="user-container-${uid}">
                        <div class="video-player" id="user-${uid}"><div></div></div>
                    </div>`;
    displayFrame.insertAdjacentHTML('beforeend', player);

    await localScreenTracks.stop(); // Dừng track video từ màn hình
    await localScreenTracks.close(); // Đóng track video từ màn hình
    localTracks[1].setMuted(false); // Bật track video từ camera
    localTracks[1].play(`user-${uid}`); // Phát track video từ camera lên khung hiển thị video
    await client.publish([localTracks[1]]); // Đăng ký track video từ camera lên server sử dụng Agora SDK

    document.getElementById('screen-btn').classList.remove('active'); // Xóa lớp 'active' khỏi nút screen sharing
    document.getElementById('camera-btn').classList.add('active'); // Thêm lớp 'active' cho nút camera để chỉ ra rằng đang sử dụng chế độ camera

    sharingScreen = false; // Đặt trạng thái chia sẻ màn hình thành false
}
let toggleCamera = async (e) =>{
    let button = e.currentTarget

    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[1].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleMic = async (e) =>{
    let button = e.currentTarget;

    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        button.classList.add('active')
    }else{
        await localTracks[0].setMuted(true)
        button.classList.remove('active')
    }
}

let toggleScreen = async (e) =>{
    let screenButton = e.currentTarget;
    let cameraButton = document.getElementById('camera-btn');
    

    if(!sharingScreen){
        sharingScreen = true;

        screenButton.classList.add('active');
        cameraButton.classList.remove('active');
        cameraButton.style.display='none';

        localScreenTracks = await AgoraRTC.createScreenVideoTrack();

        document.getElementById(`user-container-${uid}`).remove();
        displayFrame.style.display='block';


        let player = `<div class="video__container" id="user-container-${uid}">
                        <div class="video-player" id="user-${uid}"><div>
                    </div>`

        displayFrame.insertAdjacentHTML('beforeend', player);
        document.getElementById(`user-container-${uid}`).addEventListener('click', expandVideoFrame);
        
        userIdInDisplayFrame = `user-container-${uid}`;
        localScreenTracks.play(`user-${uid}`);

        await client.unpublish([localTracks[1]]);
        await client.publish([localScreenTracks]);

        document.getElementsByClassName('video__container');
        for(let i=0; videoFrames.length > i; i++){

            if(videoFrames[i].id != userIdInDisplayFrame){
              videoFrames[i].style.height='100px';
              videoFrames[i].style.width='100px';
            }
            
          }
    }else{
        sharingScreen=false;
        cameraButton.style.display='block';
        document.getElementById(`user-container-${uid}`).remove();
        await client.unpublish([localScreenTracks]);

        switchToCamera();
    }

}
document.getElementById('camera-btn').addEventListener('click', toggleCamera);
document.getElementById('mic-btn').addEventListener('click', toggleMic);
document.getElementById('screen-btn').addEventListener('click',toggleScreen);
joinRoomInit();

//room.html ? room = 23423