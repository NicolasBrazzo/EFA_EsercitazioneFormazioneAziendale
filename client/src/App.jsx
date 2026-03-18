import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PrivateRoute } from "./api/components/PrivateRoute.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { AppLayout } from "./layouts/AppLayout.jsx";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Events } from "./pages/Events.jsx";
import { Checkin } from "./pages/Checkin.jsx";
import { Users } from "./pages/Users.jsx";
import { Subscriptions } from "./pages/Subscriptions.jsx";
import { MyEvents } from "./pages/MyEvents.jsx";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<PrivateRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/checkin" element={<Checkin />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/my-events" element={<MyEvents />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
      <ToastContainer />
    </>
  );
}

export default App;
