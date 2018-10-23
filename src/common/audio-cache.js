/**
 * 根据发音类型缓存 audio,以提高朗读响应速度
 */

/* {
  word: {
    0: audio,
    1: audio,
    2: audio,
  },
}
*/
let HASH = Object.create(null);

const LIMIT_COUNT = 10;

/**
 * 清除所有缓存，只留最后一次缓存的词
 */
const gc = (word) => {
  if (Object.keys(HASH).length > LIMIT_COUNT) {
    const temp = HASH[word];
    HASH = Object.create(null);
    HASH[word] = temp;
  }
};

const genAudio = (word, type) => {
  const audio = document.createElement('audio');
  const audioUrl = `https://dict.youdao.com/speech?audio=${word}&type=${type}`;
  audio.src = audioUrl;
  return audio;
};

export const getAudioByWordAndType = (word, type = 0) => {
  let audio = null;
  if (HASH[word]) {
    audio = HASH[word][type];
    if (!audio) {
      audio = HASH[word][type] = genAudio(word, type);
    }
  } else {
    HASH[word] = {
      [type]: genAudio(word, type),
    };
    audio = HASH[word][type];
    gc(word);
  }
  return audio;
};

export default {
  getAudioByWordAndType,
};
