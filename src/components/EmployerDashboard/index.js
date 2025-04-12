import React, {useState, useEffect} from 'react'
import {v4 as uuidv4} from 'uuid'
import Header from '../Header'
import './index.css'

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    companyLogoUrl:
      'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
    location: '',
    rating: 4,
    employmentType: 'Full Time',
    packagePerAnnum: '',
    jobDescription: '',
  })

  useEffect(() => {
    // Load jobs from localStorage
    const storedJobs = JSON.parse(localStorage.getItem('jobPostings')) || []
    setJobs(storedJobs)

    // Load applications from localStorage
    const storedApplications =
      JSON.parse(localStorage.getItem('applications')) || []
    setApplications(storedApplications)
  }, [])

  const handleInputChange = e => {
    const {name, value} = e.target
    setFormData(prev => ({...prev, [name]: value}))
  }

  const handleSubmit = e => {
    e.preventDefault()

    // Validate form
    if (
      !formData.title ||
      !formData.location ||
      !formData.packagePerAnnum ||
      !formData.jobDescription
    ) {
      alert('Please fill in all required fields')
      return
    }

    // Format package correctly (ensure it ends with LPA)
    let packageValue = formData.packagePerAnnum
    if (!packageValue.includes('LPA')) {
      packageValue = `${packageValue} LPA`
    }

    // Create new job with proper format matching existing jobs
    const newJob = {
      id: uuidv4(),
      title: formData.title,
      company_logo_url: formData.companyLogoUrl,
      location: formData.location,
      rating: formData.rating,
      employment_type: formData.employmentType,
      package_per_annum: packageValue,
      job_description: formData.jobDescription,
      applicants: [],
    }

    // Add to state and localStorage
    const updatedJobs = [...jobs, newJob]
    setJobs(updatedJobs)
    localStorage.setItem('jobPostings', JSON.stringify(updatedJobs))

    // Reset form
    setFormData({
      title: '',
      companyLogoUrl:
        'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
      location: '',
      rating: 4,
      employmentType: 'Full Time',
      packagePerAnnum: '',
      jobDescription: '',
    })

    alert('Job posted successfully!')
  }

  const deleteJob = jobId => {
    // Remove job
    const updatedJobs = jobs.filter(job => job.id !== jobId)
    setJobs(updatedJobs)
    localStorage.setItem('jobPostings', JSON.stringify(updatedJobs))

    // Also remove any applications for this job
    const updatedApplications = applications.filter(app => app.jobId !== jobId)
    setApplications(updatedApplications)
    localStorage.setItem('applications', JSON.stringify(updatedApplications))
  }

  return (
    <>
      <Header />
      <div className="employer-dashboard-container">
        <h1 className="dashboard-heading">Employer Dashboard</h1>

        <div className="post-job-section">
          <h2>Post a New Job</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Job Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Bangalore"
              />
            </div>

            <div className="form-group">
              <label htmlFor="employmentType">Employment Type</label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="packagePerAnnum">Package (LPA)</label>
              <input
                type="text"
                id="packagePerAnnum"
                name="packagePerAnnum"
                value={formData.packagePerAnnum}
                onChange={handleInputChange}
                placeholder="e.g. 12 LPA"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobDescription">Job Description</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Describe the job responsibilities and requirements"
                rows="5"
              />
            </div>

            <button type="submit" className="post-button">
              Post Job
            </button>
          </form>
        </div>

        <div className="jobs-list-section">
          <h2>Your Posted Jobs</h2>

          {jobs.length === 0 ? (
            <p className="no-jobs-message">You haven't posted any jobs yet.</p>
          ) : (
            <ul className="employer-jobs-list">
              {jobs.map(job => (
                <li key={job.id} className="employer-job-item">
                  <div className="job-header">
                    <h3>{job.title}</h3>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteJob(job.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p>
                    <strong>Type:</strong> {job.employment_type}
                  </p>
                  <p>
                    <strong>Package:</strong> {job.package_per_annum}
                  </p>
                  <p>
                    <strong>Description:</strong> {job.job_description}
                  </p>

                  <div className="job-applicants">
                    <h4>Applicants:</h4>
                    {job.applicants && job.applicants.length > 0 ? (
                      <ul className="applicants-list">
                        {job.applicants.map(applicant => (
                          <li key={applicant} className="applicant-item">
                            {applicant}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-applicants">No applications yet</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

export default EmployerDashboard
