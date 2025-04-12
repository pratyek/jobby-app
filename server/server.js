const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS headers - manually setting headers for all routes
app.use((req, res, next) => {
  // Allow requests from any origin during development
  res.header('Access-Control-Allow-Origin', 'https://jobby-app-teal.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// MongoDB Connection
mongoose.connect('mongodb+srv://pratyekpk3:pratyek@cluster0.7hlp9.mongodb.net/jobby-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// User Model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employer', 'applicant'],
    default: 'applicant'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', UserSchema);

// Job Model
const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company_logo_url: {
    type: String,
    default: 'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png'
  },
  location: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  employment_type: {
    type: String,
    required: true,
    enum: ['Full Time', 'Part Time', 'Freelance', 'Internship']
  },
  package_per_annum: {
    type: String,
    required: true
  },
  job_description: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  applicants: [{
    username: {
      type: String,
      required: true
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Job = mongoose.model('Job', JobSchema);

// Auth Middleware
const protect = async (req, res, next) => {
  let token;
  
  if (req.cookies.jwt_token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))) {
    token = req.cookies.jwt_token || req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error_msg: 'Not authorized to access this route'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Extract user info from token
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error_msg: 'Not authorized to access this route'
    });
  }
};

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { username, password, role } = req.body;
    
    // Check if all required fields are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error_msg: 'Please provide username and password'
      });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error_msg: 'Username already taken'
      });
    }
    
    // Create user
    const user = await User.create({
      username,
      password,
      role: role || 'applicant'
    });
    
    // Create token with username included
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    // Send token in cookie
    res.cookie('jwt_token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'None',  // Important for cross-site cookies
      secure: false      // Set to true in production with HTTPS
    });
    
    console.log('User registered successfully:', user.username);
    res.status(201).json({
      success: true,
      token,
      role: user.role,
      username: user.username
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;
    
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error_msg: 'Please provide username and password'
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        error_msg: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error_msg: 'Invalid credentials'
      });
    }
    
    // Create token with username included
    const token = jwt.sign(
      { 
        id: user._id,
        username: user.username,
        role: user.role
      }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );
    
    // Send token in cookie
    res.cookie('jwt_token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: 'None',  // Important for cross-site cookies
      secure: false      // Set to true in production with HTTPS
    });
    
    console.log('User logged in successfully:', user.username);
    res.status(200).json({
      success: true,
      token,
      role: user.role,
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Get current user
app.get('/api/auth/me', protect, async (req, res) => {
  try {
    // User info is already in req.user from the protect middleware
    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Logout Route
app.get('/api/auth/logout', (req, res) => {
  res.cookie('jwt_token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get all jobs (filtered)
app.get('/api/jobs', async (req, res) => {
  try {
    const { 
      search = '', 
      location = '', 
      employmentType = '', 
      minPackage = '' 
    } = req.query;
    
    // Build the filter object
    const filter = {};
    
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (employmentType) {
      // Handle multiple employment types (comma separated)
      const types = employmentType.split(',');
      filter.employment_type = { $in: types };
    }
    
    if (minPackage) {
      // Handle package filtering (assuming format is "XX LPA")
      // Note: This is a simplified approach, would be better to store as a number in the DB
      filter.package_per_annum = { $regex: new RegExp(`\\d{${minPackage.length},}\\s*LPA`) };
    }
    
    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Get a specific job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error_msg: 'Job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Create a job (employer only)
app.post('/api/jobs', protect, async (req, res) => {
  try {
    // Check if user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error_msg: 'Only employers can post jobs'
      });
    }

    const {
      title,
      company_logo_url,
      location,
      rating,
      employment_type,
      package_per_annum,
      job_description
    } = req.body;
    
    // Validate required fields
    if (!title || !location || !rating || !employment_type || !package_per_annum || !job_description) {
      return res.status(400).json({
        success: false,
        error_msg: 'Please provide all required fields'
      });
    }

    // Create job with current username as creator
    const job = await Job.create({
      title,
      company_logo_url: company_logo_url || 'https://assets.ccbp.in/frontend/react-js/jobby-app/netflix-img.png',
      location,
      rating,
      employment_type,
      package_per_annum,
      job_description,
      createdBy: req.user.username,
      applicants: []
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Update a job (employer only)
app.put('/api/jobs/:id', protect, async (req, res) => {
  try {
    // Check if user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error_msg: 'Only employers can update jobs'
      });
    }
    
    // Find job
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error_msg: 'Job not found'
      });
    }
    
    // Check if the job was created by this employer
    if (job.createdBy !== req.user.username) {
      return res.status(403).json({
        success: false,
        error_msg: 'You can only update jobs that you created'
      });
    }
    
    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Delete a job (employer only)
app.delete('/api/jobs/:id', protect, async (req, res) => {
  try {
    // Check if user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error_msg: 'Only employers can delete jobs'
      });
    }
    
    // Find job
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error_msg: 'Job not found'
      });
    }
    
    // Check if the job was created by this employer
    if (job.createdBy !== req.user.username) {
      return res.status(403).json({
        success: false,
        error_msg: 'You can only delete jobs that you created'
      });
    }
    
    // Delete the job
    await job.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Apply for a job (applicant only)
app.post('/api/jobs/:id/apply', protect, async (req, res) => {
  try {
    // Check if user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        error_msg: 'Only applicants can apply for jobs'
      });
    }
    
    const username = req.user.username;
    const jobId = req.params.id;
    
    // Find the job
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error_msg: 'Job not found'
      });
    }
    
    // Check if already applied
    const alreadyApplied = job.applicants.some(applicant => applicant.username === username);
    
    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        error_msg: 'You have already applied for this job'
      });
    }
    
    // Add applicant to job with timestamps
    job.applicants.push({
      username,
      appliedDate: new Date(),
      status: 'pending'
    });
    
    await job.save();
    
    res.status(200).json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Get employer's job postings
app.get('/api/employer/jobs', protect, async (req, res) => {
  try {
    // Check if user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error_msg: 'Only employers can access their job postings'
      });
    }
    
    // Get jobs created by this employer
    const jobs = await Job.find({ createdBy: req.user.username }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Update application status (employer only)
app.put('/api/jobs/:id/applications/:username', protect, async (req, res) => {
  try {
    // Check if user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        error_msg: 'Only employers can update application status'
      });
    }
    
    const { status } = req.body;
    
    // Validate status
    if (!status || !['pending', 'reviewed', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error_msg: 'Invalid status value'
      });
    }
    
    // Find job
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error_msg: 'Job not found'
      });
    }
    
    // Check if the job was created by this employer
    if (job.createdBy !== req.user.username) {
      return res.status(403).json({
        success: false,
        error_msg: 'You can only update applications for jobs that you created'
      });
    }
    
    // Find and update the application
    const applicantIndex = job.applicants.findIndex(a => a.username === req.params.username);
    
    if (applicantIndex === -1) {
      return res.status(404).json({
        success: false,
        error_msg: 'Application not found'
      });
    }
    
    // Update the status
    job.applicants[applicantIndex].status = status;
    await job.save();
    
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: job.applicants[applicantIndex]
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Get applicant's applied jobs
app.get('/api/applicant/jobs', protect, async (req, res) => {
  try {
    // Check if user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        error_msg: 'Only applicants can access their applied jobs'
      });
    }
    
    // Find jobs where this user has applied
    const appliedJobs = await Job.find({
      'applicants.username': req.user.username
    }).sort({ createdAt: -1 });
    
    // Format the response to include application status
    const formattedJobs = appliedJobs.map(job => {
      const application = job.applicants.find(a => a.username === req.user.username);
      return {
        _id: job._id,
        title: job.title,
        company_logo_url: job.company_logo_url,
        location: job.location,
        employment_type: job.employment_type,
        package_per_annum: job.package_per_annum,
        rating: job.rating,
        createdBy: job.createdBy,
        applicationStatus: application ? application.status : 'pending',
        appliedDate: application ? application.appliedDate : null
      };
    });
    
    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      data: formattedJobs
    });
  } catch (error) {
    console.error('Get applied jobs error:', error);
    res.status(500).json({
      success: false,
      error_msg: 'Server error'
    });
  }
});

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Jobby API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});