import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import { inngest, functions } from './inngest/index.js';
import { serve } from 'inngest/express';

dotenv.config();

if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
  throw new Error("Missing Clerk environment variables");
}

const app = express();
const port = 3000;

await connectDB();


app.use(express.json());
app.use(cors());
app.use(clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
}));


app.get('/', (req, res) => {
    res.send('Server is Live!')

})
app.use('/api/inngest', serve({client: inngest, functions }))

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
