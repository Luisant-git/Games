const Dashboard = () => {
  const stats = [
    { label: 'Total Users', value: '1,234', change: '+12%', color: 'success' },
    { label: 'Revenue', value: '$45,678', change: '+8%', color: 'success' },
    { label: 'Orders', value: '567', change: '-3%', color: 'danger' },
    { label: 'Products', value: '89', change: '+5%', color: 'success' }
  ]

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.label}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.color}`}>{stat.change}</div>
          </div>
        ))}
      </div>
      
      <div className="charts-section">
        <div className="chart-card">
          <h3>Revenue Overview</h3>
          <div className="chart-placeholder">📊 Chart Area</div>
        </div>
        <div className="chart-card">
          <h3>User Activity</h3>
          <div className="chart-placeholder">📈 Chart Area</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard