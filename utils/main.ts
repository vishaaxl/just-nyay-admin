import moment from "moment";

export const generateUid = (date: any, id: string) => {
  return `JNY${moment(date).format("l").replaceAll("/", "")}${id
    .slice(0, 4)
    .toUpperCase()}`;
};
