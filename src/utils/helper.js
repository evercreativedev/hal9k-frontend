import moment from "moment";
export const dateFormat = (timestamp) => {
  return moment
    .unix(timestamp)
    .utc()
    .format("YYYY/MM/DD h:mm A z");
};

export const msToTime = duration => {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60) / 24)) * 24 + Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

  return `${hours} : ${minutes} : ${seconds}`;
};
