import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import News from './pages/News';
import Register from './pages/Register';
import New_password from './pages/New_password';
import Mypage from './pages/Mypage';
import ProtectedRoute from './components/ProtectedRoute';



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
          <Route path="new_password" element={<New_password />} />

          {/* Skyddade routes */}
          <Route path="mypage" element={<ProtectedRoute><Mypage /></ProtectedRoute>} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
