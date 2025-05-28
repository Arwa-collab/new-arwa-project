# new-project-arwa

## Description
This project is a web application built with Next.js that allows users to submit requests for products. It integrates with Firebase Firestore for data storage and retrieval. The application includes features for managing requests, updating their statuses, and generating Word documents for accepted requests.

## Features
- User authentication and role-based access control.
- Fetching and displaying requests from Firestore.
- Updating request statuses (accepted or refused).
- Generating Word documents for accepted requests.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd new-project-arwa
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Set up Firebase:
   - Create a Firebase project and configure Firestore.
   - Add your Firebase configuration to the `src/lib/firebase.ts` file.

5. Run the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:3000`.

## Usage
- Access the application and log in with your credentials.
- Users with the "responsable" role can view and manage requests.
- Accepted requests can be converted into Word documents.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.