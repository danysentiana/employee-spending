import db from "../helper/knex.js";
import help from "../helper/helper.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

function maintenanceCheck() {
  return new Promise((resolve, reject) => {
    db("maintenance")
      .select("*")
      .where("id", 1)
      .then((result) => {
        resolve({
          status: "ok",
          data: result,
          message: "Maintenance Check Success"
        });
      }).catch((error) => {
        console.log(error);
        reject("Maintenance Check Failed");
      });
  });
}

function resetPassword(email) {
  return new Promise((resolve, reject) => {
    db(`user_web`)
      .select("*")
      .where("email", email)
      .limit(1)
      .then((result) => {
        if(result[0] !== undefined){
          let key = help.sha256(process.env.APP_KEY+email)
          let dataEmail = {
            key: key,
            nama: result[0].fullname,
            email: email,
            service_url: process.env.APP_URL+"/reset-password/update?email="+email+"&key="+key
          };
          sendEmail(dataEmail);
          resolve({
            status: "ok",
            data: email,
            message: "Reset Password Success"
          });
        }else{
          reject("Reset Password Failed");
        }
      }).catch((error) => {
        console.log(error);
        reject("Reset Password Failed");
      });
  });
}

function updatePassword(data) {
  return new Promise((resolve, reject) => {
    if(data.key === help.sha256(process.env.APP_KEY+data.email)){
      let dataUpdate = {
        password: help.hashBcrypt(data.pass)
      };
      db(`user_web`)
        .where("email", data.email)
        .update(dataUpdate)
        .then(() => {
          resolve({
            status: "ok",
            data: "",
            message: "Update Password Success"
          });
        }).catch((error) => {
          console.log(error);
          reject("Update Password Failed");
        });
    }else{
      reject("Update Password Failed");
    }
  });
}

function changePassword(data, decoded) {
  return new Promise((resolve, reject) => {
      db(`admin`).select("*").where(`email`, decoded.email).where(`flag`, 1).then((result) => {
        if (result.length > 0) {
          if(bcrypt.compareSync(data.oldPass, result[0].password)) {
            let dataUpdate = {
              password: help.hashBcrypt(data.newPass)
            };
            db(`admin`)
              .where("email", decoded.email)
              .update(dataUpdate)
              .then(() => {
                resolve({
                  status: "ok",
                  data: "",
                  message: "Change Password Success"
                });
              }).catch((error) => {
                console.log(error);
                reject("Change Password Failed");
              });
          }else{
            reject("Change Password Failed");
          }
        }
      }).catch((error) => {
        console.log(error)
        reject("Change Password Failed");
      });
  });
}

function sendEmail(data) {
    console.log("=====EMAIL CONFIRMATION DATA=====",JSON.stringify(data));
    // let testAccount = await nodemailer.createTestAccount();


    let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });


    let info = transporter.sendMail({
        from: '"employee-spending-web" <'+process.env.MAIL_USER+'>',
        to: data.email,
        subject: "Reset Password",
        text: "Hii "+data.nama,
        html: '<!DOCTYPE html><html><head> <meta charset="utf-8" /> <title>Reset Password | PPNI Web</title> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- App favicon --> <link rel="shortcut icon" href='+data.service_url+'"/Hyper_v5.4/Admin/dist/creative/assets/images/favicon.ico"> <style type="text/css"> /** * Google webfonts. Recommended to include the .woff version for cross-client compatibility. */ @media screen { @font-face { font-family: "Source Sans Pro"; font-style: normal; font-weight: 400; src: local("Source Sans Pro Regular"), local("SourceSansPro-Regular"), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format("woff"); } @font-face { font-family: "Source Sans Pro"; font-style: normal; font-weight: 700; src: local("Source Sans Pro Bold"), local("SourceSansPro-Bold"), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format("woff"); } } /** * Avoid browser level font resizing. * 1. Windows Mobile * 2. iOS / OSX */ body, table, td, a { -ms-text-size-adjust: 100%; /* 1 */ -webkit-text-size-adjust: 100%; /* 2 */ } /** * Remove extra space added to tables and cells in Outlook. */ table, td { mso-table-rspace: 0pt; mso-table-lspace: 0pt; } /** * Better fluid images in Internet Explorer. */ img { -ms-interpolation-mode: bicubic; } /** * Remove blue links for iOS devices. */ a[x-apple-data-detectors] { font-family: inherit !important; font-size: inherit !important; font-weight: inherit !important; line-height: inherit !important; color: inherit !important; text-decoration: none !important; } /** * Fix centering issues in Android 4.4. */ div[style*="margin: 16px 0;"] { margin: 0 !important; } body { width: 100% !important; height: 100% !important; padding: 0 !important; margin: 0 !important; } /** * Collapse table borders to avoid space between cells. */ table { border-collapse: collapse !important; } a { color: #1a82e2; } img { height: auto; line-height: 100%; text-decoration: none; border: 0; outline: none; } </style></head><body style="background-color: #e9ecef;"> <table border="0" cellpadding="0" cellspacing="0" width="100%"> <tr> <td align="center" bgcolor="#e9ecef"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;"> <tr> <td align="center" valign="top" style="padding: 36px 24px;"> <a href='+data.service_url+' target="_blank" style="display: inline-block;"> <img src="../Hyper_v5.4/Admin/dist/creative/assets/images/logo-dark.png" alt="Logo" border="0" width="150" style="display: block; width: 150px; max-width: 150px; min-width: 150px;"> </a> </td> </tr> </table> </td> </tr> <tr> <td align="center" bgcolor="#e9ecef"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;"> <tr> <td align="center" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;"> <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Password Reset</h1> </td> </tr> </table> </td> </tr> <tr> <td align="center" bgcolor="#e9ecef"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;"> <tr> <td align="center" bgcolor="#ffffff" style="padding: 24px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"> <p style="margin: 0;">If you have lost your password or wish to reset it,<br> use the link below to get started.</p> </td> </tr> <tr> <td align="left" bgcolor="#ffffff"> <table border="0" cellpadding="0" cellspacing="0" width="100%"> <tr> <td align="center" bgcolor="#ffffff" style="padding: 12px;"> <table border="0" cellpadding="0" cellspacing="0"> <tr> <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;"> <a href='+data.service_url+' target="_blank" style="display: inline-block; padding: 16px 36px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Your Password</a> </td> </tr> </table> </td> </tr> </table> </td> </tr> <tr> <td align="center" bgcolor="#ffffff" style="padding: 24px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"> <p style="margin: 0;">If you did not request a password reset, you can safely ignore this email.<br> Only a person with access to your email can reset to your account password.</p> </td> </tr> <tr> <td align="center" bgcolor="#ffffff" style="padding: 14px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"> <p style="margin: 0;"></p> </td> </tr> </table> </td> </tr> <tr> <td align="center" bgcolor="#e9ecef" style="padding: 24px;"> <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;"> <tr> <td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"> <p style="margin: 0;">© 2024 PPNI Web. All rights reserved. | Developed by Rupinoz.</p> </td> </tr> </table> </td> </tr> </table></body></html>'
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

export default {
  maintenanceCheck,
  resetPassword,
  updatePassword,
  changePassword,
  sendEmail
};
