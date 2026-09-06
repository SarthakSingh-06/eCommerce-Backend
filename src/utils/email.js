import "dotenv/config";
import nodemailer from "nodemailer";
import { API_Error } from "./api-error.js";

const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 2525,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
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

export {
    sendEmail,
};
