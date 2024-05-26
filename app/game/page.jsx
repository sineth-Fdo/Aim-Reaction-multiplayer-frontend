'use client';
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";


const Page = () => {
  const [top, setTop] = useState(47);
  const [left, setLeft] = useState(47);
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [stop, setStop] = useState(false);
  const [start, setStart] = useState(false);
  const [targetWidth, setTargetWidth] = useState(40);
  const countRef = useRef(count);
  const [socket, setSocket] = useState(null);
  const [myId, setMyId] = useState("");
  const [room, setRoom] = useState("");
  const [display, setDisplay] = useState({});
  const [roomCount, setRoomCount] = useState(0);
  const [winCount, setWinCount] = useState(0);
  const [winId, setWinId] = useState("");
  const [winName,setWinName] = useState("");
  const [userName, setUserName] = useState("Sineth");

  const messageData = {
    id: myId,
    room: room,
    message: count + 1,
  };



  const moveClick = () => {
    if (stop === false) {
      setStop(true);
    }
    setTop(Math.floor(Math.random() * 50)); 
    setLeft(Math.floor(Math.random() * 50)); 
    setCount(prevCount => {
      const newCount = prevCount + 1;
      countRef.current = newCount;
      return newCount;
    });
    socket.emit("send_message", messageData, room);
    if (count === 10) {
      setStop(false);
      setCount(
        preCount => {
          const newCount = preCount;
          return newCount;
        }
      );
      setTimer(
        preTimer => {
          const newTimer = preTimer;
          return newTimer;
        }
      );
      alert(`You clicked ${count+1} times in ${timer} seconds`);
      setWinCount(winCount + 1);

      //send message to who's won
      socket.emit("win_message", {
        id: myId,
        message: `You clicked ${count+1} times in ${timer} seconds`,
        userName: userName,
      }, room);
      setStop(false);
      setWinId(myId);

  
      
    }
    console.log('click');
  }

  const joinRoom = () => {
    if (socket) { 
      socket.emit("join_room", room);
      socket.emit("get-room-count", room);
    }
  };

  useEffect(() => {
    if (stop === true) {
      const interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
  
      return () => clearInterval(interval); 
    }
  }, [stop]);


useEffect(() => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  const newSocket = io(socketUrl);

  newSocket.on("receive_win", (data) => {
    if (data.id !== myId) { 
      setWinId(data.id);
      setWinName(data.userName)
    }
  });


  newSocket.on("yourID", (id) => {
    console.log(id);
    setMyId(id);
  });

  newSocket.on("receive_message", (data) => {
    setDisplay(prevDisplay => ({
      ...prevDisplay,
      [data.id]: data.message,
    }));
  });

  newSocket.on("room-count", (count) => {
    console.log(`Room ${room} has ${count} users`);
    setRoomCount(count);
  });


  setSocket(newSocket); 

  return () => {
    newSocket.disconnect();
  };
}, []);


  return (
    <div className='bg-[#1b2734] w-screen h-[100vh] flex justify-center items-center flex-col'>

        {
          start == false ?
          <div className='border w-[80%] h-screen relative flex justify-center items-center flex-col'>
            
            <button
              className='border border-[#fff] p-2 rounded-md text-[#fff] h-[100px] w-[200px] mb-4 hover:bg-[#fff] hover:text-[#000] transition-all duration-300 ease-in-out' 
            onClick={() => setStart(true)}>
              Start
            </button>
            <h3 className="text-[#fff]">{myId}</h3>
            <br />
              <input
                className="border border-[#000]"
                type="text"
                placeholder="Room ID..."
                onChange={(event) => {
                  setRoom(event.target.value);
                }}
              />
                <button className="border border-[#000] bg-[green] text-[#fff]" onClick={joinRoom}>
                  Join a Room
                </button>
                <button className="border border-[#000] bg-[green] text-[#fff]" onClick={moveClick}>
                 count
                </button>
          </div> :
                <div className='border w-[80%] h-[80vh] relative'>
                <div 
                  className=' bg-[#2cae43] rounded-full ' 
                  style={{ 
                    width: `${targetWidth}px`,
                    height:  `${targetWidth}px`,
                    position: 'absolute',
                    top: `${top + 10}%`, 
                    left: `${left + 10}%`
                  }}
                  onClick={moveClick}
                />
              </div>
        }
        <br /><br />

      <div className="border w-[80%] mb-10  flex items-center relative">
        <div className="bg-[red] w-[15px] h-[15px] absolute transition-all duration-1000" 
          style={{ 
            left: `${count * 2}%`, 
          }}
        ></div>
      </div>
      {
        Object.entries(display).map(([id, message]) => (
          
        
            <div key={id} className="border w-[80%] mb-10  flex items-center relative">
            <div className=" w-[20px] h-[20px] absolute transition-all duration-1000" 
              style={{ 
                left: `${message * 2}%`, 
                backgroundColor: id === myId ? 'red' : 'blue'
                                  && message < 10 ? 'yellow' : 'blue'
                                  && message < 20 ? 'purple' : 'yellow'
                                  && message < 30 ? 'orange' : 'purple'
                                  && message < 40 ? 'pink' : 'orange'
                                  && message < 50 ? 'green' : 'green'
              }}
            >{message}</div>
          </div>
          
        ))  
      }
    



      <h1 className="text-[#fff]">
        COUNT : {count}
      </h1>
      <h1 className="text-[#fff]">
        ROOM COUNT : {roomCount}
      </h1>
      <h2 className="text-[#fff]">
        TIMER : {timer}
      </h2>

      <input type = "range"
        min = "40"
        max = "100"
        step = "10"
        value = {targetWidth}
        onChange = {(e) => {
          setTargetWidth(e.target.value);
        }}
        
      />



      {
          winId &&  (
            <div className="border w-[100%] h-[60vh] bg-[green] absolute z-4 flex justify-center items-center flex-col">
            <h1 className="text-[#fff] text-5xl">
              {
                winId == myId ? "You Won" : "You Lost"
              }
            </h1>
            <br /><br />
            <h1 className="text-[#ffffff5f]">
              {winId} {winName} has won the game
            </h1>
            <br />
            <button 
              className="border border-[#fff] p-2 rounded-md text-[#fff] h-[30px] w-[100px] flex justify-center items-center mb-4 hover:bg-[#fff] hover:text-[#000] transition-all duration-300 ease-in-out"
              onClick={() => setWinId("")}
              >
              Back
            </button>
    
       
         </div>
          ) 
      }

    </div>
  );
}

export default Page;
