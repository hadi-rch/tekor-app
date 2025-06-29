import { Dimensions, PixelRatio } from 'react-native';

// Ambil lebar dan tinggi layar perangkat
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Skala desain didasarkan pada lebar layar standar (misalnya iPhone 8)
const widthBaseScale = SCREEN_WIDTH / 375;
const heightBaseScale = SCREEN_HEIGHT / 812;

function normalize(size, based = 'width') {
    const newSize = (based === 'height') ?
        size * heightBaseScale : size * widthBaseScale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

// Untuk lebar dan tinggi
const widthPixel = (size) => {
    return normalize(size, 'width');
};

const heightPixel = (size) => {
    return normalize(size, 'height');
};

// Untuk ukuran font
const fontPixel = (size) => {
    return heightPixel(size);
};

// Untuk padding, margin, dll.
const pixelSizeVertical = (size) => {
    return heightPixel(size);
};

const pixelSizeHorizontal = (size) => {
    return widthPixel(size);
};

export {
    widthPixel,
    heightPixel,
    fontPixel,
    pixelSizeVertical,
    pixelSizeHorizontal,
};
