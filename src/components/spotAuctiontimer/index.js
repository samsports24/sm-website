import React, { useEffect, useState } from 'react';
import './spotauction.css';
import { useSelector } from 'react-redux';

const SpotAuctionTimer = ({ spotAuctionEnd, onTimerFinish }) => {
  const { socket } = useSelector((state) => state.socket)
  const [timeRemaining, setTimeRemaining] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });







  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!spotAuctionEnd) return;

      const now = new Date().getTime();
      const draftStartTime = new Date(spotAuctionEnd).getTime()  
      const distance = draftStartTime - now;

      if (distance < 0) {
        setTimeRemaining({
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
        });
        onTimerFinish(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const formatTime = (time) => (time < 10 ? `0${time}` : `${time}`);

      setTimeRemaining({
        days: formatTime(days),
        hours: formatTime(hours),
        minutes: formatTime(minutes),
        seconds: formatTime(seconds),
      });

      onTimerFinish(false);
    };

    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [spotAuctionEnd, onTimerFinish]);

  return (
    <div className='timemaindiv'>
      <div className='timeheading'>
        DAYS
        <div className='timepara'>{timeRemaining.days}</div>
      </div>
      <div className='timeheading'>
        HOURS
        <div className='timepara'>{timeRemaining.hours}:</div>
      </div>
      <div className='timeheading'>
        MINUTES
        <div className='timepara'>{timeRemaining.minutes}:</div>
      </div>
      <div className='timeheading'>
        SECONDS
        <div className='timepara'>{timeRemaining.seconds}</div>
      </div>
    </div>
  );
};

export default SpotAuctionTimer;
