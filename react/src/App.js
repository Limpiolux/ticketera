import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Inicio from './pages/Inicio'; // Importa la página de inicio que creaste
import HeroInitial from './components/HeroInitial';
import AutoLogout from './components/AutoLogout';
import Usuarios from "./pages/Usuarios"
import Footer from './components/Footer';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
      <AutoLogout logoutAfterMinutes={15} />
        <Switch>
          <Route exact path="/">
            {localStorage.getItem('token') ? (
              <Redirect to="/inicio" />
            ) : (
              <>
                <Home />
              </>
            )}
          </Route>
          <Route path="/inicio">
            {localStorage.getItem('token') ? (
              <Inicio />
            ) : (
              <Redirect to="/" />
              // O mostrar un mensaje o componente de inicio de sesión aquí
            )}
          </Route>
          <Route path="/usuarios">
            {localStorage.getItem('token') ? (
              <Usuarios />
            ) : (
              <Redirect to="/" />
              // O mostrar un mensaje o componente de inicio de sesión aquí
            )}
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
