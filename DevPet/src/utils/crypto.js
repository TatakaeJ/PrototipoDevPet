import CryptoJS from 'crypto-js';

// Centralizamos la función de encriptación
export const hashPassword = (password) => {
    return CryptoJS.SHA256(password).toString();
};