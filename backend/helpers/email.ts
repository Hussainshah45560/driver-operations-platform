import sgMail from "@sendgrid/mail";
export class EmailHelper {
  sendEmailUsingSendGrid = async (mailOptions) => {
    sgMail.setApiKey(global["config"].SENDGRID_API_KEY);
    const msg = {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
      html: mailOptions.text,
    };

    await sgMail.send(msg);

    return { success: true };
  };
}
