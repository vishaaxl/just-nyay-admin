import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import puppeteer from "puppeteer";
import handlers from "handlebars";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const {
    fullname,
    phoneNumber,
    email,
    invoiceId,
    dateIssued,
    description,
    price,
  } = JSON.parse(req.body);

  try {
    // read our invoice-template.html file using node fs module
    const file = fs.readFileSync("./invoice-template.html", "utf8");

    // compile the file with handlebars and inject the customerName variable
    const template = handlers.compile(`${file}`);
    const html = template({
      fullname,
      phoneNumber,
      email,
      invoiceId,
      dateIssued,
      description,
      price,
    });

    // simulate a chrome browser with puppeteer and navigate to a new page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // set our compiled html template as the pages content
    // then waitUntil the network is idle to make sure the content has been loaded
    await page.setContent(html, { waitUntil: "networkidle0" });

    // convert the page to pdf with the .pdf() method
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();

    // send the result to the client
    res.statusCode = 200;
    res.send(pdf);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "something went wrong" });
  }
}
