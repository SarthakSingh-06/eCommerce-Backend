import "dotenv/config";
import nodemailer from "nodemailer";
import { API_Error } from "./api-error.js";
import Mailgen from "mailgen";

const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'eCommerce.Backend',
        link: 'http://localhost:8000',
    }
});

const sendEmail = async ({ from, to, subject, text, html=undefined }) => {
    try {
        const response = await transport.sendMail({
            from, to, subject, text,
            html: html ? html : `<div>${text}</div>`
        });

        return response;
    } catch (error) {
        throw API_Error.internalServerError(`Failed to send the email:\n${error}`);
    }
};

const generateForgotPasswordMail = (name, redirectLink) => {
    const email = {
        body: {
            name,
            intro: 'Welcome to eCommerce.Backend! We\'re very happy to help you with your issues.',
            action: {
                instructions: 'To get started with eCommerce.Backend, please click here:',
                button: {
                    color: '#2c65f5ff',
                    text: 'Confirm your account',
                    link: redirectLink
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };

    const emailHTML = mailGenerator.generate(email);
    const emailText = mailGenerator.generatePlaintext(email);

    return { emailText, emailHTML, };
};

export {
    sendEmail,
    generateForgotPasswordMail,
};
