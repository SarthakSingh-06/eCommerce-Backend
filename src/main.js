import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";

const PORT = process.env.PORT || 8080;

// first connect to database then start server
connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
})
.catch((error) => {
    console.log("Failed starting the server application!!");
    console.log(error);
});
