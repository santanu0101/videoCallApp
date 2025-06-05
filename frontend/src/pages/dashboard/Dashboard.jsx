import React, { use, useEffect, useRef, useState } from "react";
// import socketInstance from '../components/socketio/VideoCallSocket';
import {
  FaBars,
  FaTimes,
  FaPhoneAlt,
  FaMicrophone,
  FaVideo,
  FaVideoSlash,
  FaMicrophoneSlash,
  FaDoorClosed,
} from "react-icons/fa";
import Lottie from "lottie-react";
import { Howl } from "howler";
// import wavingAnimation from "../../assets/waving.json";
import { FaPhoneSlash } from "react-icons/fa6";
import apiClient from "../../apiClient";
import { useUser } from "../../context/userContextApi";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import SocketContext from "../socket/SocketContext";
// import Peer from "simple-peer";

function Dashboard() {
  const { user, updateUser } = useUser();
  // console.log(user)
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [me, setMe] = useState("");
  const [onlineUsers, setOnlineUser] = useState([]);
  const [stream, setStream] = useState();
  const [showReciverDetailPopUp, setShowReciverDetailPopUp] = useState(false);
  const [showReciverDetails, setShowReciverDetails] = useState(null);

  const hasJoined = useRef(false);
  const myVideo = useRef();

  const socket = SocketContext.getSocket();
  console.log(socket);

  useEffect(() => {
    if (user && socket && !hasJoined.current) {
      socket.emit("join", { id: user.user._id, name: user.user.username });
      hasJoined.current = true;
    }

    socket.on("me", (id) => setMe(id));

    socket.on("online-users", (onlineUser) => {
      setOnlineUser(onlineUser);
    });

    return () => {
      socket.off("me");
      socket.off("online-users");
    };
  }, [user, socket]);

  const allusers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/user");
      if (response.data.success !== false) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allusers();
  }, []);

  const isOnlineUser = (userId) => onlineUsers.some((u) => u.userId === userId);

  const startCall = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
        myVideo.current.muted = true;
        myVideo.current.volume = 0;
      }
      setIsSidebarOpen(false)
    } catch (error) {
      console.log("Error accessing media device ", error);
    }
  };

  const handleLogout = async () => {
    // if (callAccepted || reciveCall) {
    //   alert("You must end the call before logging out.");
    //   return;
    // }
    try {
      await apiClient.post("/auth/logout");
      socket.off("disconnect");
      socket.disconnect();
      // socketInstance.setSocket();
      updateUser(null);
      localStorage.removeItem("userData");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handelSelectedUser = (user) => {
    // console.log("hello", user);
    const selected = filteredUsers.find((user) => user._id === user._id);
    setSelectedUser(user);
    setShowReciverDetailPopUp(true);
    setShowReciverDetails(user);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-br from-blue-900 to-purple-800 text-white w-64 h-full p-4 space-y-4 fixed z-20 transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <button
            type="button"
            className="md:hidden text-white"
            onClick={() => setIsSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 mb-2"
        />

        {/* User List */}
        <ul className="space-y-4 overflow-y-auto">
          {filteredUsers.map((user) => (
            <li
              key={user._id}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                selectedUser === user._id
                  ? "bg-green-600"
                  : "bg-gradient-to-r from-purple-600 to-blue-400"
              }`}
              onClick={() => handelSelectedUser(user)}>
              <div className="relative">
                <img
                  src={user.profilePic || "/default-avatar.png"}
                  alt={`${user.username}'s profile`}
                  className="w-10 h-10 rounded-full border border-white"
                />
                {isOnlineUser(user._id) && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full shadow-lg animate-bounce"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{user.username}</span>
                <span className="text-xs text-gray-400 truncate w-32">
                  {user.email}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Logout */}
        {user && (
          <div
            onClick={handleLogout}
            className="absolute bottom-2 left-4 right-4 flex items-center gap-2 bg-red-400 px-4 py-1 cursor-pointer rounded-lg">
            <FaDoorClosed />
            Logout
          </div>
        )}
      </aside>

      <div className="flex-1 p-6 md:ml-72 text-white">
        {/* Mobile Sidebar Toggle */}
        <button
          type="button"
          className="md:hidden text-2xl text-black mb-4"
          onClick={() => setIsSidebarOpen(true)}>
          <FaBars />
        </button>

        {selectedUser ? (
          <div>
            <div className="absolute bottom-[75px] md:bottom-0 right-1 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <video
                ref={myVideo}
                autoPlay
                playsInline
                className="w-32 h-40 md:w-56 md:h-52 object-cover rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 md:ml-72 text-white">
            {/* Mobile Sidebar Toggle */}
            <button
              type="button"
              className="md:hidden text-2xl text-black mb-4"
              onClick={() => setIsSidebarOpen(true)}>
              <FaBars />
            </button>

            {/* Welcome Section */}
            <div className="flex items-center gap-5 mb-6 bg-gray-800 p-5 rounded-xl shadow-md">
              <div className="w-20 h-20 text-6xl">
                👋
                {/* <Lottie animationData={wavingAnimation} loop autoplay /> */}
              </div>
              <div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  Hey {user?.username || "Guest"}! 👋
                </h1>
                <p className="text-lg text-gray-300 mt-2">
                  Ready to <strong>connect with friends instantly? </strong>
                  Just <strong>select a user</strong> and start your video call!
                  🎥✨
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-sm">
              <h2 className="text-lg font-semibold mb-2">
                💡 How to Start a Video Call?
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-400">
                <li>📌 Open the sidebar to see online users.</li>
                <li>🔍 Use the search bar to find a specific person.</li>
                <li>🎥 Click on a user to start a video call instantly!</li>
              </ul>
            </div>
          </div>
        )}

        {showReciverDetailPopUp && showReciverDetails && (
          <div className="fixed inset-0 bg-transparent bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex flex-col items-center">
                <p className="font-black text-xl mb-2">User Details</p>
                <img
                  src={showReciverDetails.profilePic || "/default-avatar.png"}
                  alt="User"
                  className="w-20 h-20 rounded-full border-4 border-blue-500"
                />
                <h3 className="text-lg font-bold mt-3">
                  {showReciverDetails.username}
                </h3>
                <p className="text-sm text-gray-500">
                  {showReciverDetails.email}
                </p>

                <div className="flex gap-4 mt-5">
                  <button
                    onClick={() => {
                      setSelectedUser(showReciverDetails._id);
                      startCall(); // function that handles media and calling
                      setShowReciverDetailPopUp(false);
                    }}
                    className="bg-green-600 text-white px-4 py-1 rounded-lg w-28 flex items-center gap-2 justify-center">
                    Call <FaPhoneAlt />
                  </button>
                  <button
                    onClick={() => setShowReciverDetailPopUp(false)}
                    className="bg-gray-400 text-white px-4 py-1 rounded-lg w-28">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
