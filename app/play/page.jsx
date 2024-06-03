'use client';
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";



const Page = () => {
  const [top, setTop] = useState(47);
  const [left, setLeft] = useState(47);
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [startTimer, setStartTimer] = useState(3);
  const [stop, setStop] = useState(false);
  const [start, setStart] = useState(false);
  const [multiplayer, setMultiplayer] = useState(false);
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
  const intervalId = useRef(null);
  const countdownId = useRef(null);




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
    if (count === 49) {
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
    countdownId.current = setInterval(() => {
      setStartTimer(c => c > 0 ? c - 1 : 0);
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(countdownId.current);

      intervalId.current = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }, 3000); 

    return () => {
      clearTimeout(timeout);
      clearInterval(countdownId.current);
      clearInterval(intervalId.current);
    }
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
    <div className="w-[100%] h-[100vh] bg-[#1b2734] flex flex-col items-center"> 

{/*Display board*/} 

    {
      start == true && multiplayer === false ? (
        <div className=" w-[100%] h-[20%] flex justify-start items-center flex-col pt-3 overflow-auto">
        <div className="border w-[80%] mb-10  flex items-center relative">
          <div className="bg-[red] w-[15px] h-[15px] absolute transition-all duration-1000" 
            style={{ 
              left: `${count * 2}%`, 
            }}
          ></div>
        </div>

        {
        Object.entries(display).map(([id, message]) => (
          
        
            <div key={id} className="border w-[80%] mb-6  flex items-center relative">
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
    

    </div>
      ):(
        <div className="w-[100%] h-[30%] text-[#fff] flex justify-center items-center">
            <h1 className="text-5xl">Aim Reaction</h1>
        </div>
      )
    }


    {/*before game start*/}    
        <div className=" w-[70%] h-[80%]">
            {
    
                 start == false ? 
                 (
                  
                 <div className=' w-[100%] h-[100%] flex justify-center items-center flex-col'>
                  <button
                    className='border border-[#fff] mb-7 p-2 rounded-md text-[#fff] h-[100px] w-[200px] hover:bg-[#fff] hover:text-[#000] transition-all duration-300 ease-in-out' 
                    onClick={() => {
                      setStart(true);
                      setMultiplayer(false);
                    }}>
                    Solo
                 </button>
                  <button
                    className='border border-[#fff] p-2 rounded-md text-[#fff] h-[100px] w-[200px] mb-4 hover:bg-[#fff] hover:text-[#000] transition-all duration-300 ease-in-out' 
                    onClick={() => {
                      setMultiplayer(true);
                      setStart(true);
                    
                    }}>
                    Multiplayer
                 </button>                

{/*                   
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
                      */}
               </div> 
                 )
               :
// game start
            (
              multiplayer === true ?
              (
                <div className="flex items-center justify-center w-[100%] h-[100%] flex-col">
                    <div className=" w-[100%] flex justify-center">
                      
                      <input
                        className="w-[30%] h-[40px] rounded-3xl px-4 mr-3"
                        type="text"
                        placeholder="Room ID..."
                        onChange={(event) => {
                          setRoom(event.target.value);
                        }}
                      />
                        <button
                          className="bg-[green] text-[#fff] w-[10%] h-[40px] rounded-3xl px-4 flex justify-center items-center " 
                          onClick={() => {
                            joinRoom();
                            setMultiplayer(false);
                            
                          }}
                          >
                          Join
                        </button>
                    </div>
                </div>
              ): (
                stop === false ? (
                  <div className=" w-[100%] h-[100%] flex justify-center items-center ">
                    {
                      startTimer !== 0 ? (
                        <button 
                        className="border text-[#fff] px-8 py-2 rounded-xl hover:bg-[#fff] hover:text-[#000]"
                        onClick={() => setStop(true)}
                        >Start
                      </button>
                      ):(
                        <></>
                      )
                    }
                
                  </div>
                ):(

                  startTimer !== 0 ? (
                    <div className=" w-[100%] h-[100%] flex justify-center items-center">
                      <h1 className=" text-[#fff] text-6xl">{startTimer}</h1>
                    </div>
                  ):(
                    <div className=" w-[100%] h-[100%] relative">
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
                  )
                  
                )
            
              )
              
            ) 
            }
        </div>


{/*win message*/}
        {
          winId &&  (
            <div className=" w-[100%] h-[60vh] bg-[green] absolute z-4 flex justify-center items-center flex-col top-[20%]">
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

      <div className="absolute bottom-0 left-0 mb-4 ml-4 text-sm">
          <h1 className="text-[#fff]">
            COUNT : {count}
          </h1>
          <h1 className="text-[#fff]">
            RC : {roomCount}
          </h1>
          <h2 className="text-[#fff]">
            TIMER : {timer}
          </h2>
        
      </div>
      <h3 className="text-[#fff] text-[10px] absolute right-2 bottom-3 ">socketID : {myId}</h3>
      
    </div>
  );
}

export default Page;