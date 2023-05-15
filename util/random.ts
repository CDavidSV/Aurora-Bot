/**
 * 
 * @returns random color in hex.
 */
const randomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * 
 * @param min 
 * @param max 
 * @returns random numerical value.
 */
const randomValue = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
    randomColor,
    randomValue
}