var socket = null;
let email_pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let projectID = config.ProjectID;
let userid = config.UID;
let BaseURL = config.BaseURL;
let formdata = new FormData();
formdata.delete('uid');
formdata.delete('projectid');
formdata.append('projectid', projectID);
formdata.append('userid', userid);
window.onload = () => {
    $('#signupopen').on('click', () => {
        $('#signupform,#loginform')[0].reset();
        $('.signupdiv,.logindiv').slideToggle();
    });
    $('#loginopen').on('click', () => {
        $('#loginform,#signupform')[0].reset();
        $('.signupdiv,.logindiv').slideToggle();
    });
    // Socket Connection
    socket = io(BaseURL, {
        query: { ProjectID: projectID, databaseURL: 'ERSHTTZ27KYN2LRQGRS672EBP', UserID: userid }
    });
    socket.on('reconnect', () => { console.log('you have been reconnected') });
    socket.on('reconnect_error', () => { console.log('attempt to reconnect has failed'); });
    socket.on('SubscribersMessage', (data) => { console.log(data); alert(data); });
}
function subscribe() { socket.emit('Subscribe'); }
function SendNotification() {
    event.preventDefault();
    let Information = $('#info').val();
    socket.emit('SubscribersMessage', Information);
    $('#info').val('')
}
async function Login() {
    event.preventDefault();
    formdata.delete('username');
    formdata.delete('password');
    let email = $('#log_email').val();
    let password = $('#log_psw').val();
    formdata.append('username', email);
    formdata.append('password', password);
    let url = BaseURL + 'users/Login';
    API_call(url, 'POST', formdata, (data) => {
        if (data.StatusCode === 200) { $('#loginform')[0].reset(); return sessionstore(data) }
        else { showalert('red', 'Error while login!!!', data.Response); }
    });
}
async function signup() {
    event.preventDefault();
    let firstname = $('#fst_name').val();
    let lastname = $('#lst_name').val();
    let email = $('#sign_up_email').val();
    let N_password = $('#newpsw').val();
    let C_password = $('#confirmpsw').val();
    if (!email_pattern.test(email)) {
        return showalert('red', 'Email validation error!!!', 'Please check your mail id is correct.');
    }
    if (N_password !== C_password) {
        return showalert('red', 'Password error!!!', 'Password does not match.\nPlease check your password');
    }
    formdata.delete('firstname');
    formdata.delete('lastname');
    formdata.delete('email');
    formdata.delete('password');
    formdata.append('firstname', firstname);
    formdata.append('lastname', lastname);
    formdata.append('email', email);
    formdata.append('password', N_password);
    let url = BaseURL + 'users/SignUp';
    await API_call(url, 'POST', formdata, (data) => {
        if (data.StatusCode === 200) {
            showalert('green', 'SignUp success!!!', data.Response);
            $('.signupdiv,.logindiv').slideToggle();
            return $('#signupform')[0].reset();
        } else { showalert('red', 'Error while Signup!!!', data.Response); }
    });
}
async function sessionstore(data) {
    await sessionStorage.removeItem('UI');
    await sessionStorage.removeItem('isLoggedin');
    await sessionStorage.removeItem('Email');
    await sessionStorage.removeItem('Name');
    await sessionStorage.setItem('UI', data.Response.Details.Uid);
    await sessionStorage.setItem('isLoggedin', "true");
    await sessionStorage.setItem('Email', data.Response.Details.Email);
    await sessionStorage.setItem('Name', data.Response.Details.Firstname + '' + data.Response.Details.Lastname);
    location.href = './chatView.html';
}