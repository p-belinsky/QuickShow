import dotenv from "dotenv";
dotenv.config();

import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";
import { formatInTimeZone } from 'date-fns-tz';

const THEATER_TIMEZONE = 'America/New_York';


export const inngest = new Inngest({
  id: "movie-ticket-booking",
  eventKey: process.env.INNGEST_EVENT_KEY,
});




const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  {
    event: "clerk/user.created",
  },
  async ({event}) => {
    const {id, first_name, last_name, email_addresses, image_url} = event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url,
    }
    await User.create(userData);
  }
);

const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
  },
  {
    event: "clerk/user.deleted",
  },
  async ({event}) => {
        const { id } = event.data;
        await User.findByIdAndDelete(id);
    }

  
);

const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  {
    event: "clerk/user.updated",
  },
  async ({event}) => {
    const {id, first_name, last_name, email_addresses, image_url} = event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url,
    }
    await User.findByIdAndUpdate(id, userData);
  }
);

const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
  },
  {
    event: "app/checkpayment", // Make sure this exactly matches what you send
  },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil('wait-for-10-minutes',tenMinutesLater);

    await step.run('check-payment-status', async () => {
        const bookingId = event.data.bookingId;
        const booking = await Booking.findById(bookingId);

        if(!booking.isPaid) {
          const show = await Show.findById(booking.show);
          booking.bookedSeats.forEach((seat) => {
           delete show.occupiedSeats[seat] 
          })
          show.markModified("occupiedSeats");
          await show.save();
          await Booking.findByIdAndDelete(booking._id);
        }
      
    })
  }
);

const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event, step }) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "Movie"
        }
      })
      .populate("user");

    // Add 4 hours to correct stored UTC time
    const correctedTime = addHours(new Date(booking.show.showDateTime), 4);

    const formattedDate = formatInTimeZone(correctedTime, THEATER_TIMEZONE, 'M/d/yyyy');
    const formattedTime = formatInTimeZone(correctedTime, THEATER_TIMEZONE, 'h:mm:ss a');

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hi ${booking.user.name},</h2>
          <p>Your booking for <strong style="color: #F84565;">"${booking.show.movie.title}"</strong> is confirmed.</p>
          <p>
            <strong>Date:</strong> ${formattedDate}<br/>
            <strong>Time:</strong> ${formattedTime}<br/>
          </p>
          <p>Enjoy the show! 🍿</p>
          <p>Thanks for booking with us! <br/>- QuickShow Team</p>
        </div>
      `
    });
  }
);




export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking, sendBookingConfirmationEmail];
