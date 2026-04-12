import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RecordsPage from "./pages/RecordsPage";
import RecordDetailPage from "./pages/RecordDetailPage";
import AddRecordPage from "./pages/AddRecordPage";
import EditRecordPage from "./pages/EditRecordPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";
import UserListPage from "./pages/UserListPage";
import UserProfilePage from "./pages/UserProfilePage";
import MatchesPage from "./pages/MatchesPage";
import WeightPage from "./pages/WeightPage";
import AuthPage from "./pages/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import BottomNav from "./components/BottomNav";

function AppContent() {
  const { pathname } = useLocation();
  const hideNav = pathname === "/" || pathname === "/auth";

  return (
    <>
      <div className={hideNav ? "" : "pb-16"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/records/new" element={<AddRecordPage />} />
          <Route path="/records/:id" element={<RecordDetailPage />} />
          <Route path="/records/:id/edit" element={<EditRecordPage />} />
          <Route path="/weight" element={<PrivateRoute><WeightPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><ProfileEditPage /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UserListPage /></PrivateRoute>} />
          <Route path="/users/:id" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
          <Route path="/matches" element={<PrivateRoute><MatchesPage /></PrivateRoute>} />
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
