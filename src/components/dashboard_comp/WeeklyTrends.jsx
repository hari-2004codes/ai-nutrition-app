import React from 'react';
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

export default function WeeklyTrends({ labels, calories, targets }) {
  const defaultLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chartLabels = labels && labels.length === 7 ? labels : defaultLabels;
  const chartCalories = calories && calories.length === 7 ? calories : [2100, 1950, 2200, 1800, 2050, 2300, 1900];
  const chartTargets = targets && targets.length === 7 ? targets : [2200, 2200, 2200, 2200, 2200, 2200, 2200];
  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Calories Consumed',
        data: chartCalories,
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
        data: chartTargets,
        borderColor: '#00a67e',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  // Compute summary stats
  let daysOnTarget = 0;
  let avgCalories = 0;
  let goalAchievement = 0;
  if (chartCalories.length === 7 && chartTargets.length === 7) {
    daysOnTarget = chartCalories.filter((c, i) => c <= chartTargets[i]).length;
    avgCalories = Math.round(chartCalories.reduce((a, b) => a + b, 0) / 7);
    const avgTarget = chartTargets.reduce((a, b) => a + b, 0) / 7;
    goalAchievement = avgTarget ? Math.round((avgCalories / avgTarget) * 100) : 0;
  }

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
          <div className="text-2xl font-bold text-green-600">{daysOnTarget}</div>
          <div className="text-sm text-white">Days on target</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{avgCalories || '-'}</div>
          <div className="text-sm text-white">Avg calories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{goalAchievement || '-'}%</div>
          <div className="text-sm text-white">Goal achievement</div>
        </div>
      </div>
    </div>
  );
}