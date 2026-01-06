# Visingsö Beekeepers Association – Frontend
Frontend for the **Visingsö Beekeepers Association** digital platform. 

---

## 🌟 About
This React application provides the user interface for the Visingsö Beekeepers platform.  
It allows members to:  
- Register and log in with JWT authentication  
- Manage apiaries and hives  
- Submit mite reports and wintering reports  
- Record honey harvests  
- Read news and view calendar events  

**Admins** have extended functionality and can:  
- Approve new users and assign admin roles  
- Add, edit, and delete news posts  
- Create and manage calendar events  
- Manage documents shared within the association  

---

## 🛠️ Tech Stack
- **Framework:** React (TypeScript)  
- **State & Routing:** React Router, Context API  
- **Styling:** SCSS, responsive design  
- **API Communication:** Axios  
- **Backend:** [ASP.NET Core Web API](../visingsobiodlarna_api) (JWT-secured, role-based access)  
- **Hosting:** Netlify  

---

## 🚀 Getting Started
Clone the repository and install dependencies:  
```bash
git clone https://github.com/Anne-Lii/visingsobiodlarna_frontend.git
cd visingsobiodlarna_frontend
npm install
npm start
