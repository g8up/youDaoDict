const getTime = (date) => {
  const cur = date ? new Date(date) : new Date();
  const h = cur.getHours();
  const m = cur.getMinutes();
  const s = cur.getSeconds();
  return [h, m, s].join(':');
};

const getDate = (time) => {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour12: false,
  };
  return (time ? new Date(time) : new Date()).toLocaleString('zh-cn', options);
};

module.exports = {
  getTime,
  getDate,
};
