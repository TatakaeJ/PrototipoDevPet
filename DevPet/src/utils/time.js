export const getLocalDate = () => {
    return new Date().toLocaleDateString('en-CA');
};

export const getLocalTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};