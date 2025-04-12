import { Component } from 'react'
import Cookies from 'js-cookie'
import { Redirect } from 'react-router-dom'
import {v4 as uuidv4} from 'uuid'
import Loader from 'react-loader-spinner'
import {AiFillStar, AiFillDelete} from 'react-icons/ai'
import {GoLocation} from 'react-icons/go'
import {BsBriefcaseFill} from 'react-icons/bs'

import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'INPROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class EmployerDashboard extends Component {
  state = {
    jobPostings: [],
    newJob: {
      title: '',
      company_logo_url: 'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
      location: '',
      rating: 4,
      employment_type: 'Full Time',
      package_per_annum: '',
      job_description: '',
    },
    apiStatus: apiStatusConstants.initial,
    formError: '',
    formSuccess: '',
  }

  componentDidMount() {
    this.getEmployerJobs()
  }

  getEmployerJobs = () => {
    this.setState({
      apiStatus: apiStatusConstants.inProgress,
    })
    
    try {
      // In a real app, you would fetch from the API
      // For now, we'll use localStorage as a mock database
      const allJobs = JSON.parse(localStorage.getItem('jobPostings')) || []
      const username = localStorage.getItem('username') || ''
      
      // Filter to get employer's jobs
      const employerJobs = allJobs.filter(job => job.createdBy === username)
      
      this.setState({
        jobPostings: employerJobs,
        apiStatus: apiStatusConstants.success,
      })
    } catch (error) {
      console.error('Error fetching employer jobs:', error)
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  handleInputChange = (e) => {
    const { name, value } = e.target
    this.setState(prevState => ({
      newJob: {
        ...prevState.newJob,
        [name]: value
      }
    }))
  }

  handleJobSubmit = (e) => {
    e.preventDefault()
    
    const { newJob } = this.state
    const { title, location, package_per_annum, job_description } = newJob
    
    // Basic validation
    if (!title || !location || !package_per_annum || !job_description) {
      this.setState({ formError: 'All fields are required', formSuccess: '' })
      return
    }
    
    // Check package format
    if (!/^\d+\s*LPA$/.test(package_per_annum)) {
      this.setState({ formError: 'Package must be in format "XX LPA"', formSuccess: '' })
      return
    }
    
    try {
      // Create new job with ID and creator info
      const username = localStorage.getItem('username') || 'employer'
      const newJobWithId = {
        ...newJob,
        id: uuidv4(),
        createdBy: username,
        applicants: []
      }
      
      // Save to localStorage
      const allJobs = JSON.parse(localStorage.getItem('jobPostings')) || []
      const updatedJobs = [...allJobs, newJobWithId]
      localStorage.setItem('jobPostings', JSON.stringify(updatedJobs))
      
      // Update state
      this.setState(prevState => ({
        jobPostings: [...prevState.jobPostings, newJobWithId],
        newJob: {
          title: '',
          company_logo_url: 'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
          location: '',
          rating: 4,
          employment_type: 'Full Time',
          package_per_annum: '',
          job_description: '',
        },
        formError: '',
        formSuccess: 'Job posted successfully!'
      }))
    } catch (error) {
      console.error('Error adding job:', error)
      this.setState({ formError: 'Failed to post job', formSuccess: '' })
    }
  }

  handleDeleteJob = (jobId) => {
    try {
      // Remove job from localStorage
      const allJobs = JSON.parse(localStorage.getItem('jobPostings')) || []
      const updatedJobs = allJobs.filter(job => job.id !== jobId)
      localStorage.setItem('jobPostings', JSON.stringify(updatedJobs))
      
      // Update state
      this.setState(prevState => ({
        jobPostings: prevState.jobPostings.filter(job => job.id !== jobId),
        formSuccess: 'Job deleted successfully!',
        formError: ''
      }))
    } catch (error) {
      console.error('Error deleting job:', error)
      this.setState({ formError: 'Failed to delete job', formSuccess: '' })
    }
  }

  renderJobForm = () => {
    const { newJob, formError, formSuccess } = this.state
    
    return (
      <div className="job-form-container">
        <h2 className="form-heading">Post a New Job</h2>
        
        {formError && <p className="form-error">{formError}</p>}
        {formSuccess && <p className="form-success">{formSuccess}</p>}
        
        <form onSubmit={this.handleJobSubmit} className="job-form">
          <div className="form-field">
            <label htmlFor="title" className="form-label">Job Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newJob.title}
              onChange={this.handleInputChange}
              className="form-input"
              placeholder="e.g. Frontend Developer"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="company_logo_url" className="form-label">Company Logo URL</label>
            <input
              type="text"
              id="company_logo_url"
              name="company_logo_url"
              value={newJob.company_logo_url}
              onChange={this.handleInputChange}
              className="form-input"
              placeholder="URL to company logo"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={newJob.location}
              onChange={this.handleInputChange}
              className="form-input"
              placeholder="e.g. Bangalore"
            />
          </div>
          
          <div className="form-row">
            <div className="form-field half-width">
              <label htmlFor="employment_type" className="form-label">Employment Type</label>
              <select
                id="employment_type"
                name="employment_type"
                value={newJob.employment_type}
                onChange={this.handleInputChange}
                className="form-select"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            
            <div className="form-field half-width">
              <label htmlFor="rating" className="form-label">Rating</label>
              <select
                id="rating"
                name="rating"
                value={newJob.rating}
                onChange={this.handleInputChange}
                className="form-select"
              >
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>
          
          <div className="form-field">
            <label htmlFor="package_per_annum" className="form-label">Package (e.g. 10 LPA)</label>
            <input
              type="text"
              id="package_per_annum"
              name="package_per_annum"
              value={newJob.package_per_annum}
              onChange={this.handleInputChange}
              className="form-input"
              placeholder="e.g. 12 LPA"
            />
          </div>
          
          <div className="form-field">
            <label htmlFor="job_description" className="form-label">Job Description</label>
            <textarea
              id="job_description"
              name="job_description"
              value={newJob.job_description}
              onChange={this.handleInputChange}
              className="form-textarea"
              placeholder="Describe the job responsibilities, requirements, etc."
              rows="5"
            />
          </div>
          
          <button type="submit" className="post-job-button">
            Post Job
          </button>
        </form>
      </div>
    )
  }

  renderJobCards = () => {
    const { jobPostings } = this.state
    
    if (jobPostings.length === 0) {
      return (
        <div className="no-jobs-container">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
            className="no-jobs-image"
          />
          <h2 className="no-jobs-heading">You haven't posted any jobs yet</h2>
          <p className="no-jobs-text">Create your first job posting above!</p>
        </div>
      )
    }
    
    return (
      <ul className="employer-jobs-list">
        {jobPostings.map(job => (
          <li key={job.id} className="employer-job-item">
            <div className="job-card">
              <div className="job-header">
                <div className="logo-title-container">
                  <img
                    src={job.company_logo_url}
                    alt="company logo"
                    className="company-logo"
                  />
                  <div className="title-rating-container">
                    <h2 className="job-title">{job.title}</h2>
                    <div className="rating-container">
                      <AiFillStar className="star-icon" />
                      <p className="rating">{job.rating}</p>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => this.handleDeleteJob(job.id)}
                  aria-label="Delete job"
                >
                  <AiFillDelete className="delete-icon" />
                </button>
              </div>
              
              <div className="job-details">
                <div className="location-type-container">
                  <div className="detail-item">
                    <GoLocation className="detail-icon" />
                    <p className="detail-text">{job.location}</p>
                  </div>
                  <div className="detail-item">
                    <BsBriefcaseFill className="detail-icon" />
                    <p className="detail-text">{job.employment_type}</p>
                  </div>
                </div>
                <p className="job-package">{job.package_per_annum}</p>
              </div>
              
              <hr className="job-divider" />
              
              <div className="job-description-container">
                <h3 className="section-heading">Description</h3>
                <p className="job-description">{job.job_description}</p>
              </div>
              
              <div className="applicants-section">
                <h3 className="section-heading">Applicants</h3>
                {job.applicants && job.applicants.length > 0 ? (
                  <ul className="applicants-list">
                    {job.applicants.map(applicant => (
                      <li key={applicant} className="applicant-item">
                        <div className="applicant-info">
                          <div className="applicant-avatar">{applicant.charAt(0).toUpperCase()}</div>
                          <p className="applicant-name">{applicant}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-applicants">No applications yet</p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="failure-image"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-text">
        We cannot seem to find the page you are looking for.
      </p>
      <button
        type="button"
        className="retry-button"
        onClick={this.getEmployerJobs}
      >
        Retry
      </button>
    </div>
  )

  renderDashboardContent = () => {
    const { apiStatus } = this.state
    
    switch (apiStatus) {
      case apiStatusConstants.success:
        return (
          <>
            {this.renderJobForm()}
            <h2 className="posted-jobs-heading">Your Posted Jobs</h2>
            {this.renderJobCards()}
          </>
        )
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    const jwtToken = Cookies.get('jwt_token')
    const userRole = localStorage.getItem('userRole')
    
    if (jwtToken === undefined) {
      return <Redirect to="/login" />
    }
    
    if (userRole !== 'employer') {
      return <Redirect to="/" />
    }
    
    return (
      <>
        <Header />
        <div className="employer-dashboard-container">
          <h1 className="dashboard-heading">Employer Dashboard</h1>
          {this.renderDashboardContent()}
        </div>
      </>
    )
  }
}

export default EmployerDashboard