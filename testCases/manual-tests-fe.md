# FRONTEND MANUAL TEST CASES

---

## AUTH PAGE

### TC_000 - Default tab is Login

**Steps:**
1. Open /auth

**Expected Result:**
- Login tab is active

**Priority:** High  
**Type:** UI

---

### TC_001 - Switch to Register tab

**Steps:**
1. Click "Sign Up"

**Expected Result:**
- Register form is shown

**Priority:** High  
**Type:** UI

---

### TC_002 - Login validation (invalid email)

**Steps:**
1. Enter invalid email
2. Submit

**Expected Result:**
- Error "Invalid email"

**Priority:** High  
**Type:** Validation

---

### TC_003 - Login validation (short password)

**Steps:**
1. Enter password < 6 chars

**Expected Result:**
- Validation error shown

**Priority:** High  
**Type:** Validation

---

### TC_004 - Successful login redirect (client)

**Steps:**
1. Login as client

**Expected Result:**
- Redirect to /dashboard

**Priority:** Critical  
**Type:** Functional

---

### TC_005 - Successful login redirect (performer)

**Steps:**
1. Login as performer

**Expected Result:**
- Redirect to /performer/dashboard

**Priority:** Critical  
**Type:** Functional

---

### TC_006 - Successful login redirect (admin)

**Steps:**
1. Login as admin

**Expected Result:**
- Redirect to /admin

**Priority:** Critical  
**Type:** Functional

---

### TC_007 - Login server error

**Steps:**
1. Enter wrong credentials

**Expected Result:**
- Server error message displayed

**Priority:** High  
**Type:** Negative

---

### TC_008 - Register validation (empty fields)

**Steps:**
1. Submit empty form

**Expected Result:**
- Validation errors for all fields

**Priority:** High  
**Type:** Validation

---

### TC_009 - Role switch in register

**Steps:**
1. Click performer role

**Expected Result:**
- Role changes visually

**Priority:** Medium  
**Type:** UI

---

### TC_010 - Successful registration

**Steps:**
1. Fill valid data
2. Submit

**Expected Result:**
- Redirect based on role

**Priority:** Critical  
**Type:** Functional

---

## ADMIN DASHBOARD

### TC_011 - Load dashboard stats

**Steps:**
1. Open /admin

**Expected Result:**
- Stats cards visible

**Priority:** High  
**Type:** Functional

---

### TC_012 - Stats loading state

**Steps:**
1. Open dashboard

**Expected Result:**
- Spinner shown before data loads

**Priority:** Medium  
**Type:** UI

---

### TC_013 - Bookings by status visible

**Steps:**
1. Load stats with booking data

**Expected Result:**
- Status blocks rendered

**Priority:** Medium  
**Type:** UI

---

### TC_014 - Users list loading

**Steps:**
1. Open users section

**Expected Result:**
- Spinner displayed

**Priority:** Medium  
**Type:** UI

---

### TC_015 - Empty users state

**Steps:**
1. No users returned

**Expected Result:**
- "No users found" message

**Priority:** Medium  
**Type:** UI

---

### TC_016 - Search users

**Steps:**
1. Enter email
2. Click Search

**Expected Result:**
- Filtered results

**Priority:** High  
**Type:** Functional

---

### TC_017 - Role filter

**Steps:**
1. Click "performer"

**Expected Result:**
- Only performers shown

**Priority:** High  
**Type:** Functional

---

### TC_018 - Block user

**Steps:**
1. Click Block

**Expected Result:**
- User status changes to Blocked

**Priority:** Critical  
**Type:** Functional

---

### TC_019 - Unblock user

**Steps:**
1. Click Unblock

**Expected Result:**
- Status becomes Active

**Priority:** Critical  
**Type:** Functional

---

### TC_020 - Cannot block admin

**Steps:**
1. Check admin row

**Expected Result:**
- No block button

**Priority:** Critical  
**Type:** Security

---

## BOOKING CHAT PAGE

### TC_021 - Load booking details

**Steps:**
1. Open booking page

**Expected Result:**
- Booking info displayed

**Priority:** High  
**Type:** Functional

---

### TC_022 - Booking loading state

**Steps:**
1. Open page

**Expected Result:**
- Spinner shown

**Priority:** Medium  
**Type:** UI

---

### TC_023 - Messages load

**Steps:**
1. Open chat

**Expected Result:**
- Messages displayed

**Priority:** High  
**Type:** Functional

---

### TC_024 - Empty chat state

**Steps:**
1. No messages

**Expected Result:**
- "Start conversation" message

**Priority:** Medium  
**Type:** UI

---

### TC_025 - Send message

**Steps:**
1. Type message
2. Click send

**Expected Result:**
- Message appears in chat

**Priority:** Critical  
**Type:** Functional

---

### TC_026 - Prevent empty message

**Steps:**
1. Send empty input

**Expected Result:**
- Nothing happens

**Priority:** High  
**Type:** Validation

---

### TC_027 - Enter key sends message

**Steps:**
1. Press Enter

**Expected Result:**
- Message sent

**Priority:** Medium  
**Type:** UX

---

### TC_028 - Auto scroll to bottom

**Steps:**
1. Send message

**Expected Result:**
- Chat scrolls down

**Priority:** Medium  
**Type:** UI

---

### TC_029 - Incoming socket message

**Steps:**
1. Receive message

**Expected Result:**
- Message appears instantly

**Priority:** High  
**Type:** Realtime

---

### TC_030 - System message display

**Steps:**
1. Trigger system message

**Expected Result:**
- Centered gray message

**Priority:** Medium  
**Type:** UI

---

### TC_031 - Confirm booking (performer)

**Steps:**
1. Click Confirm

**Expected Result:**
- Status updated

**Priority:** Critical  
**Type:** Functional

---

### TC_032 - Reject booking

**Steps:**
1. Click Reject

**Expected Result:**
- Status becomes rejected

**Priority:** Critical  
**Type:** Functional

---

### TC_033 - Cancel booking

**Steps:**
1. Click cancel

**Expected Result:**
- Booking cancelled

**Priority:** Critical  
**Type:** Functional

---

### TC_034 - Complete booking

**Steps:**
1. Click complete

**Expected Result:**
- Status becomes completed

**Priority:** Critical  
**Type:** Functional

---

### TC_035 - Show review prompt

**Steps:**
1. Booking completed (client)

**Expected Result:**
- Review block visible

**Priority:** High  
**Type:** UI

---

### TC_036 - Role-based actions visibility

**Steps:**
1. Login as client/performer

**Expected Result:**
- Different buttons shown

**Priority:** High  
**Type:** Security

---

### TC_037 - Disable buttons while loading

**Steps:**
1. Click action

**Expected Result:**
- Button disabled + spinner

**Priority:** Medium  
**Type:** UX

---

### TC_038 - Chat input disabled during send

**Steps:**
1. Send message

**Expected Result:**
- Prevent double send

**Priority:** Medium  
**Type:** UX

---

### TC_039 - Booking notes displayed

**Steps:**
1. Booking has notes

**Expected Result:**
- Notes section visible

**Priority:** Low  
**Type:** UI

---

### TC_040 - Booking guest count display

**Steps:**
1. Booking has guestCount

**Expected Result:**
- Guests shown

**Priority:** Low  
**Type:** UI

---

## TC-041 — Search input updates results with debounce
**Preconditions:**
- User is on /browse page  

**Steps:**
1. Type "DJ" in search input  
2. Wait 400–500ms  

**Expected Result:**
- API request is triggered once after typing stops  
- Results update according to query "DJ"  

---

## TC-042 — Category filter updates URL and results
**Preconditions:**
- User is on /browse page  

**Steps:**
1. Click "Music & DJ" category  

**Expected Result:**
- URL contains `?category=music`  
- Performers list updates accordingly  
- Selected category is highlighted  

---

## TC-043 — City filter works correctly
**Preconditions:**
- User is on /browse page  

**Steps:**
1. Select city "Kyiv"  

**Expected Result:**
- URL contains `?city=Kyiv`  
- Only performers from Kyiv are displayed  

---

## TC-044 — Reset city filter
**Preconditions:**
- City filter is applied  

**Steps:**
1. Click "All" in city filter  

**Expected Result:**
- `city` param is removed from URL  
- Results include all cities  

---

## TC-045 — Max price filter limits results
**Preconditions:**
- User is on /browse page  

**Steps:**
1. Set price slider to $100  

**Expected Result:**
- Only performers with hourlyRate ≤ 100 are shown  
- Page resets to 1  

---

## TC-046 — Min rating filter works
**Preconditions:**
- User is on /browse page  

**Steps:**
1. Select rating "4+"  

**Expected Result:**
- Only performers with rating ≥ 4 are shown  

---

## TC-047 — Combined filters work together
**Preconditions:**
- User is on /browse page  

**Steps:**
1. Select category "Photography"  
2. Select city "Lviv"  
3. Set max price to 200  
4. Set rating to 4+  

**Expected Result:**
- Results match all selected filters  
- No unrelated performers appear  

---

## TC-048 — Empty state is displayed correctly
**Preconditions:**
- Filters applied with no matching results  

**Steps:**
1. Apply extreme filters (e.g. price $0 + rating 5)  

**Expected Result:**
- "No performers found" message is displayed  
- Suggestion to adjust filters is visible  

---

## TC-049 — Pagination changes page
**Preconditions:**
- Multiple pages of results exist  

**Steps:**
1. Click page "2"  

**Expected Result:**
- New API request is triggered  
- Results for page 2 are displayed  
- Page 2 button is highlighted  

---

## TC-050 — Pagination resets after filter change
**Preconditions:**
- User is on page 3  

**Steps:**
1. Change category filter  

**Expected Result:**
- Page resets to 1  
- Results update accordingly  

---

## TC-051 — Performer card navigation
**Preconditions:**
- Performers list is visible  

**Steps:**
1. Click on a performer card  

**Expected Result:**
- User is redirected to `/performers/:id`  

---

## TC-052 — Booking cancel action
**Preconditions:**
- User has a booking with status "pending"  

**Steps:**
1. Click "Cancel"  

**Expected Result:**
- Cancel API is called  
- Booking status updates  
- List refreshes  

---

## TC-053 — Review button visibility
**Preconditions:**
- Booking is completed  
- No review exists  

**Steps:**
1. Open bookings list  

**Expected Result:**
- "Review" button is visible  

---

## TC-054 — Chat button visibility
**Preconditions:**
- Booking has conversationId  

**Steps:**
1. Open bookings list  

**Expected Result:**
- "Chat" button is visible  
- Navigates to chat page  

---

## TC-055 — Notifications unread count
**Preconditions:**
- User has unread notifications  

**Steps:**
1. Open dashboard  

**Expected Result:**
- Unread count badge is displayed  

---

## TC-056 — Mark notification as read
**Preconditions:**
- Notification is unread  

**Steps:**
1. Click notification  

**Expected Result:**
- Notification becomes read  
- UI updates immediately  

---

## TC-057 — Mark all notifications as read
**Preconditions:**
- Multiple unread notifications exist  

**Steps:**
1. Click "Mark all read"  

**Expected Result:**
- All notifications become read  
- Badge count resets to 0  

---

## TC-058 — Messages list displays conversations
**Preconditions:**
- User has bookings with conversations  

**Steps:**
1. Open "Messages" section  

**Expected Result:**
- List of conversations is shown  
- Each item displays performer + event info  

---

## TC-059 — Empty messages state
**Preconditions:**
- No conversations exist  

**Steps:**
1. Open "Messages"  

**Expected Result:**
- "No conversations yet" message is displayed  

---

## TC-060 — Profile info displayed correctly
**Preconditions:**
- User is logged in  

**Steps:**
1. Open "Profile"  

**Expected Result:**
- User data (name, email, city) is displayed correctly  

---
