const nodemailer = require('nodemailer');
const db = require('../../db');

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      auth: {
        user: 'z.elasri@aui.ma',
        pass: process.env.MAILER_PASS
      }
    });
  }
  getTransporter() {
    if (this.transporter === undefined)
      throw new Error(
        'Transporter not initialized - please call initializeTransporter with options as argument first !'
      );
    return this.transporter;
  }
  async sendVerificationEmail(host, user) {
    const { token } = await db.VerificationToken.create({
      userId: user._id,
      token: require('crypto')
        .randomBytes(16)
        .toString('hex')
    });
    return await this.transporter.sendMail({
      from: 'z.elasri@aui.ma',
      to: user.profile.email,
      subject: 'Account Verification Token',
      text: `Hello ${user.profile.firstname} ${
        user.profile.lastname
      },\n\nPlease Verify your account by clicking the link: \nhttp://${host}/api/confirmation/${token}\n\n`
    });
  }
}

module.exports = new Mailer();
