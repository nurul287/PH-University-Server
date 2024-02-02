import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: config.node_env === 'production' ? true : false,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: 'nurulalamarif2@gmail.com',
    pass: 'aoak uphp kbpl zzrp',
  },
});

// async..await is not allowed in global scope, must use a wrapper
export const sendEmail = async function (to: string, html: string) {
  // send mail with defined transport object
  await transporter.sendMail({
    from: 'nurulalamarif2@gmail.com', // sender address
    to, // list of receivers
    subject: 'Reset Password', // Subject line
    text: 'Please reset your password withing 10 mins!', // plain text body
    html, // html body
  });
};
