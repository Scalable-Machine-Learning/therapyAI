import React from 'react'
import { UserAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom'

function PrivateRoute({children}) {
    const {session} = UserAuth();

    if (session === undefined) {
        return <Navigate to="/signin" />
    }

    return <>{session ? <>{children}</> : <Navigate to="/signup"/>}</>
}
export default PrivateRoute;
