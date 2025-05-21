import React from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './CalendarWidget.scss';

interface CalendarWidgetProps {
  events: { startDate: string }[];
  selectedDate: Date;
  onDateClick: (date: Date) => void;
}

const CalendarWidget = ({ events, selectedDate, onDateClick }: CalendarWidgetProps) => {
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const hasEvent = events.some(event =>
        new Date(event.startDate).toDateString() === date.toDateString()
      );
      return hasEvent ? "event-day" : null;
    }
    return null;
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const hasEvent = events.some(event =>
        new Date(event.startDate).toDateString() === date.toDateString()
      );
      return hasEvent ? <div className="event-underline"></div> : null;
    }
    return null;
  };

  return (
    <Calendar
      value={selectedDate}
      onClickDay={onDateClick}
      tileClassName={tileClassName}
      tileContent={tileContent}
    />
  );
};

export default CalendarWidget;
