import React, {useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import setAuthToken from "./utils/setAuthToken";
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Alert from './components/layout/Alert';
// Redux
import {Provider} from 'react-redux';
import store from './store';
import {loadUser} from "./actions/auth";

import './App.css';

if (localStorage.token) {
    setAuthToken(localStorage.token);
}

const App = () => {
    // 8:41 - Use the useEffect() hook to execute lifecycle methods in react
    //  Pass a function into useEffect() to execute once the component loads
    useEffect(() => {
       // 8:41 - Thunk Actions can be dispatched right from the store object if it is imported into a file
       //  The action dispatched from the store object MUST be called explicitly, using (), in order to access the
        // thunk action function returned
       store.dispatch(loadUser());
    // 8:41 - Pass an empty array as a second parameter (dependencies) into useEffect to make it only run ONCE upon load
    }, []);

    return (
        <Provider store={store}>
            <Router>
                <Navbar/>
                <Route exact path="/" component={Landing}/>
                <main className="container">
                    <Alert/>
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
}

    export default App;
