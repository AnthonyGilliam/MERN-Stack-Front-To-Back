import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
// Redux
import {Provider} from 'react-redux';
import store from './store';

import './App.css';

const App = () => (

    <Provider store={store}>
        <Router>
            <Navbar/>
            <Route exact path="/" component={Landing}/>
            <main className="container">
                <Alert />
                {/*7:39 - **A <Switch/> element can only contain <Route/>s any other element or provider (i.e. Redux)
                must be placed outside of the <Switch/> statement*/}
                <Switch>
                    <Route exact path="/register" component={Register}/>
                    <Route exact path="/login" component={Login}/>
                </Switch>
            </main>
        </Router>
    </Provider>
);

export default App;
