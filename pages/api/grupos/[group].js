// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../utils/mongodb";
//import { async } from "../../produtos/[prod]";

const handler = async (req, res) => {
  try {
    const { method } = req;

    switch (method) {
      case "GET":
        //buscar no mongodb
        const param = req.query;

        const { db } = await connectToDatabase();
        const data = await db
          .collection("produtos")
          .find({ CODGRUPO: Number(param.group) })
          .toArray();

        res.status(200).json(data);

        break;

      default:
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
};

export default handler;
