import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "daypilot-pro-react";
import database from '../firebase';
import {ref, set, get } from "firebase/database";
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ButtonGroup from '@mui/material/ButtonGroup';
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
  },
  mobile: {
    display: "flex",
    justifyContent: "center",
  }
};



function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let currentDate = new Date().toJSON().slice(0, 10)

class Calendar extends Component {

  constructor(props) {
    super(props);
    this.calendarRef = React.createRef();
    this.deletarSemana = this.deletarSemana.bind(this);
    this.repetirSemanaAnterior = this.repetirSemanaAnterior.bind(this);
    this.salvar = this.salvar.bind(this);
    this.state = {
      viewType: window.innerWidth <= 600 ? "Day" :"Week",
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
    tapAndHoldTimeout: 200,
    eventTapAndHoldHandling: "ContextMenu",
     contextMenu: new DayPilot.Menu({
        items: [
          {
            text: "Delete",
            onClick: args => {
              const e = args.source;
              this.calendar.events.remove(e);
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
          {
            text: "Random",
            color: getRandomColor(),
            onClick: args => this.updateColor(args.source, getRandomColor())
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
      },
      eventDeleteHandling: "Update",
      onEventClick: async args => {
        const dp = this.calendar;
        const modal = await DayPilot.Modal.prompt("Alterar texto do evento:", args.e.text());
        if (!modal.result) { return; }
        const e = args.e;
        e.data.text = modal.result;
        dp.events.update(e);
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
        
      }
    };
  }

  get calendar() {
    return this.calendarRef.current.control;
  }

  updateColor(e, color) {
    e.data.backColor = color;
    this.calendar.events.update(e);
  }

  repetirSemanaAnterior(){
    const events = this.calendar.events.list
    const previousWeek = this.calendar.startDate.weekNumber() - 1
    const previousEvents = events.filter(event => event.start.weekNumber() == previousWeek)
    previousEvents.forEach(args => {
      let newEvent = new DayPilot.Event({
        start: args.start.addDays(7),
        end: args.end.addDays(7),
        text:  args.text,
        resource: args.newResource,
        id: DayPilot.guid()  // generate random id
      });
      if (args.backColor){this.updateColor(newEvent, args.backColor)}
      this.calendar.events.add(newEvent);
    }) 
  }

  deletarSemana(){
    const events = this.calendar.events.list
    const actualWeek = this.calendar.startDate.weekNumber()
    const actualEvents = events.filter(event => event.start.weekNumber() == actualWeek)
    actualEvents.forEach(e => this.calendar.events.remove(e));
  }

  salvar(){
    //() => localStorage.setItem('eventos', JSON.stringify(this.calendar.events.list))
    const dbRef = ref(database, 'eventos');
    set (dbRef, JSON.stringify(this.calendar.events.list))
  }

  componentDidMount() {
    const dbRef = ref(database, 'eventos');
    get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const events = JSON.parse(snapshot.val());
        const startDate = currentDate;
        this.calendar.update({startDate, events});
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
    
    //JSON.parse(localStorage.getItem('eventos'));
    //require("./events.json")


    
  }

  render() {
    return (
      <div style={window.innerWidth > 600 ? styles.wrap : styles.none}>
        <div style={window.innerWidth > 600 ? styles.left : styles.mobile}>
        <ButtonGroup variant="contained" orientation={window.innerWidth > 600 ?"horizontal":"vertical"} aria-label="outlined primary button group">
        <Button variant="contained" onClick={this.salvar}><SaveIcon /></Button>
        <Button variant="contained" onClick={this.repetirSemanaAnterior}><RepeatOneIcon /></Button>
        <Button variant="contained" onClick={this.deletarSemana}><DeleteSweepIcon /></Button>
        </ButtonGroup>
          <DayPilotNavigator
            locale={"pt-br"}
            selectMode={"week"}
            showMonths={window.innerWidth <= 600 ? 1 : 3}
            skipMonths={window.innerWidth <= 600 ? 1 : 3}
            startDate={currentDate}
            selectionDay={currentDate}
            onTimeRangeSelected={ args => {
              this.calendar.update({
                startDate: args.day
              });
            }}
          />
        </div>
        <div style={window.innerWidth > 600 ? styles.main : styles.none}>
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
