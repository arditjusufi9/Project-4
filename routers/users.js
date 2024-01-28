const router = require('express').Router();
const express = require('express');
const { createEvent, deleteEvent, getAllEvents, updateEvent, registerForEvent, getEventWithParticipants, cancelParticipation, findEventsByUser } = require('../controllers/users');

router.post('/createEvent',createEvent)
router.delete('/deleteEvent/:id',deleteEvent)
router.get('/getEvents',getAllEvents)
router.put('/updateEvent/:id',updateEvent)

router.post('/register/:eventId',registerForEvent)
router.get('/getParticipants/:eventId',getEventWithParticipants)
router.delete('/cancel/:userId',cancelParticipation)
router.get('/EventByUser/:userId',findEventsByUser)
























module.exports = router