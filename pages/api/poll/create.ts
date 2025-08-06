console.log(
  'DEBUG: NEXTAUTH_SECRET length:',
  process.env.NEXTAUTH_SECRET ? process.env.NEXTAUTH_SECRET.length : 0
);
console.log(
  'DEBUG: NEXTAUTH_URL:',
  process.env.NEXTAUTH_URL || '(not set)'
);
console.log(
  'DEBUG: MONGO_URI starts with:',
  process.env.MONGO_URI?.slice(0, 30) || '(not set)'
);

import { NextApiRequest, NextApiResponse } from "next";
import SamayPoll, { PollDoc } from "../../../src/models/poll";
import connectToDatabase from "../../../src/utils/db";

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { method, body } = req;

  switch (method) {
    case "POST":
      try {
        await connectToDatabase();
        const newPoll: PollDoc = new SamayPoll(JSON.parse(body));
        await newPoll.save();
        res.status(201).json(newPoll);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
