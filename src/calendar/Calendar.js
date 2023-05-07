import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "daypilot-pro-react";
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import "./CalendarStyles.css";
import "./MonthStyles.css";
import "./icons/style.css";

const styles = {
  wrap: {
    display: "flex"
  },
  left: {
    marginRight: "10px"
  },
  main: {
    flexGrow: "1"
  }
};

class Calendar extends Component {

  constructor(props) {
    super(props);
    this.calendarRef = React.createRef();
    this.state = {
      viewType: "Week",
      durationBarVisible: false,
      timeRangeSelectedHandling: "Enabled",
      cellDuration: 15,
      cellHeight: 15,
      heightSpec: "Full",
      dayBeginsHour: 4,
      locale: "pt-br",
      onBeforeEventRender: args => {
        args.data.borderColor = "darker";
        if (args.data.backColor) {
          args.data.barColor = DayPilot.ColorUtil.darker(args.data.backColor, -1);
        }
      },
     contextMenu: new DayPilot.Menu({
        items: [
          {
            text: "Delete",
            onClick: args => {
              const e = args.source;
              this.calendar.events.remove(e);
              localStorage.setItem('eventos', JSON.stringify(this.calendar.events.list));
            }
          },
          {
            text: "-"
          },
          {
            text: "Blue",
            icon: "icon icon-blue",
            color: "#3d85c6",
            onClick: args => this.updateColor(args.source, args.item.color)
          },
          {
            text: "Green",
            icon: "icon icon-green",
            color: "#6aa84f",
            onClick: args => this.updateColor(args.source, args.item.color)
          },
          {
            text: "Yellow",
            icon: "icon icon-yellow",
            color: "#ecb823",
            onClick: args => this.updateColor(args.source, args.item.color)
          },
          {
            text: "Red",
            icon: "icon icon-red",
            color: "#d5663e",
            onClick: args => this.updateColor(args.source, args.item.color)
          },
          {
            text: "Auto",
            color: null,
            onClick: args => this.updateColor(args.source, args.item.color)
          },

        ]
      }), 
      onTimeRangeSelected: async args => {
        const dp = this.calendar;
        const modal = await DayPilot.Modal.prompt("Criar novo evento:", "Evento 1");
        dp.clearSelection();
        if (!modal.result) { return; }
        dp.events.add({
          start: args.start,
          end: args.end,
          id: DayPilot.guid(),
          text: modal.result
        });
        localStorage.setItem('eventos', JSON.stringify(dp.events.list));
        console.log(dp.events.list)
      },
      eventDeleteHandling: "Update",
      onEventClick: async args => {
        const dp = this.calendar;
        const modal = await DayPilot.Modal.prompt("Alterar texto do evento:", args.e.text());
        if (!modal.result) { return; }
        const e = args.e;
        e.data.text = modal.result;
        dp.events.update(e);
        localStorage.setItem('eventos', JSON.stringify(this.calendar.events.list));
      },
      onEventMove: (args) => {
        const dp = this.calendar;
        console.log(args)
        if (args.ctrl) {
          var newEvent = new DayPilot.Event({
            start: args.newStart,
            end: args.newEnd,
            text:  args.e.text(),
            resource: args.newResource,
            id: DayPilot.guid()  // generate random id
          });
          this.updateColor(newEvent, args.e.data.backColor)
          dp.events.add(newEvent);  
          args.preventDefault(); // prevent the default action - moving event to the new location
        } 
        localStorage.setItem('eventos', JSON.stringify(dp.events.list));
      },
      onEventResized: () => {
        const dp = this.calendar;
        localStorage.setItem('eventos', JSON.stringify(dp.events.list));
      }
    };
  }

  get calendar() {
    return this.calendarRef.current.control;
  }

  updateColor(e, color) {
    e.data.backColor = color;
    this.calendar.events.update(e);
    localStorage.setItem('eventos', JSON.stringify(this.calendar.events.list));
  }

  componentDidMount() {

    const events = JSON.parse(localStorage.getItem('eventos'));
    //require("./events.json")

    const startDate = "2023-05-01";

    this.calendar.update({startDate, events});

  }

  render() {
    return (
      <div style={styles.wrap}>
        <div style={styles.left}>
          <DayPilotNavigator
            locale={"pt-br"}
            selectMode={"week"}
            showMonths={3}
            skipMonths={3}
            startDate={"2023-05-01"}
            selectionDay={"2023-05-01"}
            onTimeRangeSelected={ args => {
              this.calendar.update({
                startDate: args.day
              });
            }}
          />
        </div>
        <div style={styles.main}>
        <Button variant="contained" onClick={() => localStorage.setItem('eventos', JSON.stringify(this.calendar.events.list))}><SaveIcon /></Button> 
        <Button variant="contained">Repetir semana anterior</Button>
          <DayPilotCalendar
            {...this.state}
            ref={this.calendarRef}
            
          />
        </div>
      </div>
    );
  }
}

export default Calendar;
