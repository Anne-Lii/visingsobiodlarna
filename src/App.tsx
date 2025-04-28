import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import News from './pages/News';
import Register from './pages/Register';
import NewPassword from './pages/New_password';
import Mypage from './pages/Mypage';
import ProtectedRoute from './components/ProtectedRoute';
import CreateNews from './pages/CreateNews';
import Admin from './pages/Admin';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>

          {/* Publika routes */}
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="new_password" element={<NewPassword />} />

          {/* Skyddade routes */}
          <Route path="mypage" element={<ProtectedRoute><Mypage /></ProtectedRoute>} />
          <Route path="create_news" element={<ProtectedRoute><CreateNews /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
