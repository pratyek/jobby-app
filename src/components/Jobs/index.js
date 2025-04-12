import {Component} from 'react'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import Cookies from 'js-cookie'
import JobCard from '../JobCard'
import JobsFilterGroup from '../JobsFilterGroup'
import Header from '../Header'
import './index.css'

const employmentTypesList = [
  {
    label: 'Full Time',
    employmentTypeId: 'FULL TIME',
  },
  {
    label: 'Part Time',
    employmentTypeId: 'PART TIME',
  },
  {
    label: 'Freelance',
    employmentTypeId: 'FREELANCE',
  },
  {
    label: 'Internship',
    employmentTypeId: 'INTERNSHIP',
  },
]

const salaryRangesList = [
  {
    salaryRangeId: '1000000',
    label: '10 LPA and above',
  },
  {
    salaryRangeId: '2000000',
    label: '20 LPA and above',
  },
  {
    salaryRangeId: '3000000',
    label: '30 LPA and above',
  },
  {
    salaryRangeId: '4000000',
    label: '40 LPA and above',
  },
]

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'INPROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class Jobs extends Component {
  state = {
    jobsList: [],
    searchInput: '',
    employmentType: [],
    salaryRange: '',
    apiStatus: apiStatusConstants.initial,
    userRole: '',
  }

  componentDidMount() {
    this.getUserRole()
    this.getJobDetails()
  }

  getUserRole = () => {
    const userRole = localStorage.getItem('userRole') || 'applicant'
    this.setState({userRole})
  }

  getJobDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})

    const {employmentType, salaryRange, searchInput} = this.state

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // First check localStorage for employer-posted jobs
      let allJobs = JSON.parse(localStorage.getItem('jobPostings')) || []

      // If no jobs in localStorage, use the static job data
      if (allJobs.length === 0) {
        // This is where the static jobs array would be defined
        // For brevity, I'm not including the full data array here
        const data = [] // Replace with your default jobs data if needed

        // If the jobs array is defined elsewhere, use it here
        allJobs = data

        // Store it in localStorage for future use if it doesn't exist yet
        localStorage.setItem('jobPostings', JSON.stringify(allJobs))
      }

      // Apply filters
      let filteredJobs = [...allJobs]

      if (employmentType.length > 0) {
        filteredJobs = filteredJobs.filter(job =>
          employmentType.some(
            type => job.employment_type.toUpperCase() === type,
          ),
        )
      }

      if (salaryRange !== '') {
        const minSalary = parseInt(salaryRange, 10) / 100000
        filteredJobs = filteredJobs.filter(job => {
          // Extract the number from strings like "10 LPA"
          const salaryMatch = job.package_per_annum.match(/(\d+)/)
          if (salaryMatch) {
            const salary = parseInt(salaryMatch[1], 10)
            return Number.isNaN(salary) ? false : salary >= minSalary
          }
          return false
        })
      }

      if (searchInput.trim() !== '') {
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(searchInput.toLowerCase()),
        )
      }

      this.setState({
        jobsList: filteredJobs,
        apiStatus: apiStatusConstants.success,
      })
    } catch (error) {
      console.error('Error fetching jobs:', error)
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  updateEmploymentType = id => {
    this.setState(prev => {
      const isSelected = prev.employmentType.includes(id)
      return {
        employmentType: isSelected
          ? prev.employmentType.filter(type => type !== id)
          : [...prev.employmentType, id],
      }
    }, this.getJobDetails)
  }

  updateSalaryRange = id => {
    this.setState({salaryRange: id}, this.getJobDetails)
  }

  updateSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onSearchClick = () => {
    this.getJobDetails()
  }

  renderLoaderView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
    </div>
  )

  renderFailureView = () => (
    <div className="jobs-failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="failure-img"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-description">
        We cannot seem to find the page you are looking for
      </p>
      <button
        type="button"
        className="retry-button"
        onClick={this.getJobDetails}
      >
        Retry
      </button>
    </div>
  )

  renderJobsList = () => {
    const {jobsList, userRole} = this.state

    if (jobsList.length === 0) {
      return (
        <div className="no-jobs-view">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
            className="no-jobs-img"
          />
          <h1 className="no-jobs-heading">No Jobs Found</h1>
          <p className="no-jobs-description">
            We could not find any jobs. Try other filters.
          </p>
        </div>
      )
    }

    return (
      <ul className="jobs-list">
        {jobsList.map(job => (
          <div key={job.id} className="job-item-container">
            <JobCard jobDetails={job} />

            {/* Show applicants section only to employers */}
            {userRole === 'employer' && (
              <div className="applicants-section">
                <h3 className="applicants-heading">Applicants:</h3>
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
            )}
          </div>
        ))}
      </ul>
    )
  }

  renderJobSection = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoaderView()
      case apiStatusConstants.success:
        return this.renderJobsList()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    const {searchInput} = this.state
    return (
      <>
        <Header />
        <div className="jobs-page-container">
          <JobsFilterGroup
            employmentTypesList={employmentTypesList}
            salaryRangesList={salaryRangesList}
            updateEmploymentType={this.updateEmploymentType}
            updateSalaryRange={this.updateSalaryRange}
          />
          <div className="jobs-content-container">
            <div className="search-bar-container">
              <input
                type="search"
                value={searchInput}
                onChange={this.updateSearchInput}
                placeholder="Search"
                className="search-input"
              />
              <button
                type="button"
                data-testid="searchButton"
                onClick={this.onSearchClick}
                className="search-button"
              >
                <BsSearch className="search-icon" />
              </button>
            </div>
            {this.renderJobSection()}
          </div>
        </div>
      </>
    )
  }
}

export default Jobs
