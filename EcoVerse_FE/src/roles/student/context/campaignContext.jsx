import React, { createContext, useContext, useState } from "react";
import { getCampaignDetails } from "../services";

// Tạo context
const CampaignContext = createContext(undefined);

export function CampaignProvider({ children }) {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const clearCampaign = () => setSelectedCampaign(null);

  return (
    <CampaignContext.Provider
      value={{
        selectedCampaign,
        setSelectedCampaign,
        clearCampaign,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaignContext() {
  const context = useContext(CampaignContext);

  if (context === undefined) {
    throw new Error(
      "useCampaignContext must be used within a CampaignProvider",
    );
  }

  return context;
}
