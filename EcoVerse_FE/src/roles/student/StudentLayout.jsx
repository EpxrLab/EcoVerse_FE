import { Outlet } from "react-router";
import { CampaignProvider } from "./context";

export default function StudentLayout() {
  return (
    <CampaignProvider>
      <div className="min-h-screen bg-background theme-student">
        <Outlet />
      </div>
    </CampaignProvider>
  );
}
