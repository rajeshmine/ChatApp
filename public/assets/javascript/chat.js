var socket = null;
let email_pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let projectID = config.ProjectID;
let userid = config.UID;
let BaseURL = config.BaseURL;
let formdata = new FormData();
let Name = '';
let Email = '';
let Profile_UID = '';
let openedChatId = '';
let $userListAppend = $('#userListAppend');
let $ClientName = $('#clientName');
var $inputMessage = $('.inputMessage');
var $chatPage = $('.HoleChetDiv');
var $loading = $('#loading');
var $messages = $('#chatDiv');
var $window = $(window);
var typing = false;
var TYPING_TIMER_LENGTH = 400;
var connected = false;
formdata.delete('uid');
formdata.delete('projectid');
formdata.append('projectid', projectID);
formdata.append('userid', userid);
window.onload = () => {
    socket = io(BaseURL, { query: { ClientUID: sessionStorage.UI } });
    $inputMessage.focus();
    window.emojiPicker = new EmojiPicker({
        emojiable_selector: '[data-emojiable=true]',
        assetsPath: './assets/lib/img/',
        popupButtonClasses: 'fa fa-smile-o'
    });
    window.emojiPicker.discover();
    // Socket Connection
    socket.on('login', (data) => { connected = true; });
    socket.on('reconnect', () => { console.log('you have been reconnected') });
    socket.on('reconnect_error', () => { console.log('attempt to reconnect has failed'); });
    CheckLogin();
    UserListGet();
    oldMessages();
    socket.on('User List', (data) => { UserListAppend(data); });
    socket.on('typing', (data) => {
        if (openedChatId === data.from && Profile_UID === data.to) $loading.show();
    });
    socket.on('stop typing', (data) => {
        if (openedChatId === data.from && Profile_UID === data.to) $loading.hide();
    });
    socket.on('All Messages', (data) => { addMessage(data); });
    socket.on('New Message', (data) => {
        let array = [];
        array.push(data);
        addMessage(array)
    });
    $inputMessage.on('input', () => { updateTyping(); });
    $window.keydown(event => {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) { $inputMessage.focus(); }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            SendMessage();
            let data = { typing: false, from: Profile_UID, to: openedChatId }
            socket.emit('stop typing', data);
            typing = false;
        }
    });
}
const updateTyping = async () => {
    if (!typing) {
        typing = true;
        let data = { typing: true, from: Profile_UID, to: openedChatId }
        socket.emit('typing', data);
    }
    lastTypingTime = (new Date()).getTime();
    setTimeout(() => {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            let data = { typing: false, from: Profile_UID, to: openedChatId }
            socket.emit('stop typing', data);
            typing = false;
        }
    }, TYPING_TIMER_LENGTH);
}
async function CheckLogin() {
    if (sessionStorage.length === 0 || sessionStorage.isLoggedin !== 'true') return signout();
    profileAppend();
}
async function profileAppend() {
    Name = sessionStorage.Name
    Email = sessionStorage.Email
    Profile_UID = sessionStorage.UI;
    await $('#UName').text(Name);
    await $('#UEmail').text(Email);
}
async function UserListGet() {
    socket.emit('User List');
}
async function UserListAppend(data) {
    $userListAppend.empty();
    let html = "";
    let TempData;
    TempData = data.filter((a) => a.Details.Uid !== Profile_UID || a.Details.Email !== Email);
    TempData.forEach((item) => {
        let Name = item.Details.Firstname + ' ' + item.Details.Lastname;
        html += '<li onclick = "ChatOpen(\'' + Name + '\', \'' + item.Details.Uid + '\')"><a><i class="fa fa-shield" aria-hidden="true"></i>' + Name + '</a></li>';
    });
    $userListAppend.append(html);
}
async function ChatOpen(Name, ID) {
    $inputMessage.val('');
    openedChatId = ID;
    $chatPage.css({ 'visibility': 'visible' }).removeClass('animated fadeInRight').addClass('animated fadeInRight');
    $ClientName.text(Name);
    oldMessages();
}
async function SendMessage() {
    event.preventDefault();
    let message;
    message = $inputMessage.val();
    if (message === '') message = $('.emoji-wysiwyg-editor').text();
    if (message.length > 0) {
        $inputMessage.val('');
        $('.emoji-wysiwyg-editor').empty();
        let senddata = {from: Profile_UID,to: openedChatId,SendTime: Date.now(),ReadStatus: 'N',Message: message,}
        socket.emit('New Message', senddata);
        let tempchatArray = [{Content: senddata}];
        addMessage(tempchatArray);
        $messages.animate({ scrollTop: $messages[0].scrollHeight }, 'slow');
    }
}
async function oldMessages() {
    $messages.empty();
    socket.emit('All Messages');
}
let t = [];
async function addMessage(data) {
    data = data.filter(a => a.Content.to === Profile_UID || a.Content.from === Profile_UID);
    data.forEach(item => {
        let lftdiv = '<div class="lftDiv"><p>' + item.Content.Message + '</p></div>';
        let rhtdiv = '<div class="rhtDiv"><p>' + item.Content.Message + '</p></div>';
        if (item.Content.from === openedChatId && item.Content.to === Profile_UID) return $messages.append(lftdiv);
        if (item.Content.to === openedChatId && item.Content.from === Profile_UID) return $messages.append(rhtdiv);
    });
    $messages.animate({ scrollTop: $messages[0].scrollHeight }, 'slow');
}
async function signout() {
    sessionStorage.clear();
    location.replace('./index.html');
}