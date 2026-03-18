import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RecordsPage from "./pages/RecordsPage";
import RecordDetailPage from "./pages/RecordDetailPage";
import AddRecordPage from "./pages/AddRecordPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileEditPage from "./pages/ProfileEditPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/records/new" element={<AddRecordPage />} />
        <Route path="/records/:id" element={<RecordDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
