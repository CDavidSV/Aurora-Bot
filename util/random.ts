const randomColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16);
}

const randomValue = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
    randomColor,
    randomValue
}