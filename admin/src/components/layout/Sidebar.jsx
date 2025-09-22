import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "antd";
import {
  DashboardOutlined,
  FolderOutlined,
  BookOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  UserOutlined,
  AntDesignOutlined,
  TeamOutlined,
  DeliveredProcedureOutlined,
  PayCircleOutlined,
  HistoryOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "master",
      icon: <FolderOutlined />,
      label: "Master",
      children: [
        {
          key: "/category",
          icon: <BookOutlined />,
          label: "Category",
        },
        {
          key: "/timing",
          icon: <ClockCircleOutlined />,
          label: "Timing",
        },
        {
          key: "/board",
          icon: <PlayCircleOutlined />,
          label: "Board",
        },
      ],
    },
    {
      key: "users",
      icon: <TeamOutlined />,
      label: "Users",
      children: [
        {
          key: "/players",
          icon: <UserOutlined />,
          label: "Players",
        },
        {
          key: "/agents",
          icon: <AntDesignOutlined />,
          label: "Agents",
        },
        {
          key: "/agent-overview",
          icon: <PlayCircleOutlined />,
          label: "Agent Games",
        },
      ],
    },
    {
      key: "payments",
      icon: <PayCircleOutlined />,
      label: "Payments",
      children: [
        {
          key: "/deposit",
          icon: <DeliveredProcedureOutlined />,
          label: "Deposit",
        },
      ],
    },
    {
      key: "/game-play",
      icon: <PlayCircleOutlined />,
      label: "Game Play",
      children: [
        {
          key: "/results",
          icon: <TrophyOutlined />,
          label: "Results",
        },
        {
          key: "/game-history",
          icon: <HistoryOutlined />,
          label: "History",
        },
        {
          key: "/history-showtime",
          icon: <BarChartOutlined />,
          label: "Showtime History",
        }
      ],
    }
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
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
