import React, { useState, useRef, useEffect } from 'react';
import '../CSS/planhouse.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const numRows = 30;
const numCols = 30;

function PlanHouse() {
  const [grid, setGrid] = useState(() => {
    return Array.from({ length: numRows }, () => Array.from({ length: numCols }, () => 0));
  });
  const [CellStart, setCellStart] = useState({});
  const [name, setRoomName] = useState('');
  const [roomCnt, setCount] = useState(0);
  const [paintColor, setPaintColor] = useState('rgba(0, 0, 255, 0.5)'); 
  const [roomInfromation, setRoomInfo] = useState([]);
  const [houseSelection, setHouseList] = useState([{}]);
  const sessionData = sessionStorage.getItem("UserSession");
  const userId = JSON.parse(sessionData).user_id;
  const isMouseDown = useRef(false);
  const sCellsSelected = useRef(false);
  const [gridUpdated, setGridUpdated] = useState(false);
  const [whichhouse, setWhichhouse] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  //added
  const [doorColor, setDoorColor] = useState('saddlebrown'); 
  const [isDoorDrawingEnabled, setIsDoorDrawingEnabled] = useState(false);
  const [planHistory, setPlanHistory] = useState([{ grid, roomCnt, roomInfromation }]);
  const [historyIndex, setHistoryIndex] = useState(0);  
  const navigate = useNavigate();

  //added
  const enableDoorDrawing = () => {
    setIsDoorDrawingEnabled(true);
  };
  
  const disableDoorDrawing = () => {
    setIsDoorDrawingEnabled(false);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const { grid: previousGrid, roomCnt: previousRoomCnt, roomInfromation: previousRoomInfo } = planHistory[historyIndex - 1];
      setGrid(previousGrid);
      setCount(roomCnt - 1);
      setRoomInfo(previousRoomInfo);
      setHistoryIndex(historyIndex - 1);
    }
  };
  
  const redo = () => {
    if (historyIndex < planHistory.length - 1) {
      const { grid: nextGrid, roomCnt: nextRoomCnt, roomInfromation: nextRoomInfo } = planHistory[historyIndex + 1];
      setGrid(nextGrid);
      setCount(roomCnt + 1);
      setRoomInfo(nextRoomInfo);
      setHistoryIndex(historyIndex + 1);
    }
  };


  useEffect(() => {
    
    fetch(`/api/planner/${userId}/house-list`)
    .then(response => response.json())
    .then(house => {
      setHouseList(house);
      console.log(houseSelection); 
    })
  }, []);



  const handleMouseDown = (row, col) => {

    if(sCellsSelected.current === false)
    {
        const rowAndCell = {
            row: row,
            collumn: col,
          };
    
        setCellStart(rowAndCell);
        sCellsSelected.current = true;


    }



    
    //console.log(CellStart);
    isMouseDown.current = true;
    handleCellClick(row, col);

  };

  const handleMouseUp = () => {
    sCellsSelected.current = false;
    isMouseDown.current = false;
  };

  const handleMouseOver = (row, col) => {
    if (!isMouseDown.current) return;
   // handleCellClick(row, col);
   handleRactangleDraw(row, col);

  };
  //added change
  const handleCellClick = (row, col) => {
    const newGrid = JSON.parse(JSON.stringify(grid));
  if (isDoorDrawingEnabled) {
    newGrid[row][col] = doorColor;
  } else {
    newGrid[row][col] = newGrid[row][col] ? 0 : paintColor;
  }
  setGrid(newGrid);
  };

  const handleRactangleDraw = (row, col) => {
    const newGrid = JSON.parse(JSON.stringify(grid));
    
    setGrid(newGrid);
    
    console.log(row + " is " + CellStart.row);
    if(row >= CellStart.row)
    {
      if(col >= CellStart.collumn)
      {
        for(let i = row; i >= CellStart.row; i--)
        {
            
            for(let k = col; k >= CellStart.collumn; k--)
            {
              if (isDoorDrawingEnabled) {
                newGrid[i][k] = doorColor;
              } else {
                newGrid[i][k] = paintColor;
              }
            }
        }
        setGrid(newGrid);
      }
      else if(col <= CellStart.collumn)
      {
        for(let i = row; i >= CellStart.row; i--)
        {
            
            for(let k = CellStart.collumn; k >= col; k--)
            {
              if (isDoorDrawingEnabled) {
                newGrid[i][k] = doorColor;
              } else {
                newGrid[i][k] = paintColor;
              }
            }
        }
        setGrid(newGrid);
      }
    }
    if(row <= CellStart.row)
    {
      if(col >= CellStart.collumn)
      {
        for(let i = CellStart.row; i >= row; i--)
        {
            
          for(let k = col; k >= CellStart.collumn; k--)
          {
            if (isDoorDrawingEnabled) {
              newGrid[i][k] = doorColor;
            } else {
              newGrid[i][k] = paintColor;
            }
          }
        }
        setGrid(newGrid);
      }
      else if(col <= CellStart.collumn)
      {
        for(let i = CellStart.row; i >= row; i--)
        {
            
          for(let k = CellStart.collumn; k >= col; k--)
          {
            if (isDoorDrawingEnabled) {
              newGrid[i][k] = doorColor;
            } else {
              newGrid[i][k] = paintColor;
            }
          }
        }
        setGrid(newGrid);
      }
    }

  };
  const handleSubmit = () => {
    if (roomCnt === 0) {
      setError('Plan must contain atleast one room');
      return;
    }
    else if (!whichhouse.id) {
      setError('You need to select the address');
      return;
    }
  
    setError(null); 
    
    if(name)
    {
      const roomInfo = {
        roomId: roomCnt,
        roomColor: paintColor,
        roomName: name,
        grid: grid,
        pkIdHouse: whichhouse.id
      }

      setRoomInfo((lastdata) => [
        ...lastdata,
        roomInfo
      ]);
    }
    else{
      setRoomInfo((lastdata) => {
        const newData = [...lastdata];
        if (newData.length > 0) {
          newData[newData.length - 1].grid = grid;
          newData[newData.length - 1].pkIdHouse = whichhouse.id;
        }
        return newData;
      });
    }


        setGridUpdated(true);
  }

  const handleNextRoom = () => {

    if (!name) {
      setSuccessMessage(null); 
      setError('Room name cannot be empty');
      return;
    }
  
    setError(null); 
    setSuccessMessage('Room successfully created'); 

    console.log(grid);
    const roomInfo = {
      roomId: roomCnt,
      roomColor: paintColor,
      roomName: name
    }
    setRoomInfo((lastdata) => [
      ...lastdata,
      roomInfo
    ]);
      sCellsSelected.current = false;
      setCount((prevCount) => prevCount + 1);
      const randomColor = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`;
    setPaintColor(randomColor);
    setGridUpdated(false);
    setRoomName('');

    setPlanHistory((oldHistory) => {
      const newHistory = oldHistory.slice(0, historyIndex + 1);
      newHistory.push({
         grid: grid,
         roomCnt,
         roomInfromation: [...roomInfromation, roomInfo]
         }); 
      return newHistory;
    });
    setHistoryIndex((oldIndex) => oldIndex + 1);

  };
  useEffect(() => {
    console.log(roomCnt);
    
  }, [roomInfromation]);

  const handleRoomNameChange = (event) =>{
    setRoomName(event.target.value);
  }
  const handleHouseSelectionChange = (event) => {
   
   const parts = event.target.value.split("+")
   console.log(parts[0]);
   setWhichhouse({
    id: parts[0],
    selected: true
  })
 
};


useEffect(() => {
  if (gridUpdated) {
    fetch('/api/planner/:userId/houseplan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomInfromation }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error(error));
      navigate('/main');
  }
  setGridUpdated(false);
}, [roomInfromation, gridUpdated]);

  return (
    <div className='background-planner'>
          <Header />
          <h1 className='planner-header'>Planner</h1>
      <div className='house-planner-container'>
      <div onMouseUp={handleMouseUp}>
      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className={`grid-cell${cell ? ' cell-filled' : ''}`}
                style={cell ? { backgroundColor: cell } : {}} 
                onMouseDown={() => handleMouseDown(rowIndex, cellIndex)}
                onMouseOver={() => handleMouseOver(rowIndex, cellIndex)}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
        {houseSelection.length > 0 ? (
          <>
            <div className='planner-elements'>
            <button className='planner-next' onClick={handleNextRoom}>Next Room</button>
            <button className='planner-submit' onClick={handleSubmit}>Submit</button>
            <div>
                <label>Room:</label>
                <input type="text" id="roomName" value={name} onChange={handleRoomNameChange} />
            </div>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <p>Select House:</p>
            <div>
              {houseSelection.map((house, index) => (
                  <div key={index}>
                  <input type="radio" name="houseLocation" value={`${house.pk_id}+${house.address}`} onChange={handleHouseSelectionChange} />
                  <label>{house.address}</label>
                  </div>
              ))}
            </div>
            <button className='planner-door' onClick={() => setIsDoorDrawingEnabled(!isDoorDrawingEnabled)}>
            {isDoorDrawingEnabled ? "Stop Door Drawing" : "Start Door Drawing"}
            </button>
            <button className='planner-next' onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
            </div>
          </>
        ) : (
          <p className='p-house-planner'>All your locations has plans</p>
        )}
      </div>  
    </div>
    
  );
}

export default PlanHouse;
