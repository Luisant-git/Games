import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "antd";
import {
  FolderOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  PayCircleOutlined,
  HistoryOutlined,
  TrophyOutlined,
  BarChartOutlined,
  UserSwitchOutlined,
  FieldTimeOutlined,
  RocketOutlined,
  ExportOutlined,
  MoneyCollectOutlined,
  TagsOutlined,
  AppstoreOutlined,
  PieChartFilled,
  DotChartOutlined,
  AreaChartOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
  {
    key: "master",
    icon: <FolderOutlined />,          
    label: "Master",
    children: [
      { key: "/category", icon: <TagsOutlined />, label: "Category" },            
      { key: "/timing",   icon: <ClockCircleOutlined />, label: "Timing" },       
      { key: "/board",    icon: <AppstoreOutlined />, label: "Board" },           
    ],
  },
  {
    key: "users",
    icon: <TeamOutlined />,            
    label: "Users",
    children: [
      { key: "/players",        icon: <UserOutlined />,       label: "Players" },
      { key: "/agents",         icon: <UserSwitchOutlined />, label: "Agents" },
      { key: "/game-history",   icon: <HistoryOutlined />,    label: "Player Games" },
      { key: "/agent-overview", icon: <BarChartOutlined />,   label: "Agent Games" },
    ],
  },
  {
    key: "payments",
    icon: <PayCircleOutlined />,       
    label: "Payments",
    children: [
      { key: "/deposit",  icon: <MoneyCollectOutlined />, label: "Deposit" },     
      { key: "/withdraw", icon: <ExportOutlined />,       label: "Withdraw" },
      { key: "/payment-settings", icon: <ClockCircleOutlined />, label: "Settings" },   
    ],
  },
  {
    key: "/game-play",
    icon: <RocketOutlined />,          
    label: "Game Play",
    children: [
      { key: "/results",          icon: <TrophyOutlined />,     label: "Results" },
      { key: "/history-showtime", icon: <FieldTimeOutlined />,  label: "Showtime History" },
    ],
  },
  {
    key: "reports",
    icon: <BarChartOutlined />,        
    label: "Reports",
    children: [
      { key: "/order-report", icon: <PieChartFilled />, label: "Orders Report" },
      { key: "/summary-report", icon: <DotChartOutlined />, label: "Summary Report" },
      { key: "/player-report", icon: <AreaChartOutlined />, label: "Player Report" },
      { key: "/agent-report", icon: <RadarChartOutlined />, label: "Agent Report" },
    ],
  }
];


  const handleMenuClick = ({ key }) => {
    if (key === "/") {
      navigate("/category");
    } else {
      navigate(key);
    }
    if (isMobile) {
      onClose();
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Admin Panel</h2>
        <button className="close-btn mobile-only" onClick={onClose}>
          ✕
        </button>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["master"]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          height: "100%",
          borderRight: 0,
          background: "transparent",
        }}
      />
    </aside>
  );
};

export default Sidebar;
