import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import News from './pages/News';
import Register from './pages/Register';
import NewPassword from './pages/ForgotPassword';
import Mypage from './pages/Mypage';
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
import NewsDetail from './pages/NewsDetail';
import EventsToday from "./pages/EventsToday";
import CalendarEvents from './pages/CalendarEvents';
import ApiaryDetails from './pages/ApiaryDetails';
import HiveDetails from './pages/HiveDetails';
import ResetPassword from './pages/ResetPassword';
import AllDocumentsPage from './pages/Documents';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>

          {/* Publika routes */}
          <Route index element={<Home />} />
          <Route path="news"            element={<News />} />
          <Route path="login"           element={<Login />} />
          <Route path="register"        element={<Register />} />
          <Route path="forgot-password"    element={<NewPassword />} />
          <Route path="reset-password"  element={<ResetPassword />} />
          <Route path="news/:id"        element={<NewsDetail />} />
          <Route path="calendar/:date"  element={<EventsToday />} />
          <Route path="calendar"        element={<CalendarEvents />} />
          <Route path="dokument"        element={<AllDocumentsPage />} />
          
          {/* Skyddade routes */}
          <Route path="mypage"          element={<ProtectedRoute><Mypage /></ProtectedRoute>} />
          <Route path="admin"           element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
          <Route path="apiary/:id"      element={<ProtectedRoute><ApiaryDetails /></ProtectedRoute>} />
          <Route path="hive/:id"        element={<ProtectedRoute><HiveDetails /></ProtectedRoute>} />


        </Route>
      </Routes>
    </Router>
  );
}

export default App;
