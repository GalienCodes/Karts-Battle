export function getRandom(rng) {
  let rand = 0;
  if(rng) {
    rand = rng.quick();
  }
  else {
    rand = Math.random();
  }
  return rand;
}
/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min, max, rng) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(getRandom(rng) * (max - min + 1)) + min;
}

export function getRandomListEntry(list, rng) {
  let index = getRandomInt(0, list.length - 1, rng);
  return list[index];
}

export function shuffleArray(array, rng) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(getRandom(rng) * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}