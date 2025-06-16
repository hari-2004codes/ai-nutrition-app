import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function WeeklyTrends() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Calories Consumed',
        data: [2100, 1950, 2200, 1800, 2050, 2300, 1900],
        borderColor: '#00a67e',
        backgroundColor: 'rgba(0, 166, 126, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00a67e',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 4,
        pointRadius: 6,
      },
      {
        label: 'Target',
        data: [2200, 2200, 2200, 2200, 2200, 2200, 2200],
        borderColor: '#00a67e',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600',
          },
        },
      },
      tooltip: {
        backgroundColor: 'dark-200/50',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: '600',
          },
          color: '#f2f8f7',
        },
      },
      y: {
        beginAtZero: false,
        min: 1500,
        max: 2500,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          drawBorder: false,
        },
        border: {
          display: true,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#9ca3af',
          callback: function(value) {
            return value + ' cal';
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="bg-dark-200/50 backdrop-blur-lg rounded-2xl p-6 border-2 border-card-border shadow-lg shadow-gray-500/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Weekly Trends
        </h3>
        <div className="flex items-center gap-2 text-sm text-white">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span>On track this week</span>
        </div>
      </div>
      
      <div className="h-64">
        <Line data={data} options={options} />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">5</div>
          <div className="text-sm text-white">Days on target</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">2,057</div>
          <div className="text-sm text-white">Avg calories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">93%</div>
          <div className="text-sm text-white">Goal achievement</div>
        </div>
      </div>
    </div>
  );
}