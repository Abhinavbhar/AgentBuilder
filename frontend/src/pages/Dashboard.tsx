import React, { use, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Copy, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar.tsx';
// Mock Navbar component (replace with your actual Navbar

function Dashboard() {
  const [chatbots, setChatbots] = useState([]);
  const navigate = useNavigate()
  
  useEffect(()=>{
        const fetData=async()=>{
            const Data=await axios.get("http://localhost:8080/dashboard/getdata")
            setChatbots(Data.data)
        }
        fetData()
        
    },[])
    const handleCreateChatbot=()=>{
       navigate("/user/createbot")
        console.log("loda")
        
    }

  return (
    <>
       <div className="min-h-screen bg-gray-50">
            <Navbar></Navbar>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Chatbots</h2>
            <p className="text-gray-600 mt-2">Manage and create your chatbots</p>
          </div>
          <button
            onClick={handleCreateChatbot}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={20} />
            Create Chatbot
          </button>
        </div>

        {/* Empty State */}
        {chatbots.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No chatbots yet</h3>
            <p className="text-gray-500 mb-6">Create your first chatbot to get started</p>
            <button
              onClick={handleCreateChatbot}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition duration-200"
            >
              Create Your First Chatbot
            </button>
          </div>
        ) : (
          /* Chatbots Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbots.map(bot => (
              <div
                key={bot.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden border border-gray-200 hover:border-blue-300"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <h3 className="text-lg font-bold truncate">{bot.name}</h3>
                  <span
                    className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${
                      bot.status === 'active'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {bot.status}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {bot.description}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p>
                      <span className="font-semibold">Created:</span> {bot.createdDate}
                    </p>
                    <p>
                      <span className="font-semibold">Modified:</span> {bot.lastModified}
                    </p>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="bg-gray-50 px-4 py-3 flex gap-2 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(bot.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-md font-medium transition duration-200"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(bot.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md font-medium transition duration-200"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(bot.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-md font-medium transition duration-200"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
 
  );
}

export default Dashboard;