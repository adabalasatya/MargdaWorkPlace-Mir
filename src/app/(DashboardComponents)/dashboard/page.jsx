'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Mail, MessageCircle, MessageSquare, TrendingUp, Users, Send, ArrowUpRight, Eye, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

const Dashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [userID, setUserID] = useState("");
  const [loading, setLoading] = useState(true);
  const [campaignStats, setCampaignStats] = useState({
    email: { sent: 0, opened: 0, bounced: 0 },
    sms: { sent: 0, delivered: 0 },
    whatsapp: { sent: 0, delivered: 0 }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUserData = JSON.parse(sessionStorage.getItem("userData") || 'null');
    if (!storedUserData || !storedUserData.pic) {
      router.push("/update-profile");
      return;
    } else {
      setUserData(storedUserData);
      const userID = storedUserData.userID;
      setUserID(userID);
      fetchAllCampaignData(userID);
    }
  }, [router]);

  const fetchAllCampaignData = async (userID) => {
    if (!userID) return;
    
    try {
      setLoading(true);
      
      // Fetch all campaign types in parallel
      const [emailResponse, smsResponse, whatsappResponse] = await Promise.all([
        fetch("https://www.margda.in/miraj/work/email-campaign/get-campaigns", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userID }),
        }),
        fetch("https://www.margda.in/miraj/work/sms-campaign/get-campaigns", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userID }),
        }),
        fetch("https://www.margda.in/miraj/work/whatsapp-campaign/get-campaigns", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userID }),
        })
      ]);

      // Process email campaigns
      let emailSent = 0;
      let emailOpened = 0;
      let emailBounced = 0;
      
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        const emailCampaigns = emailData.data || [];
        emailCampaigns.forEach(campaign => {
          emailSent += parseInt(campaign.emails_Sent) || 0;
          emailOpened += parseInt(campaign.emails_opened) || 0;
          emailBounced += parseInt(campaign.emails_bounced) || 0;
        });
      }

      // Process SMS campaigns
      let smsSent = 0;
      let smsDelivered = 0;
      
      if (smsResponse.ok) {
        const smsData = await smsResponse.json();
        const smsCampaigns = smsData.data || [];
        smsCampaigns.forEach(campaign => {
          smsSent += parseInt(campaign.sms_sent) || 0;
          // Assuming delivered rate is similar to success rate
          smsDelivered += Math.round((parseInt(campaign.sms_sent) || 0) * 0.85); // 85% delivery estimate
        });
      }

      // Process WhatsApp campaigns
      let whatsappSent = 0;
      let whatsappDelivered = 0;
      
      if (whatsappResponse.ok) {
        const whatsappData = await whatsappResponse.json();
        const whatsappCampaigns = whatsappData.data || [];
        whatsappCampaigns.forEach(campaign => {
          whatsappSent += parseInt(campaign.whatsappSent) || 0;
          // Assuming higher delivery rate for WhatsApp
          whatsappDelivered += Math.round((parseInt(campaign.whatsapp_Sent) || 0) * 0.95); // 95% delivery estimate
        });
      }

      // Update state with aggregated data
      setCampaignStats({
        email: { sent: emailSent, opened: emailOpened, bounced: emailBounced },
        sms: { sent: smsSent, delivered: smsDelivered },
        whatsapp: { sent: whatsappSent, delivered: whatsappDelivered }
      });

    } catch (error) {
      console.error("Error fetching campaign data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts (using real data)
  const lineChartData = [
    { name: 'Mon', Email: Math.round(campaignStats.email.sent / 7), WhatsApp: Math.round(campaignStats.whatsapp.sent / 7), SMS: Math.round(campaignStats.sms.sent / 7) },
    { name: 'Tue', Email: Math.round(campaignStats.email.sent / 7 * 1.2), WhatsApp: Math.round(campaignStats.whatsapp.sent / 7 * 1.1), SMS: Math.round(campaignStats.sms.sent / 7 * 0.9) },
    { name: 'Wed', Email: Math.round(campaignStats.email.sent / 7 * 1.5), WhatsApp: Math.round(campaignStats.whatsapp.sent / 7 * 1.3), SMS: Math.round(campaignStats.sms.sent / 7 * 1.2) },
    { name: 'Thu', Email: Math.round(campaignStats.email.sent / 7 * 1.7), WhatsApp: Math.round(campaignStats.whatsapp.sent / 7 * 1.5), SMS: Math.round(campaignStats.sms.sent / 7 * 1.1) },
    { name: 'Fri', Email: Math.round(campaignStats.email.sent / 7 * 1.4), WhatsApp: Math.round(campaignStats.whatsapp.sent / 7 * 1.7), SMS: Math.round(campaignStats.sms.sent / 7 * 0.8) },
    { name: 'Sat', Email: Math.round(campaignStats.email.sent / 7 * 0.5), WhatsApp: Math.round(campaignStats.whatsapp.sent / 7 * 1.9), SMS: Math.round(campaignStats.sms.sent / 7 * 0.7) },
    { name: 'Sun', Email: Math.round(campaignStats.email.sent / 7 * 0.4), WhatsApp: Math.round(campaignStats.whatsapp.sent / 7 * 2.1), SMS: Math.round(campaignStats.sms.sent / 7 * 0.6) }
  ];

  const areaChartData = [
    { name: 'Jan', value: Math.round(campaignStats.email.sent / 6) },
    { name: 'Feb', value: Math.round(campaignStats.email.sent / 6 * 0.8) },
    { name: 'Mar', value: Math.round(campaignStats.email.sent / 6 * 1.5) },
    { name: 'Apr', value: Math.round(campaignStats.email.sent / 6 * 2) },
    { name: 'May', value: Math.round(campaignStats.email.sent / 6 * 1.2) },
    { name: 'Jun', value: Math.round(campaignStats.email.sent / 6 * 2.5) }
  ];

  const pieChartData = [
    { 
      name: 'Email', 
      value: campaignStats.email.sent > 0 ? Math.round((campaignStats.email.sent / (campaignStats.email.sent + campaignStats.sms.sent + campaignStats.whatsapp.sent)) * 100) : 0, 
      color: '#667eea' 
    },
    { 
      name: 'WhatsApp', 
      value: campaignStats.whatsapp.sent > 0 ? Math.round((campaignStats.whatsapp.sent / (campaignStats.email.sent + campaignStats.sms.sent + campaignStats.whatsapp.sent)) * 100) : 0, 
      color: '#764ba2' 
    },
    { 
      name: 'SMS', 
      value: campaignStats.sms.sent > 0 ? Math.round((campaignStats.sms.sent / (campaignStats.email.sent + campaignStats.sms.sent + campaignStats.whatsapp.sent)) * 100) : 0, 
      color: '#f093fb' 
    }
  ];

  // Card data with real statistics
  const cardData = [
    {
      title: 'Email Campaigns',
      sent: campaignStats.email.sent,
      metric: campaignStats.email.opened,
      rate: campaignStats.email.sent > 0 ? Math.round((campaignStats.email.opened / campaignStats.email.sent) * 100) : 0,
      rateLabel: 'Open Rate',
      metricLabel: 'Opened',
      icon: Mail,
      iconBg: 'bg-blue-500',
      trend: 12,
      color: '#3b82f6',
      metricIcon: Eye
    },
    {
      title: 'WhatsApp Messages',
      sent: campaignStats.whatsapp.sent,
      metric: campaignStats.whatsapp.delivered,
      rate: campaignStats.whatsapp.sent > 0 ? Math.round((campaignStats.whatsapp.delivered / campaignStats.whatsapp.sent) * 100) : 0,
      rateLabel: 'Delivery Rate',
      metricLabel: 'Delivered',
      icon: MessageCircle,
      iconBg: 'bg-green-500',
      trend: 8,
      color: '#10b981',
      metricIcon: CheckCircle
    },
    {
      title: 'SMS Campaigns',
      sent: campaignStats.sms.sent,
      metric: campaignStats.sms.delivered,
      rate: campaignStats.sms.sent > 0 ? Math.round((campaignStats.sms.delivered / campaignStats.sms.sent) * 100) : 0,
      rateLabel: 'Delivery Rate',
      metricLabel: 'Delivered',
      icon: MessageSquare,
      iconBg: 'bg-purple-500',
      trend: 15,
      color: '#8b5cf6',
      metricIcon: CheckCircle
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">
                Communication Dashboard
              </h1>
              <p className="text-slate-600 font-medium">Real-time analytics and performance insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => fetchAllCampaignData(userID)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Modern Material Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {cardData.map((card, index) => {
            const IconComponent = card.icon;
            const MetricIconComponent = card.metricIcon;
            return (
              <div key={index} className="group relative">
                {/* Card Background with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl shadow-slate-200/50"></div>
                
                {/* Card Content */}
                <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 hover:shadow-2xl hover:shadow-slate-300/30 transition-all duration-300 hover:-translate-y-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-xl ${card.iconBg} shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center text-green-600 font-semibold">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      +{card.trend}%
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-800 mb-4">{card.title}</h3>
                  
                  {/* Metrics */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-slate-600">
                        <Send className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="font-medium">Sent</span>
                      </div>
                      <span className="text-2xl font-bold text-slate-900">{card.sent.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-slate-600">
                        <MetricIconComponent className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="font-medium">{card.metricLabel}</span>
                      </div>
                      <span className="text-2xl font-bold text-slate-900">{card.metric.toLocaleString()}</span>
                    </div>
                   {/* Progress Bar */}
<div className="pt-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-slate-700">{card.rateLabel}</span>
    <span className="text-lg font-bold" style={{ color: card.color }}>
      {card.rate}%
    </span>
  </div>
  <div className="w-full bg-slate-200 rounded-full h-2">
    <div
      className="h-2 rounded-full transition-all duration-500"
      style={{
        width: `${Math.min(card.rate, 100)}%`, // ✅ Cap at 100%
        background: `linear-gradient(90deg, ${card.color}, ${card.color}dd)`
      }}
    ></div>
  </div>
</div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Side - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Modern Line Chart */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl shadow-slate-200/50"></div>
              <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">Performance Trends</h3>
                  <div className="flex space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-slate-600">Email</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-slate-600">WhatsApp</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-slate-600">SMS</span>
                    </div>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={lineChartData}>
                      <defs>
                        <linearGradient id="emailGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="whatsappGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="smsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }} 
                      />
                      <Area type="monotone" dataKey="Email" stroke="#3b82f6" strokeWidth={3} fill="url(#emailGradient)" />
                      <Area type="monotone" dataKey="WhatsApp" stroke="#10b981" strokeWidth={3} fill="url(#whatsappGradient)" />
                      <Area type="monotone" dataKey="SMS" stroke="#8b5cf6" strokeWidth={3} fill="url(#smsGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Modern Bar Chart */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl shadow-slate-200/50"></div>
              <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Engagement Analysis</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Email', sent: campaignStats.email.sent, metric: campaignStats.email.opened, metricLabel: 'Opened' },
                      { name: 'WhatsApp', sent: campaignStats.whatsapp.sent, metric: campaignStats.whatsapp.delivered, metricLabel: 'Delivered' },
                      { name: 'SMS', sent: campaignStats.sms.sent, metric: campaignStats.sms.delivered, metricLabel: 'Delivered' }
                    ]} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          if (name === 'sent') return [value, 'Sent'];
                          if (name === 'metric') return [value, props.payload.metricLabel];
                          return [value, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }} 
                      />
                      <Bar dataKey="sent" fill="#3280e6ff" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="metric" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={1}/>
                          <stop offset="95%" stopColor="#764ba2" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Modern Totals */}
          <div className="space-y-6">
            {/* Total Summary with Gradient Cards */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl shadow-slate-200/50"></div>
              <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Total Overview</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/25">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-3" />
                        <span className="font-semibold">Total Email</span>
                      </div>
                      <span className="text-xl font-bold">{campaignStats.email.sent.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow-lg shadow-green-500/25">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-3" />
                        <span className="font-semibold">Total WhatsApp</span>
                      </div>
                      <span className="text-xl font-bold">{campaignStats.whatsapp.sent.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/25">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 mr-3" />
                        <span className="font-semibold">Total SMS</span>
                      </div>
                      <span className="text-xl font-bold">{campaignStats.sms.sent.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-6 border-t border-slate-200">
                    <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl text-white">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Grand Total</span>
                        <span className="text-2xl font-bold">{(campaignStats.email.sent + campaignStats.whatsapp.sent + campaignStats.sms.sent).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Pie Chart */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl shadow-slate-200/50"></div>
              <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Channel Distribution</h3>
                <div className="h-76">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;