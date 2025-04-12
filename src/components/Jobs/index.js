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
        const data =[
          {
              "id": "bb95e51b-b1b2-4d97-bee4-1d5ec2b96751",
              "title": "Devops Engineer",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png",
              "location": "Delhi",
              "job_description": "We are looking for a DevOps Engineer with a minimum of 5 years of industry experience, preferably working in the financial IT community. The position in the team is focused on delivering exceptional services to both BU and Dev partners to minimize/avoid any production outages. The role will focus on production support.",
              "employment_type": "Internship",
              "package_per_annum": "10 LPA"
          },
          {
              "id": "d6019453-f864-4a2f-8230-6a9642a59466",
              "title": "Backend Engineer",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/facebook-img.png",
              "location": "Bangalore",
              "job_description": "We’re in search of a Back-End Software Engineer that specializes in server-side components. In this role, you’ll primarily work in NodeJs, SQL Lite, Python, AWS and GO and will bring a depth of knowledge on basic algorithms and data structures. As a Back-End Engineer, you might be architecting new features for our customers.",
              "employment_type": "Full Time",
              "package_per_annum": "21 LPA"
          },
          {
              "id": "1e47d355-4000-4c27-a17a-ae55dd6df27d",
              "title": "Fullstack Developer",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/google-img.png",
              "location": "Hyderabad",
              "job_description": "Google is and always will be an engineering company. We hire people with a broad set of technical skills who are ready to take on some of technology's greatest challenges and make an impact on millions, if not billions, of users. Google engineers are changing the world one technological achievement after another.",
              "employment_type": "Internship",
              "package_per_annum": "10 LPA"
          },
          {
              "id": "10c539a8-97f3-4277-90c1-b83a32c11ba1",
              "title": "Data Scientist",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/facebook-img.png",
              "location": "Chennai",
              "job_description": "Facebooks’s Data Science team leverages big data to empower business decisions. The Data Science team at Facebook works in close partnership with the trusted engineering, content moderator, and product teams to identify opportunities to develop and enhance Facebook user experiences. ",
              "employment_type": "Internship",
              "package_per_annum": "12 LPA"
          },
          {
              "id": "ad104b3b-e2a4-42f0-b78b-2b4b4699cffb",
              "title": "Data Scientist",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/google-img.png",
              "location": "Hyderabad",
              "job_description": "As a Data Scientist, you will evaluate and improve Google's products. You'll collaborate with a multi-disciplinary team of Engineers and Analysts on a wide range of problems, bringing analytical rigor and statistical methods to the challenges of measuring quality, improving consumer products, and understanding the behavior of end-users.",
              "employment_type": "Internship",
              "package_per_annum": "13 LPA"
          },
          {
              "id": "7a17c601-9ecf-4a4f-b289-afa808ab1710",
              "title": "Devops Engineer",
              "rating": 5,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/zomato-img.png",
              "location": "Mumbai",
              "job_description": "As a DevOps Engineer, you will play a key role in bringing important software to market and into widespread use. In this role, you will integrate a variety of leading-edge technology stacks securely, and ensure the availability and safety of the production systems at scale.",
              "employment_type": "Internship",
              "package_per_annum": "12 LPA"
          },
          {
              "id": "54462d29-6d8c-4b27-9a59-e0fbdbd4de0f",
              "title": "Devops Engineer",
              "rating": 5,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/swiggy-img.png",
              "location": "Mumbai",
              "job_description": "As DevOps Developer, you are responsible for implementing next-generation CI/CD systems and automation solutions. If you thrive in a dynamic, collaborative workplace, we provide an environment where you will be challenged and inspired every single day. And if you relish the freedom to bring creative, thoughtful solutions to the table, there's no limit to what you can do.",
              "employment_type": "Full Time",
              "package_per_annum": "17 LPA"
          },
          {
              "id": "5ecd5a9b-4805-4924-8f26-551302326b27",
              "title": "ML Engineer",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/amazon-img.png",
              "location": "Bangalore",
              "job_description": "We’re looking for a scientist who can define the next generation of FMA ML-based ranking, pricing, and econometric models to further improve customer experience and customer trust on Amazon. This scientist will work with tech and business teams within and outside of FMA to think outside the box and design innovative solutions.",
              "employment_type": "Internship",
              "package_per_annum": "12 LPA"
          },
          {
              "id": "2b40029d-e5a5-48cc-84a6-b6e12d25625d",
              "title": "Frontend Engineer",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png",
              "location": "Delhi",
              "job_description": "The Experimentation Platform team builds internal tools with a big impact across the company. We are looking to add a UI engineer to our team to continue to improve our experiment analysis workflow and tools. Ideal candidates will be excited by direct contact with our users, fast feedback, and quick iteration.",
              "employment_type": "Freelance",
              "package_per_annum": "19 LPA"
          },
          {
              "id": "62b19914-67fc-49aa-b10e-35b2e69fbedd",
              "title": "Frontend Engineer",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/facebook-img.png",
              "location": "Mumbai",
              "job_description": "Are you interested in building products used by more than a billion people? Do you like shipping codes at a rapid pace? Facebook is seeking an experienced Front End Engineer that is passionate about building mobile and desktop web applications. Together, we can help people build stronger communities.",
              "employment_type": "Freelance",
              "package_per_annum": "28 LPA"
          },
          {
              "id": "5a75b254-a812-4c2d-ae26-ec9e04234bf7",
              "title": "Devops Engineer",
              "rating": 4,
              "company_logo_url": "https://assets.ccbp.in/frontend/react-js/jobby-app/flipkart-img.png",
              "location": "Bangalore",
              "job_description": "The Security Operations team is seeking a new team member to assist with a large-scale Data Center Migration and application integration. This team supports customer service and several corporate functions (HR/Legal/Compliance), primarily with PayPal’s global partners that use Citrix and third-party platforms. ",
              "employment_type": "Part Time",
              "package_per_annum": "38 LPA"
          }];
           // Replace with your default jobs data if needed

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
