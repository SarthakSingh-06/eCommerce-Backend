import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: "16kb", extended: true }));

// imoprt the routes
import healthRouter from "./routes/health.route.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/user", userRouter);

export { app };
