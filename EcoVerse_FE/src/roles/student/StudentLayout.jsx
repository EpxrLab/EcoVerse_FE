import { Outlet } from "react-router";
import { CampaignProvider, StudentProvider } from "./context";

export default function StudentLayout() {
  return (
    <StudentProvider>
      <CampaignProvider>
        <div className="min-h-screen bg-background theme-student">
          <Outlet />
        </div>
      </CampaignProvider>
    </StudentProvider>
  );
}
