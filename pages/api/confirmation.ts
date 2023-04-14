// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    const { phoneNumber } = req.body;

    const encodedParams = new URLSearchParams();
    encodedParams.set("key", process.env.IVR_KEY as string);
    encodedParams.set("clientid", process.env.IVR_CLIENT_ID as string);
    encodedParams.set("phone", phoneNumber);
    encodedParams.set(
      "message",
      "Thanks for Calling Just Nyay Please visit www.justnyay.com to book your appointment for the best legal solution or write to us at info@justnyay.com"
    );
    encodedParams.set("senderid", "JUSTNY");
    encodedParams.set("linkid", "justnay");
    encodedParams.set("templateid", "1707166989016781621");

    const url =
      `https://sms.ivrguru.com/api/v1/sms?` + encodedParams.toString();

    try {
      await fetch(url)
        .then((response) => {
          return res.status(200).send({ response });
        })
        .catch((err) => {
          return res.status(500).send({ error: err.message });
        });
    } catch (err) {
      return res.status(500).send({ error: "Server error" });
    }
  } else {
    res.status(400).send({ error: "Method Denied" });
  }
}
