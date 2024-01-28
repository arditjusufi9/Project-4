const { PrismaClient } = require('@prisma/client');
const { error } = require('console');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');
require('dotenv').config();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
destination: function (req, file, cb) {
  cb(null, 'uploads/'); 
},
filename: function (req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  cb(null, uniqueSuffix + path.extname(file.originalname)); 
}
});

const upload = multer({ storage }).single('image');



const createEvent = async (req, res) => {
    try {
      upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(500).json({ error: 'Failed to upload image', multerError: err.message });
        } else if (err) {
          return res.status(500).json({ error: 'Unknown error occurred', multerError: err.message });
        }
  
        const { title, description, location, date, capacity, registrationDeadline } = req.body;
  
        if (!title || !location || !date || !capacity || !registrationDeadline) {
          return res.status(400).json({ error: 'Title, location, date, capacity, and registration deadline are required' });
        }
  
        const imagePath = req.file ? req.file.path : null;
  
        try {
          const createdEvent = await prisma.event.create({
            data: {
              title,
              description,
              image: imagePath,
              location,
              date: new Date(date),
              capacity: parseInt(capacity),
              registrationDeadline: new Date(registrationDeadline),
            },
          });
  
          res.status(201).json(createdEvent);
        } catch (dbError) {
          console.error('Database error:', dbError);
          return res.status(500).json({ error: 'Failed to create event in database', dbError: dbError.message });
        }
      });
    } catch (catchError) {
      console.error('Catch block error:', catchError);
      res.status(500).json({ error: 'Catch block error occurred', catchError: catchError.message });
    }
  };





  const deleteEvent = async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
  
      if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
  
      const deletedEvent = await prisma.event.delete({
        where: {
          id: eventId,
        },
      });
  
      res.status(200).json({ success: true, deletedEvent });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };





  const getAllEvents = async (req, res) => {
    try {
      const events = await prisma.event.findMany();
  
      res.status(200).json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };







  const updateEvent = async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
  
      if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
  
      upload(req, res, async function (uploadErr) {
        if (uploadErr instanceof multer.MulterError) {
          return res.status(500).json({ error: 'Failed to upload image', multerError: uploadErr.message });
        } else if (uploadErr) {
          return res.status(500).json({ error: 'Unknown error occurred', multerError: uploadErr.message });
        }
  
        const { title, description, location, date, capacity, registrationDeadline } = req.body;
  
        if (!title || !location || !date || !capacity || !registrationDeadline) {
          return res.status(400).json({ error: 'Title, location, date, capacity, and registration deadline are required' });
        }
  
        try {
          const existingEvent = await prisma.event.findUnique({
            where: {
              id: eventId,
            },
          });
  
          if (!existingEvent) {
            return res.status(404).json({ error: 'Event not found' });
          }
  
          let imagePath = existingEvent.image;
          if (req.file) {
            imagePath = req.file.path;
          }
  
          const updatedEvent = await prisma.event.update({
            where: {
              id: eventId,
            },
            data: {
              title,
              description,
              image: imagePath,
              location,
              date: new Date(date),
              capacity: parseInt(capacity),
              registrationDeadline: new Date(registrationDeadline),
            },
          });
  
          res.status(200).json(updatedEvent);
        } catch (dbError) {
          console.error('Database error:', dbError);
          res.status(500).json({ error: 'Failed to update event in database', dbError: dbError.message });
        }
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  








  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,        
    },
  });
  
  const sendRegistrationEmail = (user, event) => {
    const mailOptions = {
      from:  process.env.EMAIL_USER,  
      to: user.email,
      subject: 'Registration Successful',
      text: `Dear ${user.firstName} ${user.lastName},\n\nYou have successfully registered for the event "${event.title}".\n\nEvent details:\nTitle: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}\n\nThank you for registering!\n\nSincerely,\nYour Event Team`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending registration email:', error);
      } else {
        console.log('Registration email sent:', info.response);
      }
    });
  };
  







  const registerForEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const { firstName, lastName, email } = req.body;
  
      if (!eventId || !firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Event ID, firstName, lastName, and email are required' });
      }
  
      const event = await prisma.event.findUnique({
        where: {
          id: parseInt(eventId),
        },
      });
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      
      const participantsCount = event.participants ? event.participants.length : 0;
      if (participantsCount >= event.capacity) {
        return res.status(400).json({ error: 'Event is already full' });
      }
  
      
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          eventId: parseInt(eventId),
        },
      });
  
    
      sendRegistrationEmail(user, event);
  
      res.status(201).json({ success: true, user });
    } catch (error) {
      console.error('Error registering user for event:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  






  const getEventWithParticipants = async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
  
      if (isNaN(eventId)) {
        return res.status(400).json({ error: 'Invalid event ID' });
      }
  
      const event = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
        include: {
          participants: true,
        },
      });
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      res.status(200).json(event);
    } catch (error) {
      console.error('Error getting event with participants:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  







  const cancelParticipation = async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
  
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
  
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      await prisma.user.delete({
        where: {
          id: userId,
        },
      });
  
      res.status(200).json({ success: true, message: 'Participation canceled successfully' });
    } catch (error) {
      console.error('Error canceling participation:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };







  const findEventsByUser = async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
  
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
  
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          event: true,
        },
      });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json({ events: user.event });
    } catch (error) {
      console.error('Error finding events by user:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };







  module.exports={
    createEvent,
    deleteEvent,
    getAllEvents,
    updateEvent,
    registerForEvent,
    getEventWithParticipants,
    cancelParticipation,
    findEventsByUser
  }