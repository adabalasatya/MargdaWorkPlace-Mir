"use client"
import SendEmailCon from "@/app/(DashboardComponents)/ContactListComponents/SendEmailCon/page";
import WhatsAppCon from "@/app/(DashboardComponents)/ContactListComponents/SendWhatsappCon/page";
import CallCon from "@/app/(DashboardComponents)/ContactListComponents/SendCallCon/page";
import SendSmsCon from "@/app/(DashboardComponents)/ContactListComponents/SendSmsCon/page";

const CommunicationModals = ({
  showEmailSend,
  setShowEmailSend,
  showWhatsappSend,
  setShowSendWhatsapp,
  showCallSend,
  setShowCallSend,
  showSmsSend,
  setShowSmsSend,
  selectedRows,
  setSelectedRows,
  userID,
  fetchData,
}) => {
  return (
    <>
      {/* Email Send Modal */}
      {showEmailSend && (
        <SendEmailCon
          setSendEmail={setShowEmailSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* WhatsApp Send Modal */}
      {showWhatsappSend && (
        <WhatsAppCon
          setClose={setShowSendWhatsapp}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}

      {/* Call Send Modal */}
      {showCallSend && (
        <CallCon
          setShowCallCon={setShowCallSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          fetchData={() => fetchData(userID)}
        />
      )}

      {/* SMS Send Modal */}
      {showSmsSend && (
        <SendSmsCon
          setClose={setShowSmsSend}
          setSelectedLeads={setSelectedRows}
          selectedLeads={selectedRows}
          userID={userID}
        />
      )}
    </>
  );
};

export default CommunicationModals;
