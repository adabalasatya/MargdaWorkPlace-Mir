"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import Image from "next/image";
import {
  FaBuilding,
  FaUserTie,
  FaEdit,
  FaWhatsapp,
  FaPhone,
  FaArrowAltCircleRight,
  FaHourglassEnd,
  FaVoicemail,
  FaMailBulk,
  FaArrowRight,
  FaList,
  FaSms,
} from "react-icons/fa";

const Sidebar = ({ toggleSidebar }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [menuStates, setMenuStates] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMenuStates = sessionStorage.getItem("menuStates");
      return savedMenuStates ? JSON.parse(savedMenuStates) : {};
    }
    return {};
  });

  const sidebarRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = sessionStorage.getItem("userData");
      if (!userData) {
        router.push("/login");
        return;
      }
      try {
        const parsedUserData = JSON.parse(userData);
        if (!parsedUserData) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    }
  }, [router]);

  const menus = [
    // Uncomment HR menu when needed
    // {
    //   name: "HR Management",
    //   icon: <FaUserTie />,
    //   color: "from-purple-500 to-purple-600",
    //   hoverColor: "hover:from-purple-500 hover:to-purple-600",
    //   items: [
    //     { title: "Add Skill", link: "/add-skill", icon: <FaArrowAltCircleRight /> },
    //     { title: "Skill MCQ", link: "/skill-mcq", icon: <FaArrowAltCircleRight /> },
    //     { title: "Skill Test", link: "/skill-test", icon: <FaArrowAltCircleRight /> },
    //     { title: "Add Interview Questions", link: "/add-hr-question", icon: <FaArrowAltCircleRight /> },
    //     { title: "HR Interaction", link: "/hr-interaction", icon: <FaArrowAltCircleRight /> },
    //     { title: "HR Communication Test", link: "/hr-communication-test", icon: <FaArrowAltCircleRight /> },
    //     { title: "Trainee Dashboard", link: "/trainee-dashboard", icon: <FaArrowAltCircleRight /> },
    //     { title: "Upload Documents", link: "/upload-documents", icon: <FaArrowAltCircleRight /> },
    //     { title: "Verify Documents", link: "/verify-documents", icon: <FaArrowAltCircleRight /> },
    //   ],
    // },
    {
      name: "Email Campaign",
      icon: <FaMailBulk />,
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-500 hover:to-blue-600",
      items: [
        {
          title: "Email Credentials",
          link: "/email-credentials",
          icon: <FaArrowAltCircleRight />,
        },
        {
          title: "Email Campaign",
          link: "/email-campaign",
          icon: <FaArrowAltCircleRight />,
        },
        {
          title: "Email  Reports",
          link: "/campaign-report",
          icon: <FaArrowAltCircleRight />,
        },
        // { title: "Communicate", link: "/work/communicate", icon: <FaArrowAltCircleRight /> },
      ],
    },
    {
      name: "WhatsApp Campaign",
      icon: <FaWhatsapp />,
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-500 hover:to-green-600",
      items: [
        {
          title: "Scan WhatsApp",
          link: "/qr-scan",
          icon: <FaArrowAltCircleRight />,
        },
        {
          title: "WhatsApp Campaign",
          link: "/whatsapp-campaign",
          icon: <FaArrowAltCircleRight />,
        },
        {
          title: "WhatsApp Reports",
          link: "/whatsapp-campaign-report",
          icon: <FaArrowAltCircleRight />,
        },
        // { title: "Communicate", link: "/work/whatsapp-communicate", icon: <FaArrowAltCircleRight /> },
      ],
    },
    {
      name: "SMS/RCM Campaign",
      icon: <FaSms />,
      color: "from-purple-500 to-violet-600",
      hoverColor: "hover:from-orange-500 hover:to-orange-600",
      items: [
        // { title: "SIM/API Credentials", link: "/work/sim-api-credentials", icon: <FaArrowAltCircleRight /> },
        {
          title: "SMS Campaign",
          link: "/sms-campaign",
          icon: <FaArrowAltCircleRight />,
        },
        // { title: "SMS Lists", link: "/work/sms-lists", icon: <FaArrowAltCircleRight /> },
        // { title: "SMS Templates", link: "/work/Sms-templates", icon: <FaArrowAltCircleRight /> },
        {
          title: "SMS Reports",
          link: "/sms-campaign-report",
          icon: <FaArrowAltCircleRight />,
        },
        // { title: "SMS Communicate", link: "/work/sms-communicate", icon: <FaArrowAltCircleRight /> },
      ],
    },
    {
      name: "Templates",
      icon: <FaList />,
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "hover:from-indigo-500 hover:to-indigo-600",
      items: [
        {
          title: "All Templates",
          link: "/templates-list",
          icon: <FaArrowRight />,
        },
        {
          title: "Add Template",
          link: "/add-template",
          icon: <FaArrowRight />,
        },
      ],
    },
    {
      name: "Lists Management",
      icon: <FaList />,
      color: "from-teal-500 to-teal-600",
      hoverColor: "hover:from-teal-500 hover:to-teal-600",
      items: [
        {
          title: "Manage Lists",
          link: "/manage-lists",
          icon: <FaArrowRight />,
        },
      ],
    },
    {
      name: "Task Management",
      icon: <FaList />,
      color: "from-rose-500 to-rose-600",
      hoverColor: "hover:from-rose-500 hover:to-rose-600",
      items: [
        {
          title: "Manage Tasks",
          link: "/manage-tasks",
          icon: <FaArrowRight />,
        },
      ],
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("menuStates", JSON.stringify(menuStates));
    }
  }, [menuStates]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("menuStates", JSON.stringify({}));
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const scrollPositionKey = `sidebarScrollPosition`;

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current && typeof window !== "undefined") {
        const scrollTop = scrollContainerRef.current.scrollTop;
        sessionStorage.setItem(scrollPositionKey, scrollTop);
      }
    };
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer)
      scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      if (scrollContainer)
        scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [scrollPositionKey]);

  useEffect(() => {
    const restoreScrollPosition = () => {
      if (typeof window !== "undefined") {
        const savedPosition = sessionStorage.getItem(scrollPositionKey);
        if (savedPosition && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = parseInt(savedPosition, 10);
        }
      }
    };
    restoreScrollPosition();
  }, [pathname, scrollPositionKey]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMenuStates({});
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const toggleMenu = (name) => (e) => {
    e.stopPropagation();
    setMenuStates((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if (isMobile) setIsOpen(false);
  };

  const isActiveRoute = (link) => {
    return pathname === link;
  };

  // Helper function to get hover classes based on menu color
  const getHoverClasses = (menu) => {
    const colorMap = {
      "from-blue-500 to-blue-600": "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600",
      "from-green-500 to-green-600": "hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600",
      "from-purple-500 to-violet-600": "hover:bg-gradient-to-r hover:from-purple-500 hover:to-violet-600",
      "from-indigo-500 to-indigo-600": "hover:bg-gradient-to-r hover:from-indigo-500 hover:to-indigo-600",
      "from-teal-500 to-teal-600": "hover:bg-gradient-to-r hover:from-teal-500 hover:to-teal-600",
      "from-rose-500 to-rose-600": "hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-600",
      "from-purple-500 to-purple-600": "hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600",
    };
    
    return colorMap[menu.color] || "hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-600";
  };

  const renderMenu = (menu) => (
    <div className="group">
      <div
        className={`
          relative overflow-hidden rounded-xl
          bg-gradient-to-r ${menu.color}
          shadow-lg hover:shadow-xl
          transform hover:-translate-y-0.5
          transition-all duration-300 ease-out
          cursor-pointer
        `}
        onClick={toggleMenu(menu.name)}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div
  className={`
    relative p-3 flex items-center text-white
    ${!isOpen ? "justify-center" : "justify-between"}
  `}
>
  <div className="flex items-center space-x-3">
    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
      <span className="text-sm">{menu.icon}</span>
    </div>
    {isOpen && (
      <span className="font-semibold text-[12px] tracking-wide">
        {menu.name}
      </span>
    )}
  </div>

  {/* Toggle icon (clickable) */}
  {isOpen && (
    <button
      onClick={toggleMenu(menu.name)}
      className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition"
    >
      {menuStates[menu.name] ? (
        <ChevronDown className="w-3 h-3 transition-transform duration-200" />
      ) : (
        <ChevronRight className="w-3 h-3 transition-transform duration-200" />
      )}
    </button>
  )}
</div>

      </div>

      {/* Dropdown Menu */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${menuStates[menu.name] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div
          className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {menu.items.map((item, index) => {
            const isActive = isActiveRoute(item.link);
            const hoverClasses = getHoverClasses(menu);
            
            return (
              <Link
                key={item.link || item.title}
                href={item.link}
                onClick={handleLinkClick}
                className={`
                  flex items-center px-4 py-2 text-[12px] font-medium
                  transition-all duration-200 ease-in-out
                  border border-transparent
                  ${isActive
                    ? `bg-gradient-to-r ${menu.color} text-white border-white shadow-md`
                    : `text-gray-700 hover:text-white ${hoverClasses} hover:border-white hover:shadow-md`
                  }
                  ${index === 0 ? "rounded-t-xl" : ""}
                  ${index === menu.items.length - 1 ? "rounded-b-xl" : "border-b border-gray-50"}
                  ${!isOpen ? "justify-center px-2" : ""}
                `}
              >
                <div className={`
                  p-1.5 rounded-md mr-3
                  ${isActive ? "bg-white/20" : ""}
                  transition-all duration-200
                `}>
                  <span className="text-xs">{item.icon}</span>
                </div>
                {isOpen && (
                  <span className="font-medium tracking-wide">
                    {item.title}
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`
          relative z-40
          ${isMobile ? "fixed inset-y-0 left-0" : ""}
        `}
      >
        <aside
          ref={sidebarRef}
          className={`
            text-gray-900 transition-all duration-300 ease-in-out
            ${isMobile ? "h-screen" : "h-full"}
            ${isOpen ? "w-72" : "w-25"}
            ${isMobile && !isOpen ? "hidden" : ""}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Card */}
          <div className="bg-gradient-to-b from-slate-50 to-white border border-gray-200/50 rounded-2xl shadow-md h-full flex flex-col backdrop-blur-sm m-2">
            
            {/* Header Section */}
            <div className="flex items-center p-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm rounded-t-2xl">
              {isOpen && (
                <div className="flex-1 mr-4">
                  <Image
                    src="/margdalogo.png"
                    alt="Company Logo"
                    width={180}
                    height={32}
                    className="h-8 object-contain"
                    priority
                  />
                </div>
              )}
              
              <button
                className={`
                  group relative overflow-hidden
                  bg-gradient-to-r from-blue-600 to-blue-700
                  hover:from-blue-600 hover:to-blue-700
                  text-white p-2 rounded-xl shadow-lg hover:shadow-xl
                  transform hover:scale-105 active:scale-95
                  transition-all duration-200 ease-out
                  focus:outline-none focus:ring-4 focus:ring-blue-200
                  ${!isOpen ? "mx-auto" : ""}
                `}
                onClick={() => setIsOpen(!isOpen)}
              >
                <Menu className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:rotate-180" />
                
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>

            {/* Navigation Section */}
            <div
              ref={scrollContainerRef}
              className={`
                flex-1 overflow-y-auto overflow-x-hidden
                p-4 space-y-4
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                hover:scrollbar-thumb-gray-400
              `}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
            >
              {menus.map((menu) => (
                <React.Fragment key={menu.name}>
                  {renderMenu(menu)}
                </React.Fragment>
              ))}
            </div>

            {/* Footer Section */}
            <div className="p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-b-2xl">
              <div className={`
                text-center text-xs text-gray-500 font-medium
                ${!isOpen ? "hidden" : ""}
              `}>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
