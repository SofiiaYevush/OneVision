# Festivo – User Stories

### US1
As a client, I want to register an account so that I can find event services.

**Acceptance Criteria**
- User can enter email and password
- System validates email format
- System creates a new user account
- User is assigned the role "Client"

---

### US2
As a user, I want to log into the system so that I can access my account.

**Acceptance Criteria**
- User enters email and password
- System validates credentials
- System creates an authenticated session
- User is redirected to the home page

---

### US3 
As a client, I want to browse available services so that I can find event providers.

**Acceptance Criteria**
- System displays a list of services
- Each service shows title, description, and price
- User can open the service details page

---

### US4
As a client, I want to filter services by category so that I can quickly find relevant services.

**Acceptance Criteria**
- User can select a category filter
- System shows only services from the selected category
- User can clear the filter

---

### US5
As a client, I want to search services by keywords so that I can find specific providers.

**Acceptance Criteria**
- User can enter search keywords
- System returns matching services
- Results update dynamically

---

### US6
As a client, I want to view performer profiles so that I can evaluate their experience.

**Acceptance Criteria**
- System displays profile photo
- System displays performer name
- System displays profile description
- System shows rating and reviews

---

### US7
As a client, I want to view performer portfolios so that I can see examples of their work.

**Acceptance Criteria**
- Portfolio images or media are displayed
- Portfolio items belong to the performer
- User can browse portfolio items

---

### US8
As a client, I want to see performer ratings so that I can evaluate service quality.

**Acceptance Criteria**
- Rating is displayed as a numeric or star value
- Rating is calculated from user reviews
- Rating updates when new reviews are added

---

### US9
As a client, I want to read reviews from other users so that I can make better decisions.

**Acceptance Criteria**
- Reviews are displayed on the performer page
- Each review shows rating and comment
- Reviews are linked to verified bookings

---

### US10
As a client, I want to check performer availability so that I can choose a suitable date in the calendar.

**Acceptance Criteria**
- System displays available dates
- Booked dates are marked unavailable
- Availability updates automatically after changes made by performer

---

### US11
As a client, I want to book a service so that I can reserve a performer for my event.

**Acceptance Criteria**
- User selects date and service
- System validates availability
- Booking is created with status "pending"

---

### US12
As a client, I want to contact the performer through a chat after creating a booking request so that the performer can review and confirm my booking.

**Acceptance Criteria**

- After creating a booking request, the client is redirected to a chat with the performer
- The chat contains information about the booking request (service, date, client)
- The performer receives a notification about the new booking request
- The performer can confirm or reject the booking directly from the chat
- If the performer confirms the booking, the booking status changes to "confirmed"
- If the performer rejects the booking, the booking status changes to "rejected"

---

### US13
As a client, I want to send a booking request to the performer so that they can review and decide whether to accept my reservation.

**Acceptance Criteria**
- Client selects service and preferred date
- System creates a booking request with status "pending"
- The performer receives a notification about the new request
- The booking request appears in the performer's booking dashboard
- The client can see the booking request status

---

### US14
As a client, I want to see the booking status so that I know whether it is confirmed.

**Acceptance Criteria**
- Booking status is visible in user dashboard
- Status updates automatically
- Possible statuses include pending, confirmed, cancelled

---

### US15
As a client, I want to cancel a booking so that I can change my plans.

**Acceptance Criteria**
- User can select a booking
- User confirms cancellation
- Booking status updates to "cancelled"

---

### US16
As a client, I want to view my booking history so that I can track past services.

**Acceptance Criteria**
- System displays list of past bookings
- Each booking shows date and service
- User can open booking details

---

### US17  
As a client, I want to edit my profile so that my information stays updated.

**Acceptance Criteria**
- User can edit name and contact details
- Changes are validated
- Updated information is saved

---

### US18
As a client, I want to receive notifications about bookings so that I stay informed.

**Acceptance Criteria**
- Notification is sent when booking status changes
- Notifications appear in the user dashboard
- Notifications include booking details

---

### US19 
As a client, I want to leave reviews after services so that I can share feedback.

**Acceptance Criteria**
- Review form appears after completed booking
- User enters rating and comment
- Review is linked to the booking

---

### US20 
As a client, I want to rate performers so that others can evaluate their quality.

**Acceptance Criteria**
- User selects rating value
- Rating is stored in database
- Average rating updates automatically

---

### US21
As a performer, I want to register so that I can offer services.

**Acceptance Criteria**
- User registers account
- Role "Performer" is assigned
- Performer profile is created

---

### US22
As a performer, I want to create my profile so that clients can see my information.

**Acceptance Criteria**
- Performer enters profile data
- System validates fields
- Profile is saved

---

### US23
As a performer, I want to add a description of my services so that clients understand what I offer.

**Acceptance Criteria**
- Description field is editable
- Text is saved in database
- Description appears on profile page

---

### US24
As a performer, I want to upload portfolio items so that I can showcase my work.

**Acceptance Criteria**
- Performer uploads images
- System stores media files
- Portfolio appears on profile page

---

### US25
As a performer, I want to create new services so that clients can book them.

**Acceptance Criteria**
- Performer enters service title and price
- System saves service
- Service appears in service list

---

### US26
As a performer, I want to edit my services so that I can update information.

**Acceptance Criteria**
- Performer can modify service details
- Changes are validated
- Updated service is saved

---

### US27
As a performer, I want to delete services so that outdated offers are removed.

**Acceptance Criteria**
- Performer selects service
- System confirms deletion
- Service is removed

---

### US28
As a performer, I want to see booking requests so that I can manage them.

**Acceptance Criteria**
- System lists incoming bookings
- Each booking shows client and date
- Performer can open booking details

---

### US29
As a performer, I want to accept bookings so that the service is confirmed.

**Acceptance Criteria**
- Performer selects booking
- Booking status updates to accepted
- Client receives notification

---

### US30
As a performer, I want to reject bookings so that unavailable requests are declined.

**Acceptance Criteria**
- Performer selects booking
- Booking status updates to rejected
- Client receives notification

---

### US31
As a performer, I want to manage my availability calendar so that clients see correct dates.

**Acceptance Criteria**
- Performer marks unavailable dates
- System blocks those dates
- Calendar updates automatically

---

### US32
As a performer, I want to read client reviews so that I can improve my service.

**Acceptance Criteria**
- Reviews appear on dashboard
- Reviews include rating and comment
- Reviews are linked to bookings

---

### US33
As a performer, I want to see my rating so that I know how clients evaluate me.

**Acceptance Criteria**
- Rating appears in performer dashboard
- Rating updates when new reviews are added
- Rating is calculated automatically

---

### US34
As a performer, I want to view booking statistics so that I can track demand.

**Acceptance Criteria**
- Dashboard shows number of bookings
- Statistics update automatically
- Data includes confirmed bookings

---

### US35
**User Story**  
As a performer, I want to view my upcoming bookings so that I can prepare for scheduled events.

**Acceptance Criteria**
- Performer can view a list of confirmed bookings
- Each booking displays client name, service, and event date
- Bookings are sorted by upcoming date
- Performer can open booking details

---


### US36
As an admin, I want to view all users so that I can manage the platform.

**Acceptance Criteria**
- System displays user list
- Admin can search users
- Admin can view user profiles

---

### US37
As an admin, I want to block users so that I can prevent misuse.

**Acceptance Criteria**
- Admin selects user
- System changes account status
- Blocked user cannot log in

---

### US38
As an admin, I want to edit user information so that incorrect data can be corrected.

**Acceptance Criteria**
- Admin edits user fields
- System validates updates
- Changes are saved

---

### US39
As an admin, I want to delete user accounts so that inactive accounts are removed.

**Acceptance Criteria**
- Admin selects account
- System confirms deletion
- Account is removed from database

---

### US40
As an admin, I want to moderate services so that platform content remains appropriate.

**Acceptance Criteria**
- Admin reviews service details
- Admin can remove services
- Moderation actions are logged

---

### US41
As an admin, I want to monitor platform activity so that I can ensure the system is functioning properly.

**Acceptance Criteria**
- Admin can access the platform activity dashboard
- Dashboard displays number of users, their categories, name, avarage rating
- Data updates automatically

---

### US42
As an admin, I want to view all bookings so that I can monitor activity.

**Acceptance Criteria**
- System displays booking list
- Admin can filter bookings
- Booking details are accessible

---

### US43
As an admin, I want to view platform statistics so that I can monitor system usage.

**Acceptance Criteria**
- Dashboard shows total users
- Dashboard shows total bookings
- Data updates regularly

---

### US44 
As a system, I want to validate user input during registration so that only valid data is stored.

**Acceptance Criteria**
- Email must follow a valid format
- Password must meet minimum length and complexity requirements
- Required fields cannot be empty
- System shows error messages for invalid inputs

---

### US45
As a system, I want to encrypt user passwords so that user credentials are secure.

**Acceptance Criteria**
- Passwords are hashed before storing in the database
- System never stores plain text passwords
- Authentication compares hashed password during login

---

### US46
As a system, I want to check date availability before booking so that double bookings are prevented.

**Acceptance Criteria**
- System verifies selected date against performer availability
- Booked dates are marked unavailable
- Booking request is rejected if date is already booked
- User receives a message if selected date is unavailable

---

### US47
As a system, I want to verify users during registration so that only legitimate users can join.

**Acceptance Criteria**
- Email verification is required via confirmation link
- Users cannot log in until email is verified
- Verification link expires after a set time
- System notifies user if verification fails

---

### US48
**User Story**  
As a client, I want to access a general chat for each performer so that I can communicate before and after sending booking requests.

**Acceptance Criteria**
- Chat is accessible from performer profile page
- User can send messages to performer
- Chat shows all previous messages between client and performer
- Chat updates in real-time

---

### US49
As a client, I want to browse performers by category so that I can quickly find the type of service I need.

**Acceptance Criteria**
- System displays a list of categories (e.g., Photographer..)
- User can select a category
- System shows all performers in the selected category
- User can navigate to performer profile from category listing

---

### US50
As a client, I want to sort services on the services page so that I can quickly find the service I need.

**Acceptance Criteria**
- User can sort services by price, rating, or date
- Sorting is applied immediately after selection
- User can reset sorting to default
- Sorted list updates dynamically

---

### US51
As a client, I want to filter services on the services page so that I can narrow down results by category, availability, or location.

**Acceptance Criteria**
- User can select one or multiple filters (category, availability, location)
- Filters are applied immediately after selection
- User can clear all filters and return to the full list
- Filtered list updates dynamically
