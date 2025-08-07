import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const RevenueChart = ({ jobs = [] }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    const months = [];
    const revenue = [];

    // Generate last 6 months data
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthlyRevenue = jobs
        .filter(job => {
          if (!job.paidAt || !job.price) return false;
          const paidDate = parseISO(job.paidAt);
          return isWithinInterval(paidDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, job) => sum + job.price, 0);

      months.push(format(monthDate, 'MMM'));
      revenue.push(monthlyRevenue);
    }

    return { months, revenue };
  }, [jobs]);

  const chartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
      sparkline: { enabled: false }
    },
    colors: ['#3b82f6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100]
      }
    },
    stroke: {
      width: 2,
      curve: 'smooth'
    },
    markers: {
      size: 4,
      colors: ['#3b82f6'],
      strokeWidth: 2,
      strokeColors: '#ffffff'
    },
    xaxis: {
      categories: chartData.months,
      labels: {
        style: { 
          fontSize: '12px', 
          colors: '#64748b',
          fontFamily: 'Inter, sans-serif'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${Math.round(value).toLocaleString()}`,
        style: { 
          fontSize: '12px', 
          colors: '#64748b',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 2,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: { height: 200 },
        xaxis: {
          labels: { style: { fontSize: '10px' } }
        },
        yaxis: {
          labels: { style: { fontSize: '10px' } }
        }
      }
    }]
  };

  return (
    <Chart
      options={chartOptions}
      series={[{ name: 'Revenue', data: chartData.revenue }]}
      type="area"
      height="100%"
    />
  );
};

export default RevenueChart;