# Living Library

A personalized digital library to track your reading journey, discover insights from your books, and keep the wisdom alive.

## Features

- **Virtual Bookshelf**: key track of the books you've read.
- **Year-Based Tracking**: Organize your reading history by the year you finished each book.
- **Daily Excerpts**: Receive a daily "gem" (quote) from your collection on the homepage to spark inspiration.
- **Notes & Reflection**: Add personal notes and takeaways for each book.
- **Smart Extracts**: Automatically generate excerpts from your books using AI (powered by Gemini) if you don't have one handy.
- **Email Reminders**: (Optional) Configure daily or weekly email delivery of your book excerpts.
- **Customizable Profile**: Choose a fun avatar from the sprite collection.
- **Mobile Friendly**: Totally responsive design that works great on your phone.
- **Dark Mode UI**: Sleek, modern dark-themed interface.

## Tech Stack

### Client
- **React**: UI library
- **Vite**: Build tool and dev server
- **SCSS Modules**: For modular, scoped styling
- **React Router**: Navigation

### Server
- **Node.js & Express**: Backend API
- **DynamoDB**: NoSQL Database (AWS SDK v3)
- **Google Generative AI**: For generating book excerpts
- **Nodemailer**: For email notifications
- **JWT**: Secure authentication

## Getting Started

### Prerequisites
- Node.js (v18+)
- AWS Credentials configured (for DynamoDB access)
- Gemini API Key (for AI features)
- Gmail App Password (if using email features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd living-bookshelf
    ```

2.  **Install Server Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5001
JWT_SECRET=your_super_secret_key
# AWS Configuration (if not using default profile)
AWS_REGION=eu-west-3
DYNAMODB_TABLE_NAME=Books
USERS_TABLE_NAME=Users

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

### Running the App

1.  **Start the Backend Server**
    ```bash
    cd server
    npm run dev
    ```
    Server will run on `http://localhost:5001`.

2.  **Start the Frontend Client**
    (In a new terminal)
    ```bash
    cd client
    npm run dev
    ```
    Client will run on `http://localhost:5173`.

3.  Open your browser and navigate to `http://localhost:5173`!

## License

[MIT](LICENSE)
