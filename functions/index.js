const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");

admin.initializeApp();

const cors = require('cors');

// Initialize Express app
const app = express();
app.use(cors({
  origin: true,
  credentials: true,
}));

// Middleware to parse JSON requests
app.use(express.json());
app.use(bodyParser.json());

// Configure Nodemailer with your Gmail account
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "23mx214@psgtech.ac.in",  // Your email here
    pass: "@maha1803", // App-specific password here
  },
});

// Route to send email
app.post("/sendEmail", async (req, res) => {
  try {
    const { email, name, skills } = req.body;

    if (!email || !name || !skills) {
      return res.status(400).send({ success: false, message: "Missing required fields" });
    }

    const mailOptions = {
      from: "23mx214@psgtech.ac.in",
      to: email,
      subject: "Club Registration Confirmation",
      text: `Hi ${name},\n\nYou have successfully registered for ` +
        `the following clubs:\n` +
        `${skills.join(", ")}.\n\nWelcome to HireTrove!!`,
    };

    console.log("Sending email to:", email);
    
    await transporter.sendMail(mailOptions);

    res.status(200).send({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ success: false, message: "Error sending email" });
  }
});

// Route to send email for new club creation
app.post("/sendAddClubEmail", async (req, res) => {
  try {
    const { clubName, members } = req.body;

    if (!members || members.length === 0) {
      return res.status(400).send({ success: false, message: "No members to notify" });
    }

    const mailOptions = {
      from: "23mx214@psgtech.ac.in",
      to: members,
      subject: `${clubName} Club Created`,
      text: `Hi there,\n\nWe are excited to announce that a new club named "${clubName}" has been created! 🎉\n\nThis is a fantastic opportunity for you to connect with like-minded individuals, share your interests, and collaborate on exciting projects. We encourage you to join and participate actively in the club's activities!\n\nIf you have any questions or need assistance, feel free to reach out. We look forward to seeing you there!\n\nBest regards,\nTeam HireTrove`,
    };

    await transporter.sendMail(mailOptions);
    res.send({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ success: false, message: "Error sending email" });
  }
});

// Route to send email for club deletion
app.post("/sendDeleteClubEmail", async (req, res) => {
  try {
      const { clubName, members } = req.body;
      if (!clubName || !members || members.length === 0) {
          return res.status(400).send({ success: false, message: "Missing required fields" });
      }

      // Define email options for all members
      const mailOptions = members.map(email => ({
          from: "23mx214@psgtech.ac.in",
          to: email,
          subject: `${clubName} Club Deleted`,
          text: `Dear member,\n\nWe regret to inform you that the club "${clubName}" has been deleted. We understand that this news may be disappointing, and we appreciate your involvement during its time.\n\nThank you for being a part of our community. If you have any questions or would like to explore other clubs, please feel free to reach out!\n\nWarm regards,\nTeam HireTrove`,
      }));

      // Send emails
      await Promise.all(mailOptions.map(option => transporter.sendMail(option)));

      // Send success response
      res.status(200).send({ success: true, message: "Emails sent successfully!" });
  } catch (error) {
      console.error("Error sending delete club emails:", error);
      res.status(500).send({ success: false, message: "Error sending emails" });
  }
});

// Route to send email for joining a club
app.post("/sendJoinClubEmail", async (req, res) => {
  try {
    const { email, clubName } = req.body;
    if (!email || !clubName) {
      return res.status(400).send({ success: false, message: "Missing required fields" });
    }

    const mailOptions = {
      from: "23mx214@psgtech.ac.in",
      to: email,
      subject: `Joined the ${clubName} Club!`,
      text: `Dear member,\n\nYou have successfully joined the "${clubName}" club. We are thrilled to have you on board!\n\nIf you have any questions or need assistance, feel free to reach out.\n\nWarm regards,\nTeam HireTrove`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending join club email:", error);
    res.status(500).send({ success: false, message: "Error sending email" });
  }
});

// Route to send email for leaving a club
app.post("/sendLeaveClubEmail", async (req, res) => {
  try {
    const { email, clubName } = req.body;
    if (!email || !clubName) {
      return res.status(400).send({ success: false, message: "Missing required fields" });
    }

    const mailOptions = {
      from: "23mx214@psgtech.ac.in",
      to: email,
      subject: `Left the ${clubName} Club`,
      text: `Dear member,\n\nYou have successfully left the "${clubName}" club. We're sorry to see you go!\n\nIf you have any feedback or questions, feel free to reach out.\n\nBest wishes,\nTeam HireTrove`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending leave club email:", error);
    res.status(500).send({ success: false, message: "Error sending email" });
  }
});

app.post("/sendNewPostNotification", async (req, res) => {
  try {
    const { userName, clubName, members } = req.body;

    if (!members || members.length === 0) {
      return res.status(400).send({ success: false, message: "No members to notify" });
    }

    console.log("Sending notifications to members:", members);

    const mailOptions = {
      from: "23mx214@psgtech.ac.in", // Your email here
      to: members.join(', '), // Ensure the members list is properly formatted
      subject: `New Post in ${clubName} by ${userName}`,
      text: `Hi there,\n\n${userName} has created a new post in the "${clubName}" club.\n\nCheck it out and join the discussion!\n\nBest regards,\nTeam HireTrove`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending notification emails:", error.message || error);
    res.status(500).send({ success: false, message: `Error sending notification emails: ${error.message}` });
  }
});

// Route to handle sending hire email
app.post("/sendHireNotification", async (req, res) => {
  try {
    const { email, recruiterName, skill } = req.body;

    if (!email || !recruiterName || !skill) {
      return res.status(400).send({ success: false, message: "Missing required fields" });
    }

    const mailOptions = {
      from: "your-email@example.com", // Update to your email
      to: email,
      subject: `You have been hired!`,
      text: `Hi,\n\nYou have been hired by ${recruiterName} for your skill in ${skill}.\n\nCongratulations and welcome onboard!\n\nBest regards,\nTeam HireTrove`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending hire email:", error);
    res.status(500).send({ success: false, message: "Error sending hire email" });
  }
});


// Listen on port 5000 locally
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

// Export the app as a Firebase Function
exports.api = functions.https.onRequest(app);
