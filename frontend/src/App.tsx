import Signup from "./pages/Signup.tsx";
import LandingPage from "./pages/LandingPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./pages/Signin.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import CreateBot from "./pages/CreateBot.tsx";
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage></LandingPage>}></Route>
          <Route path="/signup" element={<Signup></Signup>}></Route>
          <Route path="/signin" element={<Signin></Signin>}></Route>
          <Route path="/dashboard" element={<Dashboard></Dashboard>}></Route>
          <Route path="/user/createbot" element={<CreateBot></CreateBot>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
