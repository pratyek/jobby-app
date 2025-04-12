import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {AiFillStar} from 'react-icons/ai'
import {HiLocationMarker, HiMail} from 'react-icons/hi'
import Cookies from 'js-cookie'

const JobCard = props => {
  const {jobDetails} = props
  const {
    id,
    title,
    rating,
    company_logo_url,
    location,
    employment_type,
    package_per_annum,
    job_description,
  } = jobDetails

  const [isApplied, setIsApplied] = useState(false)

  useEffect(() => {
    // Check if user has already applied for this job
    const applications = JSON.parse(localStorage.getItem('applications')) || []
    const username = localStorage.getItem('username')
    const hasApplied = applications.some(
      app => app.jobId === id && app.username === username
    )
    setIsApplied(hasApplied)
  }, [id])

  const handleApply = async (event) => {
    event.stopPropagation() // Prevent link navigation

    const jwtToken = Cookies.get('jwt_token')
    if (!jwtToken) {
      alert('Please log in to apply for jobs')
      return
    }

    try {
      // In a real implementation, we would call an API endpoint
      // For now, we'll simulate it with localStorage
      const username = localStorage.getItem('username')
      if (!username) {
        alert('User information not found. Please log in again.')
        return
      }

      // Create application object
      const application = {
        jobId: id,
        username,
        appliedDate: new Date().toISOString(),
      }

      // Save to localStorage
      const applications = JSON.parse(localStorage.getItem('applications')) || []
      applications.push(application)
      localStorage.setItem('applications', JSON.stringify(applications))

      // Update job's applicants list
      const jobs = JSON.parse(localStorage.getItem('jobPostings')) || []
      const jobIndex = jobs.findIndex(job => job.id === id)
      
      if (jobIndex !== -1) {
        if (!jobs[jobIndex].applicants) {
          jobs[jobIndex].applicants = []
        }
        jobs[jobIndex].applicants.push(username)
        localStorage.setItem('jobPostings', JSON.stringify(jobs))
      }

      setIsApplied(true)
    } catch (error) {
      console.error('Error applying for job:', error)
      alert('Failed to apply for job. Please try again.')
    }
  }

  return (
    <li className="job-list-items">
      <Link to={`/jobs/${id}`} className="job-card-link">
        <div className="company-container">
          <div>
            <img
              src={company_logo_url}
              alt="company logo"
              className="logo-url"
            />
          </div>
          <div>
            <h1 className="company-title">{title}</h1>
            <div className="star-icon-container">
              <AiFillStar className="star-icon" />
              <p className="rating-count">{rating}</p>
            </div>
          </div>
        </div>

        <div className="location-container-flex-content">
          <div className="location-desc">
            <div className="star-icon-container">
              <HiLocationMarker className="location-icon" />
              <p className="location-desc description">{location}</p>
            </div>
            <div className="star-icon-container">
              <HiMail className="location-icon left-icon" />
              <p className="emp-type description">{employment_type}</p>
            </div>
          </div>
          <div className="star-icon-container">
            <p className="package-desc description">{package_per_annum}</p>
          </div>
        </div>

        <hr className="line" />
        <h1 className="desc-heading">Description</h1>
        <p className="job-description">{job_description}</p>
      </Link>

      {/* Apply button is outside the Link to prevent navigation on click */}
      <button
        type="button"
        className={`apply-button ${isApplied ? 'applied' : ''}`}
        onClick={handleApply}
        disabled={isApplied}
      >
        {isApplied ? 'Applied ✅' : 'Apply Now'}
      </button>
    </li>
  )
}

export default JobCard