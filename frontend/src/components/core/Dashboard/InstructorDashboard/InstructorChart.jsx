import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import { FaChartBar, FaChartLine, FaUsers, FaCoins, FaLayerGroup } from "react-icons/fa"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  // State for metric view: "students", "income", or "combined"
  const [currChart, setCurrChart] = useState("students")
  // State for chart visualization type: "bar" or "line"
  const [chartType, setChartType] = useState("bar")

  // Handle case where courses is null/empty
  const courseList = courses || []

  // Calculate top performing courses for summary stats
  const topEnrolled = courseList.length > 0 
    ? [...courseList].sort((a, b) => b.totalStudentsEnrolled - a.totalStudentsEnrolled)[0] 
    : null

  const topEarning = courseList.length > 0 
    ? [...courseList].sort((a, b) => b.totalAmountGenerated - a.totalAmountGenerated)[0] 
    : null

  // Chart Labels (Course Names)
  const labels = courseList.map((course) => 
    course.courseName.length > 22 
      ? course.courseName.substring(0, 20) + "..." 
      : course.courseName
  )

  // Datasets for single metric views
  const chartDataStudents = {
    labels,
    datasets: [
      {
        label: "Students Enrolled",
        data: courseList.map((course) => course.totalStudentsEnrolled),
        backgroundColor: "rgba(56, 189, 248, 0.75)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(56, 189, 248, 0.95)",
        tension: 0.35,
        fill: chartType === "line",
        pointBackgroundColor: "#38bdf8",
        pointBorderColor: "#0f172a",
        pointHoverRadius: 7,
      },
    ],
  }

  const chartIncomeData = {
    labels,
    datasets: [
      {
        label: "Income (₹)",
        data: courseList.map((course) => course.totalAmountGenerated),
        backgroundColor: "rgba(16, 185, 129, 0.75)",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(16, 185, 129, 0.95)",
        tension: 0.35,
        fill: chartType === "line",
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#0f172a",
        pointHoverRadius: 7,
      },
    ],
  }

  // Combined Dual-Axis Dataset
  const chartCombinedData = {
    labels,
    datasets: [
      {
        label: "Students Enrolled",
        data: courseList.map((course) => course.totalStudentsEnrolled),
        backgroundColor: "rgba(56, 189, 248, 0.75)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: "y",
        tension: 0.35,
        fill: false,
        pointBackgroundColor: "#38bdf8",
        pointHoverRadius: 7,
      },
      {
        label: "Income (₹)",
        data: courseList.map((course) => course.totalAmountGenerated),
        backgroundColor: "rgba(245, 158, 11, 0.75)",
        borderColor: "#f59e0b",
        borderWidth: 2,
        borderRadius: 6,
        yAxisID: "y1",
        tension: 0.35,
        fill: false,
        pointBackgroundColor: "#f59e0b",
        pointHoverRadius: 7,
      },
    ],
  }

  // Determine current dataset
  const currentData =
    currChart === "students"
      ? chartDataStudents
      : currChart === "income"
      ? chartIncomeData
      : chartCombinedData

  // Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#f1f2ff",
          font: {
            family: "Inter, sans-serif",
            size: 12,
            weight: "600",
          },
          usePointStyle: true,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: "#161D29",
        titleColor: "#F1F2FF",
        bodyColor: "#FFD60A",
        borderColor: "#2C333F",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || ""
            if (label) {
              label += ": "
            }
            if (context.parsed.y !== null) {
              if (
                context.dataset.yAxisID === "y1" ||
                label.toLowerCase().includes("income")
              ) {
                label += "₹" + context.parsed.y.toLocaleString("en-IN")
              } else {
                label += context.parsed.y.toLocaleString("en-IN") + " students"
              }
            }
            return label
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.06)",
          drawBorder: false,
        },
        ticks: {
          color: "#999DAA",
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        grid: {
          color: "rgba(255, 255, 255, 0.06)",
          drawBorder: false,
        },
        ticks: {
          color: "#999DAA",
          font: {
            family: "Inter, sans-serif",
            size: 11,
          },
          precision: 0,
        },
        beginAtZero: true,
        title: {
          display: currChart === "combined",
          text: "Students",
          color: "#38bdf8",
          font: { size: 12, weight: "bold" },
        },
      },
      ...(currChart === "combined"
        ? {
            y1: {
              type: "linear",
              display: true,
              position: "right",
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                color: "#f59e0b",
                font: {
                  family: "Inter, sans-serif",
                  size: 11,
                },
                callback: (value) => "₹" + value,
              },
              beginAtZero: true,
              title: {
                display: true,
                text: "Income (₹)",
                color: "#f59e0b",
                font: { size: 12, weight: "bold" },
              },
            },
          }
        : {}),
    },
  }

  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-xl bg-richblack-800 p-4 sm:p-6 border border-richblack-700">
      {/* Header controls: Metrics & Graph Types */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-richblack-700 pb-4">
        <div>
          <h3 className="text-lg font-bold text-richblack-5 flex items-center gap-2">
            📊 Course Analytics Graph
          </h3>
          <p className="text-xs text-richblack-300">
            Visualize your course enrollments and revenue with interactive graphs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-richblack-900 p-1 border border-richblack-700">
            <button
              onClick={() => setCurrChart("students")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                currChart === "students"
                  ? "bg-richblack-700 text-yellow-50 shadow-sm"
                  : "text-richblack-300 hover:text-richblack-5"
              }`}
            >
              <FaUsers size={12} />
              Students
            </button>

            <button
              onClick={() => setCurrChart("income")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                currChart === "income"
                  ? "bg-richblack-700 text-yellow-50 shadow-sm"
                  : "text-richblack-300 hover:text-richblack-5"
              }`}
            >
              <FaCoins size={12} />
              Income
            </button>

            <button
              onClick={() => setCurrChart("combined")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                currChart === "combined"
                  ? "bg-richblack-700 text-yellow-50 shadow-sm"
                  : "text-richblack-300 hover:text-richblack-5"
              }`}
            >
              <FaLayerGroup size={12} />
              Overview
            </button>
          </div>

          {/* Graph Type Selector (Bar vs Line) */}
          <div className="flex items-center gap-1 rounded-lg bg-richblack-900 p-1 border border-richblack-700">
            <button
              onClick={() => setChartType("bar")}
              title="Bar Chart Graph"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-yellow-50 text-richblack-900 font-semibold"
                  : "text-richblack-300 hover:text-richblack-5"
              }`}
            >
              <FaChartBar size={13} />
              Bar
            </button>
            <button
              onClick={() => setChartType("line")}
              title="Line Chart Graph"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                chartType === "line"
                  ? "bg-yellow-50 text-richblack-900 font-semibold"
                  : "text-richblack-300 hover:text-richblack-5"
              }`}
            >
              <FaChartLine size={13} />
              Line
            </button>
          </div>
        </div>
      </div>

      {/* Top performance quick highlights */}
      {courseList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {topEnrolled && (
            <div className="flex items-center justify-between rounded-lg bg-richblack-900/60 p-2.5 px-3.5 border border-richblack-700/60">
              <span className="text-richblack-300">🔥 Top Enrolled Course:</span>
              <span className="font-semibold text-yellow-50 truncate max-w-[180px]">
                {topEnrolled.courseName} ({topEnrolled.totalStudentsEnrolled} students)
              </span>
            </div>
          )}
          {topEarning && (
            <div className="flex items-center justify-between rounded-lg bg-richblack-900/60 p-2.5 px-3.5 border border-richblack-700/60">
              <span className="text-richblack-300">💰 Highest Earning Course:</span>
              <span className="font-semibold text-caribbeangreen-300 truncate max-w-[180px]">
                {topEarning.courseName} (₹{topEarning.totalAmountGenerated.toLocaleString("en-IN")})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Graph Area */}
      <div className="relative min-h-[320px] w-full pt-2">
        {chartType === "bar" ? (
          <Bar data={currentData} options={options} />
        ) : (
          <Line data={currentData} options={options} />
        )}
      </div>
    </div>
  )
}
