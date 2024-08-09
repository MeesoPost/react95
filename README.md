# MS Maas95 - Windows 95 Themed Movie/Series Request System

MS Maas95 is a nostalgic Windows 95 themed web application built with Next.js, React95, and TypeScript. It allows users to submit requests for movies and series in a fun, retro-styled interface.

## Features

- Windows 95 inspired user interface
- Movie and series search functionality using TMDB API
- Request submission form
- Email notifications for new requests
- PostgreSQL database integration
- Responsive design

## Technologies Used

- [Next.js](https://nextjs.org/)
- [React95](https://github.com/arturbien/React95)
- [TypeScript](https://www.typescriptlang.org/)
- [Styled Components](https://styled-components.com/)
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [TMDB API](https://www.themoviedb.org/documentation/api)
- [Nodemailer](https://nodemailer.com/)

## Getting Started

### Prerequisites

- Node.js (version 14 or later)
- npm or yarn
- A TMDB API key
- A Vercel account (for deployment and Postgres database)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ms-maas95.git
   cd ms-maas95
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:

   ```
   TMDB_API_KEY=your_tmdb_api_key
   POSTGRES_URL=your_vercel_postgres_url
   EMAIL_HOST=your_email_host
   EMAIL_PORT=your_email_port
   EMAIL_USER=your_email_username
   EMAIL_PASS=your_email_password
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Contains the main application code
  - `page.tsx`: The main page component
  - `request/page.tsx`: The request submission page
  - `api/`: API routes for search and submit functionality
- `public/`: Static assets
- `styles/`: Global styles and theme configurations

## Deployment

This project is designed to be deployed on Vercel. Follow these steps:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Configure your environment variables in the Vercel dashboard.
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React95](https://github.com/arturbien/React95) for the amazing Windows 95 components
- [TMDB](https://www.themoviedb.org/) for their comprehensive movie and TV series database
- [Vercel](https://vercel.com) for their excellent hosting and database services
