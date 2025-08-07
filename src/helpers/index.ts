import crypto from "crypto";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { Time, VoteFromDB } from "../models/poll";

dayjs.extend(localizedFormat);

export const isTimePresentInPollTimes = (
  timeToSearch: Time,
  times: Time[]
): boolean => {
  return times.some(
    (time) => time.start === timeToSearch.start && time.end === timeToSearch.end
  );
};

export const slotCheckClassName = (time: Time, times: Time[]): string => {
  if (isTimePresentInPollTimes(time, times)) {
    if (
      times.find(
        (currentTime) =>
          currentTime.start === time.start && currentTime.end === time.end
      )?.ifNeedBe
    )
      return "poll-slot-checked-if-need-be";
    return "poll-slot-checked";
  }
  return "poll-slot-unchecked";
};

export const isTimeIfNeedBe = (time: Time, times: Time[]): boolean => {
  if (isTimePresentInPollTimes(time, times)) {
    if (
      times.find(
        (currentTime) =>
          currentTime.start === time.start && currentTime.end === time.end
      )?.ifNeedBe
    )
      return true;
    return false;
  }
  return false;
};

export const slotTimeClassName = (
  time: Time,
  voteTimes: Time[],
  finalTime?: Time
): string => {
  if (time.start === finalTime?.start && time.end === finalTime?.end)
    return "slot-time slot-final-time";

  if (isTimePresentInPollTimes(time, voteTimes)) {
    if (
      voteTimes.find(
        (currentTime) =>
          currentTime.start === time.start && currentTime.end === time.end
      )?.ifNeedBe
    )
      return "slot-time slot-if-need-be-time";
    return "slot-time slot-normal-time";
  }
  return "slot-time";
};

export const isUserPresentInVotes = (
  userToSearch: string,
  votes: VoteFromDB[]
): boolean => {
  return votes.some((vote) => vote.name === userToSearch);
};

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "";
const ENCRYPTION_IV = process.env.NEXT_PUBLIC_ENCRYPTION_IV || "";

console.log("🧪 ENCRYPTION_KEY length:", ENCRYPTION_KEY.length);
console.log("🧪 ENCRYPTION_IV length:", ENCRYPTION_IV.length);
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  throw new Error("🛑 ENCRYPTION_KEY is missing or incorrect length (should be 32 bytes)");
}
if (!ENCRYPTION_IV || ENCRYPTION_IV.length !== 16) {
  throw new Error("🛑 ENCRYPTION_IV is missing or incorrect length (should be 16 bytes)");
}

export const encrypt = (text: string): string => {
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    ENCRYPTION_IV
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
};

export const decrypt = (text: string): string => {
  const encryptedText = Buffer.from(text, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY),
    ENCRYPTION_IV
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const isDayAndMonthSame = (
  firstTime: Time,
  secondTime: Time
): boolean => {
  if (
    dayjs(firstTime.start).format("D") ===
      dayjs(secondTime.start).format("D") &&
    dayjs(firstTime.start).format("MMM") ===
      dayjs(secondTime.start).format("MMM")
  ) {
    return true;
  }
  return false;
};
