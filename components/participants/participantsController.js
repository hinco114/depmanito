const { Participants } = require('../db');

const shuffledArray = (arr) => {
  const array = [...arr];
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    const temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const matchManito = async (roomId) => {
  try {
    return true;

  } catch (err) {
    throw err;
  }
};

module.exports = {
  matchManito,
};
