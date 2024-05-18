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

  const messageData = {
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
    if (count === 50) {
      setStop(false);
      setCount(0);
      setTimer(0);
      alert(`You clicked ${count} times in ${timer} seconds`);
    }
    console.log('click');
  }

  const joinRoom = () => {
    console.log("Hello");
    if (socket) { 
      socket.emit("join_room", room);
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

  // useEffect(() => {
  //   if (stop === true) {
  //     const timeout = setTimeout(() => {
  //       alert(`You have got ${countRef.current} kills`);
  //       setStop(false);
  //       setCount(0);
  //       setTimer(0);
  //     }, 10000);

  //     return () => clearTimeout(timeout); 
  //   }
  // }, [stop]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const newSocket = io(socketUrl);
  
    newSocket.on("yourID", (id) => {
      console.log(id);
      setMyId(id);
    });
  
    newSocket.on("receive_message", (data) => {
      console.log(data);
      setDisplay(data);
    });
  
    setSocket(newSocket); 
  
    return () => {
      newSocket.disconnect();
    };
  }, []);


  return (
    <div className='bg-[#1b2734] w-screen h-[100vh] flex justify-center items-center flex-col'>
      <div className="border w-[80%] mb-10  flex items-center relative">
        <div className="bg-[red] w-[40px] h-[40px] absolute transition-all duration-1000" 
          style={{ 
            left: `${count * 2}%`, 
          }}
        ></div>
      </div>
      <div className="border w-[80%] mb-10  flex items-center relative">
        <div className="bg-[green] w-[40px] h-[40px] absolute transition-all duration-1000" 
          style={{ 
            left: `${display.message * 2}%`, 
          }}
        ></div>
      </div>
        {
          start == false ?
          <div className='border w-[80%] h-[80vh] relative flex justify-center items-center flex-col'>
            
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


      <h1 className="text-[#fff]">
        COUNT : {count}
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
    </div>
  );
}

export default Page;
