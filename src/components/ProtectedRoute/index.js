import {Redirect, Route} from 'react-router-dom'
import Cookies from 'js-cookie'

const ProtectedRoute = props => {
  const {role, ...rest} = props
  const token = Cookies.get('jwt_token')
  
  // If no token, redirect to login
  if (token === undefined) {
    return <Redirect to="/login" />
  }
  
  // If route requires specific role, check if user has that role
  if (role) {
    const userRole = localStorage.getItem('userRole')
    if (userRole !== role) {
      return <Redirect to="/" />
    }
  }
  
  return <Route {...rest} />
}

export default ProtectedRoute