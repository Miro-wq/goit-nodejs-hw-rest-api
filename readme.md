# Node.js REST API with Docker and Email Verification

This is a complete **Node.js REST API** application that includes features such as user authentication, email verification, and Docker integration. The application is built with **Express.js**, **MongoDB**, and **SendGrid** for email services.

---

## **Features**
- User signup and login with email/password authentication.
- Email verification using **SendGrid**.
- Protected routes with **JWT-based authentication**.
- Contact management (CRUD operations) for authenticated users.
- Dockerized for portability and ease of deployment.

---

## **Getting Started**

Follow these instructions to get the application running on your local machine or in a Docker container.

### **Prerequisites**
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [SendGrid](https://sendgrid.com/)

---

## **Installation**

1. Clone this repository:
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory and add the following environment variables:
```bash
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST=mongodb+srv://username:password@cluster0.oc5wu.mongodb.net/db-contacts?retryWrites=true&w=majority
SECRET_KEY=your_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

4. Start the application:
```bash
  npm start
```

The server will run on http://localhost:3000.

## **Running with Docker**

1. Build the Docker image
```bash
docker build -t nodejs-app .
```

2. Run the Docker container
You can pass environment variables directly:
```bash
docker run -p 3000:3000 \
  -e DB_USERNAME=your_username \
  -e DB_PASSWORD=your_password \
  -e DB_HOST=mongodb+srv://username:password@cluster0.oc5wu.mongodb.net/db-contacts?retryWrites=true&w=majority \
  -e SECRET_KEY=your_secret_key \
  -e SENDGRID_API_KEY=your_sendgrid_api_key \
  nodejs-app
```
Or use a .env file:
```bash
docker run -p 3000:3000 --env-file .env nodejs-app
```

# API Documentation
## Authentication

**Signup**
- POST `/api/users/signup`
- Request Body:
```json
{
  "email": "example@example.com",
  "password": "examplepassword"
}
```
- Response:
```json
{
  "user": {
    "email": "example@example.com",
    "subscription": "starter",
    "avatarURL": "https://gravatar.com/avatar/..."
  }
}
```

**Login**
- POST `/api/users/login`
- Request Body:
```json
{
  "email": "example@example.com",
  "password": "examplepassword"
}
```
- Response:
```json
{
  "token": "your-jwt-token",
  "user": {
    "email": "example@example.com",
    "subscription": "starter"
  }
}
```

**Email Verification**
- GET `/api/users/verify/:verificationToken`
- Verifies the user's email.

**Resend Verification Email**
- POST `/api/users/verify`
- Request Body:
```json
{
  "email": "example@example.com"
}
```

**Contacts**

Get All Contacts
- GET `/api/contacts`
Create a Contact
- POST `/api/contacts`
- Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```
Update Contact
- PUT `/api/contacts/:contactId`

Delete Contact
- DELETE `/api/contacts/:contactId`

## **Folder Structure**
```plaintext
.
├── Dockerfile
├── .dockerignore
├── .env.example
├── README.md
├── package.json
├── app.js
├── server.js
├── models/
│   └── user.js
│   └── contact.js
├── routes/
│   └── api/
│       └── users.js
│       └── contacts.js
├── helpers/
│   └── sendEmail.js
```
License
This project is licensed under the MIT License.
