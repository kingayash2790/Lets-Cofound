// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Notifications = ({ currentUsername }) => {
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         console.log('Token:', token);
//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         };
//         const userId = localStorage.getItem('userId');
//         const response = await axios.get(`http://localhost:9002/api/notifications/notifications/${userId}`, config);
//         console.log('Response data:', response.data);

//         // Ensure response data is an array
//         const notificationsData = Array.isArray(response.data) ? response.data : [response.data];
//         setNotifications(notificationsData);

//         // Update the interest status in local storage for each notification
//         notificationsData.forEach(notification => {
//           if (notification.type === 'interestConfirmation' && notification.status === 'RequestSent') {
//             console.log(userId + 'request');
//           } 
//           if (notification.type === 'interestApproval' && notification.status === 'Approved') {
//             localStorage.setItem(`interested-${userId}-${notification.projectId}`, 'Approved');
//             console.log(userId + 'approval');
//           } 
//         });
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       }
//     };

//     fetchNotifications();
//   }, [currentUsername]);

//   const handleApprove = async (notificationId) => {
//     try {
//       const token = localStorage.getItem('token');
//       const config = {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       };
//       await axios.post(`http://localhost:9002/api/notifications/projects/${notificationId}/approveInterest`, {}, config);
//       // Optionally, refetch notifications or update state to remove the handled notification
//       setNotifications((prevNotifications) =>
//         prevNotifications.filter((notification) => notification._id !== notificationId)
//       );
//     } catch (error) {
//       console.error('Error approving interest:', error);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center mt-10">
//       <div className="w-1/2">
//         <h2 className="text-lg font-bold mb-4">Notifications</h2>
//         <ul className="space-y-2">
//           {notifications.map((notification) => (
//             <li
//               key={notification._id}
//               className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
//             >
//               <p>{notification.message}</p>
//               <span className="text-sm text-gray-500">
//                 {new Date(notification.timestamp).toLocaleString()}
//               </span>
//               {notification.type === 'interestRequest' && notification.status !== 'approved' && (
//                 <button
//                   onClick={() => handleApprove(notification._id)}
//                   className="bg-blue-500 text-white px-2 py-1 rounded-lg ml-2"
//                 >
//                   Approve
//                 </button>
//               )}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Notifications;



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from "react-router-dom";

const Notifications = ({ currentUsername }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io('http://localhost:9003');

    socket.on('receiveNotification', (notification) => {
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
    });

    return () => socket.close();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const userId = localStorage.getItem('userId');
        const response = await axios.get(`http://localhost:9002/api/notifications/notifications/${userId}`, config);

        const notificationsData = Array.isArray(response.data) ? response.data : [response.data];
        console.log(notificationsData)
        setNotifications(notificationsData);

        notificationsData.forEach(notification => {
          if (notification.type === 'interestConfirmation' && notification.status === 'RequestSent') {
            console.log(userId + 'request');
          } 
          if (notification.type === 'interestApproval' && notification.status === 'Approved') {
            localStorage.setItem(`interested-${userId}-${notification.projectId}`, 'Approved');
            console.log(userId + 'approval');
          } 
          if (notification.type === 'InvitationConfirmation' && notification.status === 'Approved') {
            localStorage.setItem(`invitation-${userId}-${notification.projectId}`, 'Approved');
            console.log(userId + 'approval');
          }
        });
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [currentUsername]);

  const handleApprove = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post(`http://localhost:9002/api/notifications/projects/${notificationId}/approveInterest`, {}, config);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error approving interest:', error);
    }
  };

  const handleApproveInvitation = async (notificationId, projectId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response=await axios.post(`http://localhost:9002/api/notifications/projects/${notificationId}/approveInvitation`, {}, config);
      if(response.status==200){
        alert("Invitation Approved Successfully");
        navigate(`/detailedproject/${projectId}`);
      }

      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error approving invitation:', error);
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-1/2">
        <h2 className="text-lg font-bold mb-4">Notifications</h2>
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <p>{notification.message}</p>
              <span className="text-sm text-gray-500">
                {new Date(notification.timestamp).toLocaleString()}
              </span>
              {notification.type === 'interestRequest' && notification.status !== 'approved' && (
                <button
                  onClick={() => handleApprove(notification._id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded-lg ml-2"
                >
                  Approve
                </button>
              )}
              {notification.type === 'InvitationConfirmation' && notification.status !== 'Approved' && (
                <button
                  onClick={() => handleApproveInvitation(notification._id, notification.projectId)}
                  className="bg-blue-500 text-white px-2 py-1 rounded-lg ml-2"
                >
                  Approve
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Notifications;
