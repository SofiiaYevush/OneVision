# Manual Test Cases

## Admin Module

This document contains manual test cases for Admin functionality.

---

# USERS MODULE

## TC_001 - Get users list (default request)

**Preconditions:** Admin is authenticated

**Steps:**
1. Send GET request to `/admin/users`

**Expected Result:**
- Status 200
- Response contains `items` array
- Response contains `meta` object
- Default pagination: page = 1, limit = 20

**Priority:** High  
**Type:** Functional

---

## TC_002 - Pagination works correctly

**Steps:**
1. Send GET `/admin/users?page=2&limit=10`

**Expected Result:**
- Status 200
- 10 users returned
- meta.page = 2
- meta.limit = 10

**Priority:** Medium  
**Type:** Functional

---

## TC_003 - Filter by role (client)

**Steps:**
1. Send GET `/admin/users?role=client`

**Expected Result:**
- All returned users have role = client

**Priority:** Medium  
**Type:** Functional

---

## TC_004 - Filter by status (blocked)

**Steps:**
1. Send GET `/admin/users?status=blocked`

**Expected Result:**
- Only blocked users returned

**Priority:** High  
**Type:** Functional

---

## TC_005 - Search by email

**Steps:**
1. Send GET `/admin/users?q=test@gmail.com`

**Expected Result:**
- Users matching email are returned

**Priority:** Medium  
**Type:** Functional

---

## TC_006 - Block user successfully

**Steps:**
1. Send POST `/admin/users/{id}/block`

**Expected Result:**
- Status 200
- User `isBlocked = true`

**Priority:** High  
**Type:** Functional / Security

---

## TC_007 - Cannot block admin

**Steps:**
1. Try to block admin user

**Expected Result:**
- Status 400
- Error: "Cannot block an admin"

**Priority:** High  
**Type:** Negative

---

## TC_008 - Delete user successfully

**Steps:**
1. Send DELETE `/admin/users/{id}`

**Expected Result:**
- Status 204
- User removed from DB

**Priority:** High  
**Type:** Functional

---

## TC_009 - Unauthorized access

**Steps:**
1. Call `/admin/users` without token

**Expected Result:**
- Status 401 Unauthorized

**Priority:** Critical  
**Type:** Security

---

## TC_010 - Non-admin access denied

**Steps:**
1. Login as client
2. Call `/admin/users`

**Expected Result:**
- Status 403 Forbidden

**Priority:** Critical  
**Type:** Security

---
# AVAILABILITY MODULE — Manual Test Cases

---

## TC_011 - Get month availability (valid request)

**Preconditions:** Performer exists

**Steps:**
1. Send GET /availability/{performerId}/month?year=2026&month=4

**Expected Result:**
- Status 200
- Response contains data array
- All dates are within April 2026

**Priority:** High  
**Type:** Functional

---

## TC_012 - Get month availability (January boundary)

**Steps:**
1. Send GET /availability/{performerId}/month?year=2026&month=1

**Expected Result:**
- Only January dates returned

**Priority:** Medium  
**Type:** Functional

---

## TC_013 - Invalid month (>12)

**Steps:**
1. GET /availability/{performerId}/month?year=2026&month=13

**Expected Result:**
- Status 400 (validation error)

**Priority:** High  
**Type:** Negative

---

## TC_014 - Invalid year (<2020)

**Steps:**
1. GET /availability/{performerId}/month?year=2010&month=5

**Expected Result:**
- Status 400 validation error

**Priority:** Medium  
**Type:** Negative

---

## TC_015 - Block single date (performer)

**Preconditions:** Performer is authenticated

**Steps:**
1. POST /availability/block
2. Body:
   {
     "dates": ["2026-04-28"]
   }

**Expected Result:**
- Status 200
- Message: "Dates blocked"
- Date stored as blocked_by_performer

**Priority:** High  
**Type:** Functional

---

## TC_016 - Block multiple dates

**Steps:**
1. POST /availability/block
2. Body:
   {
     "dates": ["2026-04-28", "2026-04-29"]
   }

**Expected Result:**
- Both dates are blocked successfully

**Priority:** High  
**Type:** Functional

---

## TC_017 - Block dates without authentication

**Steps:**
1. POST /availability/block without token

**Expected Result:**
- Status 401 Unauthorized

**Priority:** Critical  
**Type:** Security

---

## TC_018 - Non-performer tries to block dates

**Steps:**
1. Login as client/admin
2. POST /availability/block

**Expected Result:**
- Status 403 Forbidden

**Priority:** Critical  
**Type:** Security

---

## TC_019 - Block same date twice

**Steps:**
1. Block date 2026-04-28
2. Try blocking same date again

**Expected Result:**
- First request succeeds
- Second request returns:
  - Status 409 Conflict
  - Message: Date is already blocked

**Priority:** High  
**Type:** Negative

---

## TC_020 - Unblock single date

**Steps:**
1. POST /availability/unblock
2. Body:
   {
     "dates": ["2026-04-28"]
   }

**Expected Result:**
- Status 200
- Message: Dates unblocked
- Date removed from DB

**Priority:** High  
**Type:** Functional

---

## TC_021 - Unblock multiple dates

**Steps:**
1. POST /availability/unblock
2. Body:
   {
     "dates": ["2026-04-28", "2026-04-29"]
   }

**Expected Result:**
- Both dates removed from DB

**Priority:** Medium  
**Type:** Functional

---

## TC_022 - Unblock non-existing dates

**Steps:**
1. Try to unblock dates not in DB

**Expected Result:**
- No error
- Response still success

**Priority:** Low  
**Type:** Edge

---

## TC_023 - Date normalization check

**Steps:**
1. Send date 2026-04-28T15:30:00Z
2. Block it

**Expected Result:**
- Stored as 2026-04-28 00:00:00

**Priority:** High  
**Type:** Data consistency

---

## TC_024 - Bulk block (60 dates)

**Steps:**
1. Send 60 dates in one request

**Expected Result:**
- All dates inserted successfully
- No timeout or crash

**Priority:** Medium  
**Type:** Performance

---

## TC_025 - Invalid date format

**Steps:**
1. POST /availability/block
2. Body:
   {
     "dates": ["28-04-2026"]
   }

**Expected Result:**
- Status 400 validation error

**Priority:** High  
**Type:** Validation

---

# BOOKINGS MODULE

---

## TC_026 - Create booking (valid data)

**Preconditions:** Client is authenticated, service exists and is active

**Steps:**
1. POST /bookings
2. Body:
   {
     "serviceId": "validId",
     "eventDate": "2026-05-10",
     "eventName": "Birthday",
     "eventType": "Party",
     "eventAddress": "Kyiv",
     "startTime": "18:00",
     "duration": 3,
     "guestCount": 20
   }

**Expected Result:**
- Status 201
- Booking created
- status = pending

**Priority:** High  
**Type:** Functional

---

## TC_027 - Cannot create booking for inactive service

**Steps:**
1. Try to book inactive service

**Expected Result:**
- Status 404
- "Service not found"

**Priority:** High  
**Type:** Negative

---

## TC_028 - Cannot book own service

**Steps:**
1. Client tries to book their own service

**Expected Result:**
- Status 400
- Error: Cannot book your own service

**Priority:** High  
**Type:** Negative

---

## TC_029 - Cannot book unavailable date

**Steps:**
1. Choose already blocked date
2. Create booking

**Expected Result:**
- Status 409 Conflict
- Date unavailable

**Priority:** High  
**Type:** Negative

---

## TC_030 - Event date in the past

**Steps:**
1. Send past date

**Expected Result:**
- Status 400 validation error

**Priority:** High  
**Type:** Validation

---

## TC_031 - Get booking by ID (owner)

**Steps:**
1. GET /bookings/{id}

**Expected Result:**
- Status 200
- Booking returned

**Priority:** High  
**Type:** Functional

---

## TC_032 - Get booking чужим користувачем

**Steps:**
1. Інший user викликає GET /bookings/{id}

**Expected Result:**
- Status 403 Forbidden

**Priority:** Critical  
**Type:** Security

---

## TC_033 - Get client bookings list

**Steps:**
1. GET /bookings/client

**Expected Result:**
- Status 200
- Only client bookings returned

**Priority:** High  
**Type:** Functional

---

## TC_034 - Get performer bookings list

**Steps:**
1. GET /bookings/performer

**Expected Result:**
- Status 200
- Only performer bookings returned

**Priority:** High  
**Type:** Functional

---

## TC_035 - Pagination for bookings

**Steps:**
1. GET /bookings/client?page=2&limit=5

**Expected Result:**
- 5 bookings returned
- meta.page = 2

**Priority:** Medium  
**Type:** Functional

---

## TC_036 - Confirm booking (valid)

**Preconditions:** Performer is owner, booking status = pending

**Steps:**
1. POST /bookings/{id}/confirm

**Expected Result:**
- Status 200
- status = confirmed

**Priority:** High  
**Type:** Functional

---

## TC_037 - Confirm booking by wrong performer

**Steps:**
1. Another performer tries to confirm

**Expected Result:**
- Status 403 Forbidden

**Priority:** Critical  
**Type:** Security

---

## TC_038 - Confirm already confirmed booking

**Steps:**
1. Confirm booking twice

**Expected Result:**
- Status 400
- Cannot perform action

**Priority:** Medium  
**Type:** Negative

---

## TC_039 - Reject booking (valid)

**Steps:**
1. POST /bookings/{id}/reject

**Expected Result:**
- Status 200
- status = rejected

**Priority:** High  
**Type:** Functional

---

## TC_040 - Cancel booking (client)

**Steps:**
1. POST /bookings/{id}/cancel

**Expected Result:**
- Status 200
- status = cancelled
- cancelledBy = client

**Priority:** High  
**Type:** Functional

---

## TC_041 - Cancel booking (performer)

**Steps:**
1. Performer cancels booking

**Expected Result:**
- cancelledBy = performer

**Priority:** High  
**Type:** Functional

---

## TC_042 - Cancel booking not related to user

**Steps:**
1. Random user cancels booking

**Expected Result:**
- Status 403 Forbidden

**Priority:** Critical  
**Type:** Security

---

## TC_043 - Cancel confirmed booking frees date

**Steps:**
1. Confirm booking
2. Cancel booking

**Expected Result:**
- Date becomes available again

**Priority:** High  
**Type:** Integration

---

## TC_044 - Complete booking (valid)

**Steps:**
1. POST /bookings/{id}/complete

**Expected Result:**
- Status 200
- status = completed

**Priority:** High  
**Type:** Functional

---

## TC_045 - Complete booking not confirmed

**Steps:**
1. Try to complete pending booking

**Expected Result:**
- Status 400

**Priority:** Medium  
**Type:** Negative

---

## TC_046 - Booking status flow validation

**Steps:**
1. Create booking
2. Confirm
3. Complete

**Expected Result:**
- Correct status transitions:
  pending → confirmed → completed

**Priority:** High  
**Type:** Functional

---

## TC_047 - Invalid booking ID

**Steps:**
1. GET /bookings/invalidId

**Expected Result:**
- Status 404

**Priority:** Medium  
**Type:** Negative

---

## TC_048 - Unauthorized access

**Steps:**
1. Call any endpoint without token

**Expected Result:**
- Status 401 Unauthorized

**Priority:** Critical  
**Type:** Security

---


# CHAT MODULE

---

## TC_049 - Create conversation (valid)

**Preconditions:** Client is authenticated

**Steps:**
1. POST /chat/conversations
2. Body:
   {
     "performerId": "validId"
   }

**Expected Result:**
- Status 200
- Conversation created or returned if exists

**Priority:** High  
**Type:** Functional

---

## TC_050 - Create duplicate conversation

**Steps:**
1. Create conversation with same performer twice

**Expected Result:**
- Same conversation returned
- No duplicates created

**Priority:** High  
**Type:** Edge

---

## TC_051 - Get conversation (participant)

**Steps:**
1. GET /chat/conversations/{id}

**Expected Result:**
- Status 200
- Conversation data returned

**Priority:** High  
**Type:** Functional

---

## TC_052 - Get conversation (not participant)

**Steps:**
1. Another user tries to access conversation

**Expected Result:**
- Status 403 Forbidden

**Priority:** Critical  
**Type:** Security

---

## TC_053 - List my conversations

**Steps:**
1. GET /chat/conversations

**Expected Result:**
- Status 200
- Only user conversations returned
- Sorted by lastMessageAt

**Priority:** High  
**Type:** Functional

---

## TC_054 - Get messages (valid)

**Steps:**
1. GET /chat/conversations/{id}/messages

**Expected Result:**
- Status 200
- Messages array returned
- Ordered oldest → newest

**Priority:** High  
**Type:** Functional

---

## TC_055 - Get messages pagination

**Steps:**
1. GET /chat/conversations/{id}/messages?page=2&limit=10

**Expected Result:**
- 10 messages returned
- Correct pagination meta

**Priority:** Medium  
**Type:** Functional

---

## TC_056 - Get messages (not participant)

**Steps:**
1. Another user calls messages endpoint

**Expected Result:**
- Status 403 Forbidden

**Priority:** Critical  
**Type:** Security

---

## TC_057 - Send message (valid)

**Steps:**
1. POST /chat/conversations/{id}/messages
2. Body:
   {
     "content": "Hello"
   }

**Expected Result:**
- Status 201
- Message created
- type = text

**Priority:** High  
**Type:** Functional

---

## TC_058 - Send empty message

**Steps:**
1. Send message with empty content

**Expected Result:**
- Status 400 validation error

**Priority:** High  
**Type:** Validation

---

## TC_059 - Send long message (>5000 chars)

**Steps:**
1. Send very long message

**Expected Result:**
- Status 400 validation error

**Priority:** Medium  
**Type:** Validation

---

## TC_060 - Send message (not participant)

**Steps:**
1. Another user sends message

**Expected Result:**
- Status 403 Forbidden

**Priority:** Critical  
**Type:** Security

---

## TC_061 - Message updates conversation

**Steps:**
1. Send message

**Expected Result:**
- lastMessage updated
- lastMessageAt updated

**Priority:** High  
**Type:** Integration

---

## TC_062 - Unread counter (client → performer)

**Steps:**
1. Client sends message

**Expected Result:**
- unreadPerformer +1

**Priority:** High  
**Type:** Integration

---

## TC_063 - Unread counter (performer → client)

**Steps:**
1. Performer sends message

**Expected Result:**
- unreadClient +1

**Priority:** High  
**Type:** Integration

---

## TC_064 - Messages marked as read

**Steps:**
1. Open messages

**Expected Result:**
- Messages marked as read
- unread counter reset

**Priority:** High  
**Type:** Integration

---

## TC_065 - System message creation

**Steps:**
1. Trigger system event (booking update)

**Expected Result:**
- Message created
- type = system or booking_update

**Priority:** Medium  
**Type:** Integration

---

## TC_066 - Socket join room

**Steps:**
1. Connect via socket
2. Emit chat:join

**Expected Result:**
- User joins conversation room

**Priority:** Medium  
**Type:** Realtime

---

## TC_067 - Receive real-time message

**Steps:**
1. Send message from user A

**Expected Result:**
- User B receives chat:message event

**Priority:** High  
**Type:** Realtime

---

## TC_068 - Typing indicator

**Steps:**
1. Emit chat:typing

**Expected Result:**
- Other user receives typing status

**Priority:** Low  
**Type:** Realtime

---

## TC_069 - Unauthorized access

**Steps:**
1. Call endpoints without token

**Expected Result:**
- Status 401 Unauthorized

**Priority:** Critical  
**Type:** Security

---


# EMAIL MODULE

---

## TC_070 - Send verification email (valid)

**Preconditions:** User registers

**Steps:**
1. Trigger email verification

**Expected Result:**
- Email sent successfully
- Contains verification link

**Priority:** High  
**Type:** Functional

---

## TC_071 - Verification email contains correct URL

**Steps:**
1. Open received email

**Expected Result:**
- Link format:
  /api/auth/verify-email/{token}
- Token present

**Priority:** High  
**Type:** Functional

---

## TC_072 - Verification link works

**Steps:**
1. Click verification link

**Expected Result:**
- User email verified
- Redirect or success response

**Priority:** High  
**Type:** Integration

---

## TC_073 - Expired verification token

**Steps:**
1. Use expired token

**Expected Result:**
- Error: token expired

**Priority:** Medium  
**Type:** Negative

---

## TC_074 - Send password reset email

**Steps:**
1. Request password reset

**Expected Result:**
- Email sent
- Contains reset link

**Priority:** High  
**Type:** Functional

---

## TC_075 - Password reset link format

**Steps:**
1. Open email

**Expected Result:**
- URL contains /reset-password/{token}

**Priority:** High  
**Type:** Functional

---

## TC_076 - Reset password with valid token

**Steps:**
1. Click link
2. Set new password

**Expected Result:**
- Password updated successfully

**Priority:** High  
**Type:** Integration

---

## TC_077 - Reset password with expired token

**Steps:**
1. Use expired token

**Expected Result:**
- Error returned

**Priority:** Medium  
**Type:** Negative

---

## TC_078 - Booking notification email

**Steps:**
1. Create booking

**Expected Result:**
- Performer receives email
- Contains booking info

**Priority:** High  
**Type:** Integration

---

## TC_079 - Booking confirmation email

**Steps:**
1. Confirm booking

**Expected Result:**
- Client receives email

**Priority:** High  
**Type:** Integration

---

## TC_080 - Email not sent if SMTP fails

**Steps:**
1. Break mail config

**Expected Result:**
- No crash
- Error logged

**Priority:** High  
**Type:** Reliability

---

## TC_081 - Email HTML rendering

**Steps:**
1. Open email in client

**Expected Result:**
- Layout renders correctly
- Button clickable

**Priority:** Medium  
**Type:** UI

---

## TC_082 - Email without MAIL_USER (no auth)

**Steps:**
1. Remove MAIL_USER from env
2. Send email

**Expected Result:**
- Email still sent (if server allows)

**Priority:** Low  
**Type:** Configuration

---

## TC_083 - Invalid email address

**Steps:**
1. Send email to invalid address

**Expected Result:**
- Error handled
- Logged properly

**Priority:** Medium  
**Type:** Negative

---

## TC_084 - Email content includes dynamic data

**Steps:**
1. Send booking email

**Expected Result:**
- Event name present
- Date present
- Price present

**Priority:** High  
**Type:** Functional

---

# NOTIFICATIONS MODULE

---

## TC_085 - Create notification (valid)

**Steps:**
1. Trigger event (e.g. booking created)

**Expected Result:**
- Notification created in DB
- isRead = false

**Priority:** High  
**Type:** Functional

---

## TC_086 - Notification real-time delivery

**Steps:**
1. Trigger notification

**Expected Result:**
- Socket emits notification:new event
- User receives it

**Priority:** High  
**Type:** Realtime

---

## TC_087 - List notifications

**Steps:**
1. GET /notifications

**Expected Result:**
- Status 200
- List of user notifications returned

**Priority:** High  
**Type:** Functional

---

## TC_088 - Notifications sorted by date

**Steps:**
1. Fetch notifications

**Expected Result:**
- Sorted by createdAt DESC

**Priority:** Medium  
**Type:** Functional

---

## TC_089 - Pagination

**Steps:**
1. GET /notifications?page=2&limit=5

**Expected Result:**
- 5 notifications returned
- Correct meta

**Priority:** Medium  
**Type:** Functional

---

## TC_090 - Unread count

**Steps:**
1. GET /notifications

**Expected Result:**
- unreadCount correct

**Priority:** High  
**Type:** Functional

---

## TC_091 - Mark notification as read

**Steps:**
1. PATCH /notifications/{id}/read

**Expected Result:**
- isRead = true

**Priority:** High  
**Type:** Functional

---

## TC_092 - Mark another user's notification як read

**Steps:**
1. Try to mark another user's notification

**Expected Result:**
- No update performed

**Priority:** Critical  
**Type:** Security

---

## TC_093 - Mark all notifications as read

**Steps:**
1. PATCH /notifications/read-all

**Expected Result:**
- All notifications marked as read

**Priority:** High  
**Type:** Functional

---

## TC_094 - Mark all read when already read

**Steps:**
1. Call read-all again

**Expected Result:**
- No error
- Still success

**Priority:** Low  
**Type:** Edge

---

## TC_095 - Notification without socket

**Steps:**
1. Run without socket initialized

**Expected Result:**
- No crash
- Notification still created

**Priority:** High  
**Type:** Reliability

---

## TC_096 - Invalid notification ID

**Steps:**
1. PATCH /notifications/invalidId/read

**Expected Result:**
- No crash
- Safe handling

**Priority:** Medium  
**Type:** Negative

---

## TC_097 - Unauthorized access

**Steps:**
1. Call endpoints without token

**Expected Result:**
- Status 401 Unauthorized

**Priority:** Critical  
**Type:** Security

---

## TC_098 - Notification types validation

**Steps:**
1. Create notification with invalid type

**Expected Result:**
- Validation error

**Priority:** High  
**Type:** Validation

---

## TC_099 - Notification content validation

**Steps:**
1. Create notification without title/body

**Expected Result:**
- Validation error

**Priority:** High  
**Type:** Validation

---

## TC_100 - Notification reference fields

**Steps:**
1. Create notification with refId and refModel

**Expected Result:**
- Data stored correctly

**Priority:** Medium  
**Type:** Functional
