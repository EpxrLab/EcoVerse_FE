import { Outlet } from "react-router-dom";
import { CampaignProvider } from "./context";

export default function StudentLayout() {
  return (
    <CampaignProvider>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </CampaignProvider>
  );
}
