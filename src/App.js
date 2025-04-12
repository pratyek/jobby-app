import {Route, Switch, Redirect} from 'react-router-dom'
import LoginForm from './components/LoginForm'
import RegistrationForm from './components/RegistrationForm'
import Home from './components/Home'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import EmployerDashboard from './components/EmployerDashboard'
import Jobs from './components/Jobs'
import './App.css'

const App = () => (
  <Switch>
    <Route exact path="/login" component={LoginForm} />
    <Route exact path="/register" component={RegistrationForm} />
    <ProtectedRoute exact path="/" component={Home} />
    <ProtectedRoute exact path="/jobs" component={Jobs} />
    <ProtectedRoute
      exact
      path="/employer-dashboard"
      component={EmployerDashboard}
      requiredRole="employer"
    />
    <Route path="/not-found" component={NotFound} />
    <Redirect to="/not-found" />
  </Switch>
)

export default App
