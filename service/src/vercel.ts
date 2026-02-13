import { express } from "@vercel/express";
import app from "./app";

const handler = express(app);

export { handler as default, handler };
