
## Frontend-compatible resource filtering

The resource API now supports `semester`, `subject`, `unit`, and `resourceType`.
Unit values are normalized to `Unit 1` ... `Unit 5`. Formula Sheets are treated as
semester-level resources: requesting a unit without a specific resource type
returns that unit's resources plus the semester's Formula Sheets.

Examples:
- `GET /api/resources?semester=1&unit=Unit%201`
- `GET /api/resources?semester=2&unit=Unit%203&resourceType=Video`
- `GET /api/resources?semester=1&resourceType=Formula%20Sheet`
- `GET /api/resources/search?q=differential+calculus&semester=1&unit=Unit%201`

MathVault Backend
Backend for MathVault — a resource-sharing platform for Engineering Mathematics students (Formula Sheets + Previous Year Question Papers), organized by Subject → Unit → Resource Type.
Tech stack: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, Multer, dotenv, cors.
---
1. Project Structure
```
mathvault-backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── resourceController.js
│   └── adminController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   ├── uploadMiddleware.js
│   └── errorMiddleware.js
├── models/
│   ├── User.js
│   └── Resource.js
├── routes/
│   ├── authRoutes.js
│   ├── resourceRoutes.js
│   └── adminRoutes.js
├── uploads/
│   └── resources/
├── .env.example
├── .gitignore
├── package.json
├── seedAdmin.js
├── server.js
└── README.md
```
---
2. Installation (VS Code terminal)
```bash
# 1. Open this folder in VS Code, then open a terminal (Ctrl + `)

# 2. Install dependencies (already listed in package.json)
npm install

# 3. Install nodemon as a dev dependency (already listed too, but if you started
#    from scratch you'd run this separately)
npm install --save-dev nodemon
```
Create your real `.env` file from the example:
```bash
cp .env.example .env
```
Then edit `.env` with your actual values (see Section 3).
Do NOT commit your `.env` file to GitHub — it's already in `.gitignore`.
---
3. MongoDB Atlas Setup
Go to https://www.mongodb.com/cloud/atlas and create a free account (or log in).
Click "Build a Database" → choose the free (M0) tier → pick a cloud provider/region → click Create.
Under Security → Database Access, create a database user with a username and password (save these — you'll need them).
Under Security → Network Access, click Add IP Address → choose "Allow access from anywhere" (`0.0.0.0/0`) for local development.
Go to Database → Connect on your cluster → "Drivers" → copy the connection string. It looks like:
```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
Replace `<username>` and `<password>` with your database user credentials, and add a database name before the `?`, e.g.:
```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/mathvault?retryWrites=true&w=majority
   ```
Paste this into your `.env` file as `MONGO_URI`.
`.env` file
```env
PORT=5000
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/mathvault?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_here
```
Start the server
```bash
npm run dev      # uses nodemon, auto-restarts on file changes
# or
npm start         # plain node, for normal execution
```
Verify the connection
If it worked, your terminal will show:
```
MongoDB connected: cluster0-shard-xx.xxxxx.mongodb.net
MathVault server running on port 5000
```
Visit `http://localhost:5000/` in a browser — you should see:
```json
{ "success": true, "message": "MathVault API is running" }
```
---
4. Creating the First Admin Account
Run the seed script once, after `.env` is set up and MongoDB is connected:
```bash
npm run seed:admin
```
This creates an admin account with:
Email: `admin@mathvault.com`
Password: `admin123`
To use different credentials, add these to your `.env` before running the script:
```env
ADMIN_NAME=Your Name
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_password
```
You can log in with this account via `POST /api/auth/login` like any other user — the `role: "admin"` field is what unlocks the admin routes.
---
5. File Size Limit
The max upload size is set in `middleware/uploadMiddleware.js`:
```js
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```
Change the number (in bytes) on that line to adjust it.
---
6. API Reference & Postman Testing
Base URL: `http://localhost:5000`
For any Private route, add this header in Postman:
```
Authorization: Bearer <your_token_here>
```
(Get the token from the response of Register or Login.)
Auth
POST `/api/auth/register` — Public
Body type: `raw` → `JSON`
Body:
```json
  { "name": "Nivetha", "email": "nivetha@example.com", "password": "test123" }
  ```
Response: `201` with `data.token` and `data.user`
POST `/api/auth/login` — Public
Body type: `raw` → `JSON`
Body:
```json
  { "email": "nivetha@example.com", "password": "test123" }
  ```
Response: `200` with `data.token` and `data.user`
GET `/api/auth/me` — Private
Headers: `Authorization: Bearer <token>`
Response: `200` with the current user's info
Resources
GET `/api/resources` — Public
Optional query params: `subject`, `unit`, `resourceType`
Example: `/api/resources?subject=Engineering Mathematics I&unit=Unit 1&resourceType=Formula Sheet`
Returns only `approved` resources
GET `/api/resources/search?q=matrices` — Public
Searches title, description, subject, unit, and original file name (approved only)
GET `/api/resources/user/my-resources` — Private
Headers: `Authorization: Bearer <token>`
Returns all resources (any status) uploaded by the logged-in user
GET `/api/resources/:id` — Public
Returns one resource by its MongoDB ID
POST `/api/resources` — Private
Headers: `Authorization: Bearer <token>`
Body type: `form-data` (NOT raw JSON, because of the file)
Fields:
Key	Type	Example
title	Text	Matrices Formula Sheet
description	Text	Covers eigenvalues, rank, inverse
subject	Text	Engineering Mathematics I
unit	Text	Unit 1 – Matrices
resourceType	Text	Formula Sheet
file	File	(select a PDF from your computer)
How to test file upload in Postman:
Select method `POST`, url `http://localhost:5000/api/resources`.
Go to the Body tab → select form-data.
Add each text field above as a row with type `Text`.
Add a row with key `file`, change its type dropdown from `Text` to `File`, then click Select Files and choose a PDF.
Add the `Authorization` header, then hit Send.
If uploaded by a student → `status: "pending"`. If uploaded by an admin → `status: "approved"`.
DELETE `/api/resources/:id` — Private
Headers: `Authorization: Bearer <token>`
Owner of the resource, or any admin, can delete it. Also removes the file from disk.
Admin (all require an admin JWT)
GET `/api/admin/resources/pending` — Private/Admin
PATCH `/api/admin/resources/:id/approve` — Private/Admin
No body needed
PATCH `/api/admin/resources/:id/reject` — Private/Admin
No body needed
DELETE `/api/admin/resources/:id` — Private/Admin
Deletes any resource regardless of owner
---
7. API Summary Table (for the frontend team)
Method	Endpoint	Auth	Purpose
POST	/api/auth/register	Public	Register a new student account
POST	/api/auth/login	Public	Log in, get a JWT
GET	/api/auth/me	Private	Get the logged-in user's profile
GET	/api/resources	Public	List approved resources (filterable)
GET	/api/resources/search?q=	Public	Search approved resources
GET	/api/resources/user/my-resources	Private	List the logged-in user's own uploads
GET	/api/resources/:id	Public	Get one resource by ID
POST	/api/resources	Private	Upload a new resource (multipart/form-data)
DELETE	/api/resources/:id	Private	Delete own resource (or any, if admin)
GET	/api/admin/resources/pending	Private/Admin	List pending resources
PATCH	/api/admin/resources/:id/approve	Private/Admin	Approve a resource
PATCH	/api/admin/resources/:id/reject	Private/Admin	Reject a resource
DELETE	/api/admin/resources/:id	Private/Admin	Delete any resource
---
8. Frontend Integration Guide
Register: `POST /api/auth/register` with `{ name, email, password }`. Save the returned `data.token`.
Login: `POST /api/auth/login` with `{ email, password }`. Save the returned `data.token`.
Store JWT: Save `data.token` in memory or `localStorage` on the frontend (e.g., `localStorage.setItem("token", data.token)`).
Send JWT: On every private request, add header `Authorization: Bearer <token>`.
Fetch formula sheets: `GET /api/resources?resourceType=Formula Sheet`
Fetch question papers: `GET /api/resources?resourceType=Question Paper`
Filter by subject: `GET /api/resources?subject=Engineering Mathematics I`
Filter by unit: `GET /api/resources?unit=Unit 1 – Matrices`
Search resources: `GET /api/resources/search?q=matrices`
Upload a PDF: `POST /api/resources` as `multipart/form-data`, with the JWT header, including a `file` field.
View/download a PDF: use the `fileUrl` returned in any resource object directly as a link (e.g., `<a href={resource.fileUrl}>Download</a>`).
View user's uploaded resources: `GET /api/resources/user/my-resources` with the JWT header.
Delete a resource: `DELETE /api/resources/:id` with the JWT header.
---
9. Sample Data (for manual testing only — metadata only, not real content)
Matrices Formula Sheet — Engineering Mathematics I / Unit 1 – Matrices / Formula Sheet
Differential Calculus Formula Sheet — Engineering Mathematics I / Unit 2 – Differential Calculus / Formula Sheet
Integral Calculus Formula Sheet — Engineering Mathematics II / Unit 3 – Integral Calculus / Formula Sheet
Engineering Mathematics Previous Year Question Paper — Engineering Mathematics I / Unit 1 – Matrices / Question Paper
Multiple Integrals Question Paper — Engineering Mathematics II / Unit 4 – Multiple Integrals / Question Paper
(Upload these through Postman using the file-upload steps above, with any small PDF as the test file.)
---
10. Future AI Feature (not implemented yet)
The current backend intentionally does NOT include AI features, to keep the project simple and reliable before the deadline. Later, you could add:
AI-generated summary of an uploaded formula sheet (extract text from the PDF, send it to an LLM, store the summary alongside the resource).
AI-generated practice questions based on a formula sheet's content.
AI chatbot for Engineering Mathematics doubts, as a separate `/api/chatbot` route that calls an LLM API.
These would layer on top of the existing `Resource` model without needing to change the current authentication or upload logic.
---
11. Final Checklist
[ ] Project created
[ ] Dependencies installed (`npm install`)
[ ] MongoDB connected
[ ] Server running (`npm run dev`)
[ ] Register working
[ ] Login working
[ ] JWT authentication working
[ ] Resource upload working
[ ] PDF validation working
[ ] Formula sheet upload working
[ ] Question paper upload working
[ ] Resource listing working
[ ] Subject filtering working
[ ] Unit filtering working
[ ] Search working
[ ] My resources working
[ ] Admin approval working
[ ] Admin rejection working
[ ] Delete working
[ ] PDF URL working (accessible via `/uploads/resources/<filename>`)
[ ] Frontend API connection ready
---
12. Common Errors & What They Mean
Error	Cause
`MongoDB connection error`	Wrong `MONGO_URI`, wrong password, or IP not whitelisted in Atlas Network Access
`Invalid resource ID`	The `:id` in the URL isn't a valid MongoDB ObjectId
`email already exists`	Trying to register with an email already in the database
`Invalid or expired token`	JWT is malformed, wrong secret, or expired (7-day expiry)
`File too large`	Uploaded file exceeds the 10MB limit in `uploadMiddleware.js`
`Invalid file type`	Uploaded something other than PDF/DOC/DOCX
`Access denied. Admins only.`	Logged-in user's role is `student`, not `admin`
