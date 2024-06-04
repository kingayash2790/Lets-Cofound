// server.js (or index.js)
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Custom authentication middleware

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(express.json());
app.use(cors()); // Use the cors middleware
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection using MongoDB Atlas connection string
const mongoURI = "mongodb+srv://Hephzibah:Hephzibah@cluster0.qs9ylec.mongodb.net/cofound"; // Replace 'your_mongodb_atlas_connection_string' with your actual MongoDB Atlas connection string
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Secret key (this should be stored securely and not hard-coded in real applications)
const secretKey = 'your_secret_key';


// User schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Mock data for storing OTPs temporarily
let otpData;

// POST endpoint to send OTP
app.post('/sendOTP', (req, res) => {
  console.log("hello");
    const { email } = req.body;
    if (email) {
        const randomOTP = Math.floor(1000 + Math.random() * 9000);
        console.log('Generated OTP:', randomOTP);

        // Configure nodemailer with your email service
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hephzibahranjan@gmail.com', // Replace with your email address
                pass: 'arbmustjhkuvyryr', // Replace with your email password or an app-specific password
            },
        });

        const mailOptions = {
            from: 'hephzibahranjan@gmail.com', // Sender email address
            to: email, // Receiver email address
            subject: 'Your OTP for SignUp',
            text: `Your OTP is: ${randomOTP}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).send('Error sending the required OTP.');
            } else {
                console.log('Email sent:', info.response);
                // Mocking the email sending process
                console.log(`Sending OTP ${randomOTP} to ${email}`);
                otpData= randomOTP;
                res.status(200).json({ message: 'OTP sent successfully.' });
            }
        });
    } else {
        res.status(400).send('Invalid request.');
    }
});


// POST endpoint to verify OTP and signup
app.post('/verifyOTP', (req, res) => {
    const { email, otp } = req.body;
    if (email && otp) {
        if (otp == otpData) {
            // Clear OTP data after successful verification
            console.log("hurray");
            res.status(200).send('OTP verified successfully');
        } else {
            res.status(400).send('Invalid OTP');
        }
    } else {
        res.status(400).send('Invalid request.');
    }
});


// Register endpoint
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        const savedUser = await newUser.save(); // Save the new user to the database
        const userId = savedUser._id; // Get the user ID from the saved user object
        // res.status(201).send('User registered successfully.');
        res.status(201).json({ message: 'User Registered Successfully successfully.', userId:userId});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user. Please try again later.');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid credentials.');
        }
        const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '7h' });
        console.log(token);
        console.log(req.body);
        res.json({ userId: user._id, token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in. Please try again later.');
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        return res.sendStatus(401); // Unauthorized if no token provided
    }
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.sendStatus(403); // Forbidden if token is invalid or expired
        }
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });


// Profile schema
const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
      required: true,
    },
    education: {
      type: String,
      required: true,
    },
    achievements: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    backgroundImage: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Create Profile model
const Profile = mongoose.model("profileinfo", profileSchema);

// Endpoint to create a profile
app.post("/profileform", authenticateToken, upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
  ]),
  async (req, res) => {
    
    try {
      const {
        fullName,
        username,
        email,
        bio,
        experience,
        skills,
        education,
        achievements,
        designation,
        company,
        website,
        location,
      } = req.body;

      const profile = new Profile({
        userId: req.user.userId,
        fullName,
        username,
        email,
        bio,
        experience,
        skills,
        education,
        achievements,
        profileImage: req.files["profileImage"][0].filename,
        designation,
        company,
        backgroundImage: req.files["backgroundImage"][0].filename,
        website,
        location,
      });
      console.log(profile);
      await profile.save();

      res.status(200).json({ message: "Profile submitted successfully" });
    } catch (error) {
      console.error("Error submitting profile:", error);
      res
        .status(500)
        .json({ message: "Error storing data. Please try again later." });
    }
  }
);

app.get("/getProfileDetails", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const profile = await Profile.findOne({ userId }).populate("userId");
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(200).json({
      username: profile.username,
      fullname: profile.fullName,
      bio: profile.bio,
      backgroundImage: profile.backgroundImage,
      profileImage: profile.profileImage,
      location: profile.location,
      designation: profile.designation,
      experience: profile.experience,
      education: profile.education,
      skills: profile.skills,
      achievements: profile.achievements,
      // Add more fields as needed
    });
  } catch (error) {
    console.error("Error fetching profile details:", error);
    res.status(500).json({ message: "Error fetching profile details" });
  }
}); 



//project schema
const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {type:String},
  designation: {type:String},
  profileimageUrl: { type: String },
  concept: String,
  roles: [String],
  problem: String,
  solution: String,
  startupType: String,
  startupStage: String,
  patent: String,
  employmentStatus: String,
  skillSet: {
    category: String,
    subcategory: String,
    skills: [String],
  },
  postImage: String,
  pitchDeck: String
});

const Project = mongoose.model("Project", projectSchema);

// API endpoint
app.post("/projectform", authenticateToken,
  upload.fields([
    { name: "postImage", maxCount: 1 }, 
    { name: "pitchDeck", maxCount: 1 },
  ]),
  async (req, res) => {
    const formData = req.body;
    const files = req.files;
    console.log(formData);
    const userId = req.user.userId;
    const prof = await Profile.findOne({ userId });
    console.log(prof);
    const username=prof.username;
    const designation=prof.designation;
    const profileimageUrl = prof.profileImage;
     // Ensure roles and skillSet are strings and convert them to arrays
     const rolesString = formData.roles || '';
 
     const roles = rolesString.split(',').map(role => role.trim());
     
    let skillSet;
    try {
      skillSet = JSON.parse(formData.skillSet);
    } catch (error) {
      return res.status(400).json({ error: "Invalid JSON format for skillSet" });
    }
 
     const newProject = new Project({
       ...formData,
       userId: req.user.userId,
       username: username,
       designation: designation,
       profileimageUrl: profileimageUrl,
       roles: roles,
       skillSet: skillSet,
      //  postImage: files.postImage ? files.postImage[0].filename : null,
      //  pitchDeck: files.pitchDeck ? files.pitchDeck[0].filename : null,
      postImage: req.files['postImage'][0].filename,
      pitchDeck: req.files['pitchDeck'][0].filename,
     });

    console.log(newProject);
    newProject
      .save()
      .then((project) => res.status(201).json(project))
      .catch((error) => res.status(500).json({ error }));
  }
);

// Endpoint to fetch all projects
app.get("/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find().populate("userId");
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error });
  }
});



//post schema
const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  postPrivacy: { type: String, required: true },
  username: {type:String},
  designation: {type:String},
  postContent: { type: String, required: true },
  profileimageUrl: { type: String },
  imageUrl: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array to store user IDs who liked the post
  shares: { type: Number, default: 0 },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: {type:String},
      designation: {type:String},
      profileimageUrl: { type: String },
      comment: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

const Post = mongoose.model('Post', postSchema);

app.post('/createPost', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { postPrivacy, postContent, image } = req.body;
    const userId = req.user.userId;
    const profile = await Profile.findOne({ userId }).populate("userId");
    const username=profile.username;
    const designation=profile.designation;
    const profileimageUrl = profile.profileImage;
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.filename; // Save the filename in imageUrl
    } else {
      imageUrl = null; // No image provided
    }

    const newPost = new Post({
      userId,
      username,
      designation,
      profileimageUrl,
      imageUrl,
      postPrivacy,
      postContent,
    });

    await newPost.save();

    res.status(201).json({ message: 'Post created successfully.' });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send('Error creating post. Please try again later.');
  }
});
app.post('/likePost/:id', authenticateToken, async (req, res) => {
  try {
    console.log(req.user.userId);
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You have already liked this post' });
    }
    
    post.likes.push(req.user.userId);
    await post.save();
    res.json(post);
  } catch (e) {
    res.send({ message: 'Error in Liking post' });
  }
});

app.delete('/likePost/:id', authenticateToken, async (req, res) => {
  try {
    
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You have not liked this post' });
    }
    post.likes = post.likes.filter((userId) => userId.toString() !== req.user.userId);
    await post.save();
    res.json(post);
  } catch (e) {
    res.send({ message: 'Error in Unliking post' });
  }
});


// Share a post
app.post('/sharePost/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.shares += 1;
    await post.save();

    res.status(200).json({ message: 'Post shared successfully.', shares: post.shares });
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ message: 'Error sharing post' });
  }
});

// Comment on a post
app.post('/commentPost/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { comment } = req.body;
    const userId = req.user.userId;
    const profile = await Profile.findOne({ userId }).populate("userId");
    const username= profile.username;
    const designation=profile.designation;
    const profileimageUrl = profile.profileImage;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ userId, comment, username, designation, profileimageUrl });
    await post.save();

    res.status(200).json({ message: 'Comment added successfully.', comments: post.comments, });
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ message: 'Error commenting on post' });
  }
});


  app.get('/getUserDetails', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user; // Access userId from the authenticated token
        // Assuming you have a Profile model with a userId field
        // console.log(userId);
        const profile = await Profile.findOne({ userId }).populate('userId');
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        console.log(profile.username);
        // Return user details including username
        res.status(200).json({
          userId: profile.userId, 
          username: profile.username,
         fullname:profile.fullName,
          bio: profile.bio, // Example: Include bio
          profileImage:profile.profileImage,
          designation:profile.designation
          // Add more fields as needed
      });
        
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
});

// 
app.get('/getPostDetails', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user; // Access userId from the authenticated token
    // console.log(userId);
    // Fetch all posts made by the user
    const posts = await Post.find({ postPrivacy: "public" }).populate('userId', 'username profileImage');
    // console.log(posts);
    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    // Transform posts data if needed, such as selecting specific fields or formatting
    // const formattedPosts = posts.map(post => ({
    //   postContent: post.postContent,
    //   postPrivacy: post.privacy,
    //   imageUrl: `http://localhost:9002/uploads/${post.imageUrl}`
    //   // Add more fields as needed
    // }));

    // Send the array of posts to the frontend
    res.status(200).json({ posts});

  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

app.get('/checkProfile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await Profile.findOne({ userId });

    if (profile) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/deletePost/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByIdAndDelete(postId);
    if (post) {
      res.status(200).json({ message: 'Post deleted successfully' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/getUserPosts/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ userId }).populate('userId');
    // console.log(posts);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
});

// Endpoint to get user details by ID
app.get('/getUserDetails/:username', authenticateToken, async (req, res) => {
  const username = req.params.username;
  try {
    const user = await Profile.findOne({ username: username });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

// Endpoint to search users by username
// app.get('/searchUser', async (req, res) => {
//   const username = req.query.username;
//   try {
//     const users = await User.find({ username: new RegExp(username, 'i') });
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: 'Error searching for users' });
//   }
// });

// Get follow status
app.get('/followStatus/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user.userId; // Assuming you have user ID from authentication middleware
  if (!currentUserId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const user = await Profile.findOne({ username });
    if (user) {
      const isFollowing = user.followers.includes(currentUserId);
      res.json({ isFollowing });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching follow status' });
  }
});

// Follow user
app.post('/follow/:username', authenticateToken, async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user.userId; // Assuming you have user ID from authentication middleware
  // console.log(currentUserId);
  try {
    const user = await Profile.findOne({ username });
    if (user) {
      if (!user.followers.includes(currentUserId)) {
        user.followers.push(currentUserId);
        await user.save();
        const currentUser = await Profile.findOne({ userId: currentUserId });
        console.log(currentUser);
        currentUser.following.push(user.userId);
        await currentUser.save();
        console.log("user followed");
        res.json({ message: 'User followed successfully' });
      } else {
        res.status(400).json({ message: 'Already following this user' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error following user' });
  }
});

// Unfollow user
app.post('/unfollow/:username',authenticateToken, async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user.userId; // Assuming you have user ID from authentication middleware
console.log(currentUserId);
  try {
    const user = await Profile.findOne({ username });
    if (user) {
      if (user.followers.includes(currentUserId)) {
        user.followers = user.followers.filter(id => id.toString() !== currentUserId);
        await user.save();
        const currentUser = await Profile.findOne({ userId: currentUserId });
        console.log(currentUser);
        currentUser.following = currentUser.following.filter(id => id.toString() !== user._id.toString());
        await currentUser.save();
        res.json({ message: 'User unfollowed successfully' });
      } else {
        res.status(400).json({ message: 'Not following this user' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});


// Protected endpoint example
app.get('/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route.');
})

// Start the server
const port = 9002;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});