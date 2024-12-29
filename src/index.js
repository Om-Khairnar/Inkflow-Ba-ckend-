// //require('dotenv').config()
// import dotenv from "dotenv";
// import connectDB from "./db/db.js";
// import { app } from "./app.js";
// dotenv.config({
//   path: "./.env",
// });

// connectDB()
//   .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//       console.log(`Server is running at port : ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("MONGO db connection failed !!!");
//   });

import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    console.log(`MongoDB connected successfully`);
  })
  .catch((err) => {
    console.log("MONGO db connection failed!!!");
  });

// Export the app as the handler for Vercel
export default app;
