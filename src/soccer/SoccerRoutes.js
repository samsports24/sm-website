import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Squad from './pages/Squad';
import Lineup from './pages/Lineup';
import Transfers from './pages/Transfers';
import Draft from './pages/Draft';
import Trades from './pages/Trades';
import League from './pages/League';
import Chat from './pages/Chat';
import Commissioner from './pages/Commissioner';
import Profile from './pages/Profile';
import Loans from './pages/Loans';
import Exchange from './pages/Exchange';
import Governance from './pages/Governance';
import Predictor from './pages/Predictor';
import CLFantasy from './pages/CLFantasy';

const SoccerRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/squad" element={<Squad />} />
      <Route path="/lineup" element={<Lineup />} />
      <Route path="/transfers" element={<Transfers />} />
      <Route path="/draft" element={<Draft />} />
      <Route path="/trades" element={<Trades />} />
      <Route path="/loans" element={<Loans />} />
      <Route path="/exchange" element={<Exchange />} />
      <Route path="/governance" element={<Governance />} />
      <Route path="/league" element={<League />} />
      <Route path="/predictor" element={<Predictor />} />
      <Route path="/cl-fantasy" element={<CLFantasy />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/commissioner" element={<Commissioner />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={<Dashboard />} />
    </Routes>
  );
};

export default SoccerRoutes;
