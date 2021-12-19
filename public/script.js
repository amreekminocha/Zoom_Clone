const socket = io('/');

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

let myVideoStream;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', userId => {
        setTimeout(connecToNewUser, 1000, userId, stream);
        // connecToNewUser(userId, stream);
    });

    socket.on('user-disconnected', userId => {
        if (peers[userId])
            peers[userId].close();
    });
});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

const connecToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });
    peers[userId] = call;
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

let text = $('input');

$('html').keydown(e => {
    if (e.which == '13' && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('');
    }
});

socket.on('createMessage', (message, userId) => {
    console.log(message);
    $('ul').append(`<li class="message"><b>${userId}</b><br/>${message}</li>`);
    scrollToBottom();
});

const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop('scrollHeight'));
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
};

const setUnmuteButton = () => {
    const html = `<i class = "unmute fas fa-microphone-slash"></i>
                  <span>Mute</span`;
    document.querySelector('.main__mute_button').innerHTML = html;
};

const setMuteButton = () => {
    const html = `<i class = "fas fa-microphone"></i>
                  <span>Mute</span`;
    document.querySelector('.main__mute_button').innerHTML = html;
};

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopVideo();
    }
};

const setPlayVideo = () => {
    const html = `<i class = "stop fas fa-video-slash"></i>
                  <span>Play Video</span`;
    document.querySelector('.main__video_button').innerHTML = html;
};

const setStopVideo = () => {
    const html = `<i class = "fas fa-video"></i>
                  <span>Stop Video</span`;
    document.querySelector('.main__video_button').innerHTML = html;
};