import React from 'react';
import {Link, useHistory} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {logout} from '../../actions/auth';

const Navbar = ({auth: {isAuthenticated, loading}, logout}) => {
    const history = useHistory();
    const authLinks = (
        <ul>
            <li>
                <a onClick={() => {
                    logout();
                    history.push('/');
                }} href='#!'>
                    <i className="fas fa-sign-out-alt"/>
                    &nbsp;
                    <span className="hide-sm">Logout</span>
                </a>
            </li>
        </ul>
    );
    const guestLinks = (
        <ul>
            <li><Link to="/profiles">Developers</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
        </ul>
    );
    return (
        <nav className="navbar bg-dark">
            <h1>
                <Link to="/">
                    <i className="fas fa-code"></i> DevConnector
                </Link>
            </h1>
            {!loading &&
            <>
                {isAuthenticated ? authLinks : guestLinks}
            </>
            }
        </nav>
    );
}

Navbar.propTypes = {
    auth: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    auth: state.auth,
})

export default connect(mapStateToProps, {logout})(Navbar);
