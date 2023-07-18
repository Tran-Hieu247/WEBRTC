import { channel } from './room_rtc.js';
// Lấy phần tử canvas và ngữ cảnh vẽ
var canvas = document.getElementById('whiteboard');
var ctx = canvas.getContext('2d');

// Thiết lập màu nền và màu vẽ mặc định
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = '#000000';
ctx.lineWidth = 2;

// Thiết lập các biến để lưu trữ thông tin về vẽ
var isDrawing = false;
var lastX, lastY;

// Đăng ký các sự kiện chuột để bắt đầu và kết thúc vẽ, và vẽ các đường thẳng trên canvas
canvas.addEventListener('mousedown', function (e) {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener('mousemove', function (e) {
    if (isDrawing) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastX = e.offsetX;
        lastY = e.offsetY;

        // Gửi thông tin vẽ đến các người dùng khác qua kênh truyền Agora RTM
        channel.sendMessage({type: 'draw', data: {x: lastX, y: lastY}});
    }
});

canvas.addEventListener('mouseup', function (e) {
    isDrawing = false;
});
