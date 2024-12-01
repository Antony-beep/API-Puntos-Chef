import dotenv from 'dotenv';
dotenv.config()

export const KEYS ={
    API_KEY: process.env.API_KEY,
    PORT: process.env.PORT,
    PORT2: process.env.PORT2,
    QR_PASSWORD: process.env.QR_PASSWORD
}