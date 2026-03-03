import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import Home from "./pages/Home";
import Session from "./pages/Session";

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session" element={<Session />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;