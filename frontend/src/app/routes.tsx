import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./auth/RequireAuth";
import { Dashboard } from "./screens/Dashboard";
import { Search } from "./screens/Search";
import { MapScreen } from "./screens/MapScreen";
import { LocationDetail } from "./screens/LocationDetail";
import { Review } from "./screens/Review";
import { IndoorTraining } from "./screens/IndoorTraining";
import { VideoPlayer } from "./screens/VideoPlayer";
import { Schedule } from "./screens/Schedule";
import { Community } from "./screens/Community";
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";
import { Profile } from "./screens/Profile";
import { EditProfile } from "./screens/EditProfile";
import { ChangePassword } from "./screens/ChangePassword";
import { Chat } from "./screens/Chat";
import { NotFound } from "./screens/NotFound";
import { ForgotPassword } from "./screens/ForgotPassword";
import { ResetPassword } from "./screens/ResetPassword";
import { useEffect } from "react";
import { useNavigate } from "react-router";

function MapRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/search", { replace: true });
  }, [navigate]);
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: () => (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: Dashboard },
      // Search + Map are merged into one screen to avoid duplicated functionality
      { path: "search", Component: MapScreen },
      { path: "map", Component: MapRedirect },
      { path: "location/:id", Component: LocationDetail },
      { path: "review/:id", Component: Review },
      { path: "indoor", Component: IndoorTraining },
      { path: "video/:id", Component: VideoPlayer },
      { path: "schedule", Component: Schedule },
      { path: "community", Component: Community },
      { path: "profile", Component: Profile },
      { path: "profile/edit", Component: EditProfile },
      { path: "profile/change-password", Component: ChangePassword },
      { path: "chat/:id", Component: Chat },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
]);
