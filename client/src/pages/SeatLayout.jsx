/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyShowsData, dummyDateTimeData, assets } from "../assets/assets";
import Loading from "../components/Loading";
import { ArrowUpRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import { toast } from "react-hot-toast";
import { useAppContext } from "../context/AppContext";
const SeatLayout = () => {

  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

  const { id, date } = useParams();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const navigate = useNavigate();
  const{axios, user, getToken} = useAppContext();

  const getShow = async () => {
    try {
      const{data} = await axios.get(`/api/show/${id}`);
      if(data.success) {
        setShow(data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred fetching show. Please try again.")
    }

  };

const getOccupiedSeats = async () => {
  if (!selectedTime?.showId) {
    return;
  }

  try {
    const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`);
    if (data.success) {
      setOccupiedSeats(data.occupiedSeats);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.error(error);
    toast.error("An error occurred fetching occupied seats. Please try again.");
  }
};
  const handleSeatClick = (seatId) => {
    if(!selectedTime){
        return toast('Please select a time first');
    }
    if(!selectedSeats.includes(seatId) && selectedSeats.length > 4){
      return toast('You can only select 5 seats');
    } 
    if(occupiedSeats.includes(seatId)){
      return toast('This seat is already occupied');
    }
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]);
  
  };

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {Array.from({length: count}, (_,i) => {
          const seatId = `${row}${i + 1}`;
          return(
            <button key={seatId} onClick={() => handleSeatClick(seatId)} className={`h-8 w-8 rounded border border-primary/60 cursor-pointer
             ${selectedSeats.includes(seatId) && "bg-primary text-white"} ${occupiedSeats.includes(seatId) && "opacity-50"}`}>
              {seatId}
            </button>
          )
        } )}
      </div>

    </div>
  )
  
  const bookTickets = async () => {
    try {
      if(!user) return toast.error("You must be logged in to book tickets.");
        if(!selectedTime || !selectedSeats.length) return toast.error("Please select a time and at least one seat.");
        const {data} = await axios.post('/api/booking/create', {showId: selectedTime.showId, selectedSeats}, {headers: {
          Authorization: `Bearer ${await getToken()}`
        }})

        if(data.success) {
          window.location.href = data.url;
          

        }else{
          toast.error(data.message);
        }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred booking tickets. Please try again.")
    }
  }
  

  useEffect(() => {
    getShow();
    
  }, [id]);

useEffect(() => {

    if(selectedTime){
      getOccupiedSeats();
    }

}, [selectedTime]);

console.log(show)


  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show.dateTime[date].map((item) => (
     
            <div
              key={item.time}
onClick={() => {

  setSelectedTime({ ...item, showId: item.show_Id });
}}
              className={`flex items-center gap-2 px-6 py-2 w-full md:w-48 rounded-r-md cursor-pointer transition ${
                selectedTime?.time === item.time
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"
              }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="0" right="0" />
        <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
        <img src={assets.screenImage} alt="screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
              {groupRows[0].map((row) => renderSeats(row))}
            </div>
                    <div className="grid grid-cols-2 gap-11">
          {groupRows.slice(1).map((group, index) => (
            <div key={index}>
              {group.map((row) => renderSeats(row))}
            </div>
          ))}

        </div>
        </div>

        <button onClick={bookTickets} className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95">Proceed to Checkout
          <ArrowUpRightIcon strokeWidth={3} className="w-4 h-4" />
          </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
}

export default SeatLayout;
