import React, { createContext, useContext, useState, useEffect } from 'react';
import { addDays } from 'date-fns';

interface TimeContextType {
  now: Date;
  setNow: React.Dispatch<React.SetStateAction<Date>>;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: { children: React.ReactNode }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    
    const timer = setInterval(() => {
      setNow(prev => addDays(prev, 1));
    }, 86400000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <TimeContext.Provider value={{ now, setNow }}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTime() {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
}
