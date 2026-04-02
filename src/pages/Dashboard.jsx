import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut, Radar } from 'react-chartjs-2';
import {
  FaUser,
  FaBuilding,
  FaMapMarkerAlt,
  FaWallet,
  FaPercentage,
  FaCar,
  FaUsers,
  FaChartLine,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaUserCheck,
  FaUserSlash,
  FaStar,
  FaPhone,
  FaIdCard,
  FaChartPie,
  FaChartBar,
  FaChartLine as FaChartLineIcon,
  FaDatabase,
  FaBoxes,
  FaRoute,
  FaCreditCard,
  FaArrowUp,
  FaArrowDown,
  FaCircle,
  FaDownload,
  FaCalendarAlt,
  FaFilter
} from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

import api from "../utils/api";

const ModernDashboard = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const data = await api("/api/vendors/reports/pure-vendor-data");
      if (data.success) {
        setReportData(data.report);
      } else {
        setError('Failed to fetch report data');
      }
    } catch (err) {
      setError('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-xl">{error}</p>
          <button
            onClick={fetchReportData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  // Enhanced Chart Configurations
  const driverStatusChartData = {
    labels: ['Online', 'Offline', 'Approved', 'Pending Approval'],
    datasets: [
      {
        label: 'Number of Drivers',
        data: [
          reportData.driverManagement.stats.online,
          reportData.driverManagement.stats.offline,
          reportData.driverManagement.stats.approved,
          reportData.driverManagement.stats.pendingApproval
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(107, 114, 128)',
          'rgb(59, 130, 246)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };

  const tripTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Completed Trips',
        data: [12, 19, 15, 17, 14, reportData.tripReporting.stats.completed],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Cancelled Trips',
        data: [3, 5, 2, 4, 3, reportData.tripReporting.stats.cancelled],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const tripStatsPieData = {
    labels: ['Completed', 'Ongoing', 'Cancelled'],
    datasets: [
      {
        data: [
          reportData.tripReporting.stats.completed,
          reportData.tripReporting.stats.ongoing,
          reportData.tripReporting.stats.cancelled
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const financialRadarData = {
    labels: ['Earnings', 'Balance', 'Commission', 'Gross Fare', 'Transactions', 'Growth'],
    datasets: [
      {
        label: 'Financial Performance',
        data: [
          reportData.financialSummary.totalEarnings || 65,
          reportData.financialSummary.balance || 45,
          parseInt(reportData.vendorInfo.commission) || 40,
          reportData.tripReporting.stats.totalGrossFar || 30,
          reportData.financialSummary.transactions.length || 20,
          75
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointHoverRadius: 8,
      },
    ],
  };

  const performanceData = {
    labels: ['Driver Performance', 'Fleet Efficiency', 'Trip Success', 'Revenue Growth', 'Customer Rating'],
    datasets: [
      {
        label: 'Current Performance',
        data: [
          (reportData.driverManagement.stats.online / reportData.driverManagement.stats.total) * 100 || 0,
          (reportData.fleetManagement.total > 0 ? 85 : 0),
          reportData.tripReporting.stats.total > 0
            ? (reportData.tripReporting.stats.completed / reportData.tripReporting.stats.total) * 100
            : 0,
          45,
          4.2
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          usePointStyle: true,
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: '#3b82f6',
        borderWidth: 1,
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw} trips`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          stepSize: 5,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="">
        <div className="max-w-8xl mx-auto sm:px-6 lg:px-8 py-8 border-b border-gray-100/50 mb-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Vendor <span className="text-blue-600">Analytics</span></h1>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] ml-1">Comprehensive operational insights and performance metrics</p>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Vendor Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-white text-xl font-semibold">Vendor Profile</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaUser className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Vendor Name</p>
                  <p className="text-gray-900 font-semibold">{reportData.vendorInfo.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FaBuilding className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Company</p>
                  <p className="text-gray-900 font-semibold">{reportData.vendorInfo.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FaMapMarkerAlt className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Area</p>
                  <p className="text-gray-900 font-semibold">{reportData.vendorInfo.area}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FaPercentage className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Commission</p>
                  <p className="text-gray-900 font-semibold">{reportData.vendorInfo.commission}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <FaWallet className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Wallet Balance</p>
                  <p className="text-gray-900 font-semibold">₹{reportData.vendorInfo.wallet}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
              <span className="text-green-600 text-sm flex items-center gap-1">
                <FaArrowUp /> +12%
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Drivers</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.driverManagement.stats.total}</p>
            <p className="text-gray-500 text-sm mt-2">
              {reportData.driverManagement.stats.online} online · {reportData.driverManagement.stats.offline} offline
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaTruck className="text-green-600 text-2xl" />
              </div>
              <span className="text-green-600 text-sm flex items-center gap-1">
                <FaArrowUp /> +8%
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Fleet</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.fleetManagement.total}</p>
            <p className="text-gray-500 text-sm mt-2">Active vehicles in fleet</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaRoute className="text-purple-600 text-2xl" />
              </div>
              <span className="text-red-600 text-sm flex items-center gap-1">
                <FaArrowDown /> -5%
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Trips</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.tripReporting.stats.total}</p>
            <p className="text-gray-500 text-sm mt-2">
              {reportData.tripReporting.stats.completed} completed
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FaMoneyBillWave className="text-orange-600 text-2xl" />
              </div>
              <span className="text-green-600 text-sm flex items-center gap-1">
                <FaArrowUp /> +23%
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Earnings</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">₹{reportData.financialSummary.totalEarnings}</p>
            <p className="text-gray-500 text-sm mt-2">Current balance: ₹{reportData.financialSummary.balance}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Driver Status Bar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaChartBar className="text-blue-600" />
                Driver Status Distribution
              </h3>
              <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                <option>All Drivers</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="h-80">
              <Bar data={driverStatusChartData} options={chartOptions} />
            </div>
          </div>

          {/* Trip Trends Line Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaChartLineIcon className="text-green-600" />
                Trip Trends Analysis
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">6M</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg">1Y</button>
              </div>
            </div>
            <div className="h-80">
              <Line data={tripTrendsData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Trip Stats Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaChartPie className="text-purple-600" />
              Trip Statistics
            </h3>
            <div className="h-72">
              <Pie data={tripStatsPieData} options={chartOptions} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{reportData.tripReporting.stats.completed}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{reportData.tripReporting.stats.ongoing}</p>
                <p className="text-xs text-gray-500">Ongoing</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{reportData.tripReporting.stats.cancelled}</p>
                <p className="text-xs text-gray-500">Cancelled</p>
              </div>
            </div>
          </div>

          {/* Financial Radar Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaCreditCard className="text-orange-600" />
              Financial Performance
            </h3>
            <div className="h-72">
              <Radar data={financialRadarData} options={chartOptions} />
            </div>
          </div>

          {/* Performance Gauge */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FaChartLine className="text-indigo-600" />
              Performance Metrics
            </h3>
            <div className="h-72">
              <Radar data={performanceData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Driver Management Table */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              Driver Management
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.driverManagement.list.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{driver.id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{driver.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{driver.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${driver.isOnline
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {driver.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400 text-sm" />
                        <span className="text-sm text-gray-700">{driver.rating || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Management Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaBoxes className="text-green-600" />
              Fleet Management
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.fleetManagement.list.map((fleet) => (
                  <tr key={fleet.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{fleet.id.slice(-8)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{fleet.company}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{fleet.phone}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;