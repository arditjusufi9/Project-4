In these files lies a project about Event Managment.It is built in a system of folders and files each of which will be explained below.
    The project starts with all the necessary installations (express,mysql,multer etc) and is split into folders for easier understanding. As  it is seen there are a few folders on the left side such as : controllers,routers
    uploads and the self-built prisma folder.
    The CONTROLLERS folder might be seen as the root of everything here because its the folder that contains the users.js file, in that same file are written the endpoints that make this project functional.For me there are 8 endpoints mentioned there (createEvent,deleteEvent,getAllEvents,updateEvent,registerForEvent,getEventWithParticipants,cancelParticipation,findEventsByUser), all of which do a specific purpose in the project.
    Now for each endpoint in the controllers folder there are their own routes that go with them.These can be found in the ROUTERS folder, in the file named users.js(same name  file as in the controllers one).The routes connected to the endpoint via importing then are each individually tested in POSTMAN.

    The base route included in the "router" is the "localhost:3000/api". For each endpoint kind of described below the route goes "localhost:3000/api/(the route below)".

Create Event
Route: /createEvent
Description: Create a new event with details such as title, description, location, date, capacity, registration deadline, and an optional image.

Delete Event
Route: /deleteEvent/:id
Description: Delete the event with the specified ID.


Get All Events
Route: /getEvents
Description: Retrieve all events stored in the database.


Update Event
Route: /updateEvent/:id
Description: Update the event with the specified ID with new details.


Register for Event
Route: /register/:eventId
Description: Register a user for the event specified by :eventId.


Get Event with Participants
Route: /getParticipants/:eventId
Description: Retrieve the event with the specified ID along with its participants.


Cancel Participation
Route: /cancel/:userId
Description: Cancel the participation of the user specified by :userId in any event they are registered for.


Find Events by User
Route: /EventByUser/:userId
Description: Retrieve all events in which the user specified by :userId is participating.