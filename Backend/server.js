import express from "express";
import cors from "cors";
import timRoute from "./routes/tim.route.js";
import eliRoute from "./routes/eli.route.js";
import jaronRoute from "./routes/jaron.route.js";
import javiRoute from "./routes/javi.route.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/tim-lee", timRoute);
app.use("/api/eli-tolentino", eliRoute);
app.use("/api/jaron-lin", jaronRoute);
app.use("/api/javi-wu", javiRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
