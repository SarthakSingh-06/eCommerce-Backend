import "dotenv/config";
import {  connect } from "mongoose";

export const connectDB = async () => {
    try {
        const connectionInstance = await connect(process.env.MONGODB_URI);
        console.log("Database connection successful!");
        console.log(`Connection host: ${connectionInstance.connection.host}`);
        console.log(`Connection port: ${connectionInstance.connection.port}`);
    } catch (error) {
        console.log("Database connection failed!!!");
        console.log(error);
    }
};
