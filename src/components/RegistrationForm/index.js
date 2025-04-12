import {Component} from 'react'
import Cookies from 'js-cookie'
import {Redirect, Link} from 'react-router-dom'

import './index.css'

class RegistrationForm extends Component {
  state = {
    username: '',
    password: '',
    role: 'applicant', // Default role
    showSubmitError: false,
    errorMsg: '',
  }

  onSubmitSuccess = (jwtToken, role) => {
    const {history} = this.props
    Cookies.set('jwt_token', jwtToken, {
      expires: 30,
      path: '/',
    })

    // Save role in localStorage
    localStorage.setItem('userRole', role)

    // Redirect based on role
    if (role === 'employer') {
      history.replace('/')
    } else {
      history.replace('/')
    }
  }

  onSubmitFailure = errorMsg => {
    this.setState({showSubmitError: true, errorMsg})
  }

  onSubmitForm = async event => {
    event.preventDefault()
    const {username, password, role} = this.state

    if (!username || !password) {
      this.onSubmitFailure('Username and password are required')
      return
    }

    try {
      console.log('Sending registration request:', {username, role})

      // Using relative URL for proxy to work
      const response = await fetch(
        'https://jobby-app-5gfg.onrender.com/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({username, password, role}),
        },
      )

      console.log('Response status:', response.status)

      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        this.onSubmitSuccess(data.token, data.role)
      } else {
        this.onSubmitFailure(data.error_msg || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      this.onSubmitFailure('Server error. Please try again.')
    }
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onChangeRole = event => {
    this.setState({role: event.target.value})
  }

  renderUsername = () => {
    const {username} = this.state

    return (
      <div className="input-container">
        <label className="label" htmlFor="username">
          USERNAME
        </label>
        <input
          type="text"
          id="username"
          placeholder="Username"
          className="user-input"
          value={username}
          onChange={this.onChangeUsername}
          required
        />
      </div>
    )
  }

  renderPassword = () => {
    const {password} = this.state

    return (
      <div className="input-container">
        <label className="label" htmlFor="password">
          PASSWORD
        </label>
        <input
          className="user-input"
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={this.onChangePassword}
          required
        />
      </div>
    )
  }

  renderRoleSelection = () => {
    const {role} = this.state

    return (
      <div className="input-container">
        <label className="label" htmlFor="role">
          I AM A
        </label>
        <select
          id="role"
          className="user-input"
          value={role}
          onChange={this.onChangeRole}
          required
        >
          <option value="applicant">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>
      </div>
    )
  }

  render() {
    const {showSubmitError, errorMsg} = this.state
    const jwtToken = Cookies.get('jwt_token')

    if (jwtToken !== undefined) {
      const role = localStorage.getItem('userRole')
      if (role === 'employer') {
        return <Redirect to="/employer-dashboard" />
      }
      return <Redirect to="/" />
    }

    return (
      <div className="jobby-app-container">
        <div className="card-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
            alt="website logo"
            className="website-logo"
          />
          <h1 className="form-heading">Create an Account</h1>
          <form className="form-container" onSubmit={this.onSubmitForm}>
            {this.renderUsername()}
            {this.renderPassword()}
            {this.renderRoleSelection()}
            <button className="register-button" type="submit">
              Register
            </button>
            {showSubmitError && <p className="error-msg">*{errorMsg}</p>}
          </form>
          <p className="login-text">
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    )
  }
}

export default RegistrationForm
