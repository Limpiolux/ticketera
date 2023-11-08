import React from 'react';
import NavbarDashboard from '../components/Dashboard/Navbar';
import Tickets from '../components/Dashboard/Tickets';
import Footer from '../components/Footer';

function Inicio() {


  return (
    <div>
      <NavbarDashboard />
      <Tickets />
    </div>
  );
}

export default Inicio;
