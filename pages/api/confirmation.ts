// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    const { phoneNumber } = req.body;

    const paramsForUser = new URLSearchParams();
    paramsForUser.set("key", process.env.IVR_KEY as string);
    paramsForUser.set("clientid", process.env.IVR_CLIENT_ID as string);
    paramsForUser.set("phone", phoneNumber);
    paramsForUser.set(
      "message",
      `ThankYou for purchasing the plan of Rs.599 from Justnyay.com You can access to you dashboard by visiting Justnyay.com/login/user Team Just Nyay`
    );
    paramsForUser.set("senderid", "JUSTNY");
    paramsForUser.set("linkid", "justnay");
    paramsForUser.set("templateid", "1707167455422356839");

    const paramsForAdmin = new URLSearchParams();
    paramsForAdmin.set("key", process.env.IVR_KEY as string);
    paramsForAdmin.set("clientid", process.env.IVR_CLIENT_ID as string);
    paramsForAdmin.set("phone", "9711383973");
    paramsForAdmin.set(
      "message",
      `Hello Admin, A new purchase of Rs.599 has been made on the website Justnyay.com`
    );
    paramsForAdmin.set("senderid", "JUSTNY");
    paramsForAdmin.set("linkid", "justnay");
    paramsForAdmin.set("templateid", "1707167480503909442");

    const urlForUser =
      `https://sms.ivrguru.com/api/v1/sms?` + paramsForUser.toString();
    const urlForAdmin =
      `https://sms.ivrguru.com/api/v1/sms?` + paramsForAdmin.toString();

    const urls = [urlForUser, urlForAdmin];

    try {
      const responses: any = await Promise.allSettled(
        urls.map(async (url) => {
          const response = await fetch(url);
          return response.json();
        })
      ).catch((err) => {
        return res.status(500).send({ error: err.message });
      });

      return res.status(200).send({ response: responses });
    } catch (err) {
      return res.status(500).send({ error: "Server error" });
    }
  } else {
    res.status(400).send({ error: "Method Denied" });
  }
}
