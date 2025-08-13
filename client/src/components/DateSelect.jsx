/* eslint-disable no-unused-vars */
import { useState } from 'react';
import BlurCircle from './BlurCircle';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const parseLocalDate = (dateStr) => new Date(dateStr + 'T12:00:00');

const DateSelect = ({ dateTime, id }) => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const onBookHandler = () => {
    if (!selected) {
      return toast('Please select a date');
    }
    navigate(`/movies/${id}/${selected}`);
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  return (
    <div id="dateSelect" className="pt-30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg">
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="100px" right="0px" />

        <div>
          <p className="text-lg font-semibold">Choose Date</p>
          <div className="flex items-center gap-6 text-sm mt-5 overflow-x-auto">
            <ChevronLeftIcon width={28} />
            <span className="flex gap-4">
              {Object.keys(dateTime).map((date) => {
                const localDate = parseLocalDate(date);
                return (
                  <button
                    type="button"
                    key={date}
                    aria-pressed={selected === date}
                    onClick={() => setSelected(date)}
                    className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer transition-all ${
                      selected === date
                        ? 'bg-primary text-white'
                        : 'border border-primary/70'
                    }`}
                  >
                    <span>{localDate.getDate()}</span>
                    <span>
                      {localDate.toLocaleString('en-US', { month: 'short' })}
                    </span>
                  </button>
                );
              })}
            </span>
            <ChevronRightIcon width={28} />
          </div>
        </div>

        <button
          onClick={onBookHandler}
          className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
