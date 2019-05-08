var passwordHash = require('password-hash');
var nodemailer = require('nodemailer');

// Password hash creation
exports.PasswordHashCreate = async function (psw, callback) {
    callback(await passwordHash.generate(psw));
};

// Password Verify function
exports.PasswordCheck = async function (psw, hash, callback) {
    callback(await passwordHash.verify(psw, hash));
};

// Node Mailer
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '05veera05@gmail.com',
        pass: 'Veera#123'
    }
});
// Mail Send
exports.MailSend = async function (MailSendercredentials, callback) {
    var mailOptions = {
        from: MailSendercredentials.FromMail,
        to: MailSendercredentials.To,
        subject: MailSendercredentials.Subject,
        text: MailSendercredentials.Text,
        html: MailSendercredentials.Html
    };
    await transporter.sendMail(mailOptions, function (err, info) {
        callback(err, info)
    });
};