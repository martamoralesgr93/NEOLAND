

export const changeColorRGB = () => {
    const randomNumber = (min, max) => {
      min = Math.ceil(min);
      console.log(min);
      max = Math.floor(max);
      const random = Math.floor(Math.random() * (max - min + 1) + min);
      return random;
    };
  
    let R = randomNumber(0, 255);
    let G = randomNumber(0, 255);
    let B = randomNumber(0, 255);
  
    const color = `rgb(${R},${G},${B})`;
    return color;
  };