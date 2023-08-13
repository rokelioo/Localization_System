import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/statistics.css'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale ,
  LinearScale, 
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'

import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale ,
  LinearScale, 
  PointElement,
  Tooltip,
  Legend
);

function Statistics() {
  const [elderData, setElderData] = useState([]);
  const [elderEmergencyDetails, setElderEmergencyDetails] = useState([]);
  const [elderSpentTimeDetails, setElderSpentTimeDetails] = useState([]);
  const [elderRoomChangeDetails, setElderRoomChangeDetails] = useState([]);
  const sessionData = sessionStorage.getItem('UserSession');
  const [selectedElder, setSelectedElder] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originalElderEmergencyDetails, setOriginalElderEmergencyDetails] = useState([]);
  const [originalElderRoomChangeDetails, setOriginalElderRoomChangeDetails] = useState([]);
  const [originalElderSpentTimeDetails, setOriginalElderSpentTimeDetails] = useState([]);
  const navigate = useNavigate();

  const colors = [
    '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399'
  ];

  useEffect(() => {
    const userId = JSON.parse(sessionData);

    const fetchElderList = async () => {
      try {
        const response = await fetch(`/api/elder/${userId['user_id']}/list`);
        const elders = await response.json();
        setElderData(elders);
        console.log(elders);
        return elders;
      } catch (error) {
        console.error(error);
      }
    };

    fetchElderList();
  }, []);

  const handleElderChange = (event) => {
    setSelectedElder(event.target.value);
  };

  useEffect(() => {
    if (selectedElder) {
      fetchElderEmergencyData(selectedElder);
      fetchElderTimeSpentData(selectedElder);
      fetchElderRoomChanged(selectedElder);
    }
  }, [selectedElder]);

  const fetchElderEmergencyData = async (elderId) => {
    try {
      console.log(elderId);
      const response = await fetch(`/api/statistic/${elderId}/Emergency`);
      const elderDetails = await response.json();
      setOriginalElderEmergencyDetails(elderDetails);
      setElderEmergencyDetails(elderDetails);
      console.log(elderDetails);
      
    } catch (error) {
      console.error(error);
    }
  };
  const fetchElderTimeSpentData = async (elderId) => {
    try {
      const response = await fetch(`/api/statistic/${elderId}/TimeSpent`);
      const elderDetails = await response.json();
      setElderSpentTimeDetails(elderDetails);
      setOriginalElderSpentTimeDetails(elderDetails); 
    } catch (error) {
      console.error(error);
    }
  };
  const fetchElderRoomChanged = async (elderId) => {
    try {
      console.log(elderId);
      const response = await fetch(`/api/statistic/${elderId}/RoomChange`);
      const elderDetails = await response.json();
      setElderRoomChangeDetails(elderDetails);
      setOriginalElderRoomChangeDetails(elderDetails)
      console.log(elderDetails);
      
    } catch (error) {
      console.error(error);
    }
  };


  const generateChartData = () => {
    if (!Array.isArray(elderEmergencyDetails)) {

      return;
    }
    const labels = elderEmergencyDetails.map(
      (emergency) => emergency.emergencyDate
    );
    console.log(labels);
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Emergency Count',
          data: elderEmergencyDetails.map(
            (emergency) => emergency.emergencyCount
          ),
          backgroundColor: 'rgb(68,114,196)',
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.4
        },
      ],
    };
    return data;
  };

  const generateRoomChangeChartData = () => {
    const labels = elderRoomChangeDetails.map((roomChange) => roomChange.date);
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Room Changes',
          data: elderRoomChangeDetails.map((roomChange) => roomChange.roomChanges),
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgba(255,99,132,1)',
          tension: 0.4,
        },
      ],
    };
    return data;
  };

  const msToTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    console.log(`${hours}h ${minutes}m ${seconds}s`);
  
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const generatePieChartData = () => {
    
    const uniqueRooms = {};


  elderSpentTimeDetails.forEach((room) => {
    const roomName = room.room_name;
    const timeSpent = room.timeSpent;


    if (uniqueRooms.hasOwnProperty(roomName)) {
      uniqueRooms[roomName] += timeSpent;
    } else {

      uniqueRooms[roomName] = timeSpent;
    }
  });

  
  const mergedRooms = Object.keys(uniqueRooms).map((roomName) => ({
    room_name: roomName,
    timeSpent: uniqueRooms[roomName],
  }));
  const timeInHours = mergedRooms.map((room) => room.timeSpent / (1000 * 60 * 60));
  
  const labels = mergedRooms.map((room) => room.room_name);
  const dataValues = mergedRooms.map((room) => room.timeSpent);
  const backgroundColors = colors.slice(0, mergedRooms.length);
  console.log(labels);

  console.log(dataValues);
    const data = {
      labels: labels,
      datasets: [
        {
          
          data: timeInHours,
          backgroundColor: backgroundColors,
        },
      ],
    };
    return data;
  };

  const generatePieChartOptions = () => {
    const options = {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const hours = Math.floor(value);
            const minutes = Math.floor((value - hours) * 60);
            const seconds = Math.floor(((value - hours) * 60 - minutes) * 60);
            return `${label}: ${hours}h ${minutes}m ${seconds}s`;
            },
          },
        },
      },
    };
    return options;
  };

  const generateChartOptions = () => {
    const options = {
     y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
     }
    };
    return options;
  };

  

  const handleDateRangeFilter = () => {
    if (startDate && endDate) {
      if(originalElderEmergencyDetails.length > 0){
        const filteredEmergencyData = originalElderEmergencyDetails.filter(
          (emergency) =>
            new Date(emergency.emergencyDate) >= new Date(startDate) &&
            new Date(emergency.emergencyDate) <= new Date(endDate)
        );
        setElderEmergencyDetails(filteredEmergencyData);
      }

      if(originalElderRoomChangeDetails.length > 0)
      {
        const filteredRoomChangeData = originalElderRoomChangeDetails.filter(
          (roomChange) =>
            new Date(roomChange.date) >= new Date(startDate) &&
            new Date(roomChange.date) <= new Date(endDate)
        );
        setElderRoomChangeDetails(filteredRoomChangeData);
      }
      if(originalElderSpentTimeDetails.length > 0)
      {
        const filteredSpentTimeDetails = originalElderSpentTimeDetails.filter(
          (spentTime) =>
            new Date(spentTime.date) >= new Date(startDate) &&
            new Date(spentTime.date) <= new Date(endDate)
        );
        setElderSpentTimeDetails(filteredSpentTimeDetails);
      }
    }
  
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/main');
  }
  return (
    <div className='statistics-main-background'>
      <div className='statistics-container'>
        <h1>Statistics</h1>
        {elderData && elderData.length > 0 && (
        <select value={selectedElder} onChange={handleElderChange}>
        <option value="">Select an elder</option>
        {elderData.map((elder, index) => (
          <option key={index} value={elder.id}>
            {elder.name} {elder.sirname}
          </option>
        ))}
      </select>
      )}
        <div className="date-range-selector">
                <label htmlFor="start-date">Start Date:</label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <label htmlFor="end-date">End Date:</label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />

                <button onClick={handleDateRangeFilter}>Filter</button>
            </div>
            {selectedElder && (
        <>
        <div className='statistics-upper'>
          {elderEmergencyDetails && elderEmergencyDetails.length > 0 && (
            <div className='statistics-upper-right'>
                <Bar data={generateChartData()}  options={generateChartOptions()}/>
            </div>
          )}
          {elderSpentTimeDetails && elderSpentTimeDetails.length > 0 && (
            <div className='statistics-upper-left'>
              <Pie data={generatePieChartData()}  options={generatePieChartOptions()}/>
            </div>
          )}
        </div>
        <div className='statistics-lower'>
        {elderRoomChangeDetails && elderRoomChangeDetails.length > 0 &&(
          <div className='statistics-lower-left'>
            <Bar data={generateRoomChangeChartData()} options={generateChartOptions()} />
            </div>
         )}
          <form onSubmit={handleSubmit}>
         <div className="button-container">
          <input type="submit" value="Exit" />
        </div>
         </form>
        </div>
        
        </>
      )}
      </div>
    </div>
  );
}

export default Statistics;