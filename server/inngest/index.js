import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";




export const inngest = new Inngest({
  id: "movie-ticket-booking",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

console.log(
  "DEBUG: Inngest Event Key Loaded:",
  process.env.INNGEST_EVENT_KEY ? "✅ Loaded" : "❌ MISSING"
);

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
    console.log("🔥 releaseSeatsAndDeleteBooking triggered", event.data.bookingId);

    try {
      // Wait 10 minutes
      const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
      console.log(`⏱ Sleeping until ${tenMinutesLater}`);
      await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

      // Fetch booking
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.log(`⚠️ Booking not found: ${bookingId}`);
        return;
      }

      // If not paid, release seats and delete booking
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        if (!show) {
          console.log(`⚠️ Show not found: ${booking.show}`);
          return;
        }

        booking.bookedSeats.forEach(seat => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();

        await Booking.findByIdAndDelete(booking._id);
        console.log(`✅ Released seats and deleted booking: ${bookingId}`);
      } else {
        console.log(`💰 Booking already paid: ${bookingId}`);
      }
    } catch (err) {
      console.error("❌ Error in releaseSeatsAndDeleteBooking:", err);
    }
  }
);




export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation, releaseSeatsAndDeleteBooking];
