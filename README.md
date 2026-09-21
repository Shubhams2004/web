# Shubham Sonale | Research Writer

A research-focused web application for discovering trending business case studies and corporate strategy insights. The site combines live market catalysts, business news, public filings, and AI-assisted research to turn current events into structured, empirical case studies.

**Live site:** [shubhamsonale2004-ux.github.io/web](https://shubhamsonale2004-ux.github.io/web/)

## Features

- Browse trending business and corporate strategy case studies.
- Fetch live business news and RSS stories.
- Generate new case studies from a headline, source, URL, and summary using Groq AI.
- Graceful fallback data when external services are unavailable.
- Responsive React interface with motion and icon support.
- Express server for API routes and production static-file serving.

## Tech stack

- React 19 and TypeScript
- Vite
- Tailwind CSS 4
- Express
- Groq SDK
- SWR
- Motion
- Sharp
- Bun or npm

## Requirements

- Node.js 20.11 or newer
- npm 10 or newer
- A Groq API key for AI-generated case studies

## Getting started

1. Clone the repository and enter the project directory:

   ```bash
   git clone https://github.com/shubhamsonale2004-ux/web.git
   cd web
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

4. Add your API credentials to `.env`:

   ```dotenv
   GROQ_API_KEY=your_groq_api_key
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   The app is available at [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000. |
| `npm run build` | Build the frontend for production. |
| `npm run preview` | Preview the production build on port 4173. |
| `npm start` | Start the Express production server. |
| `npm run typecheck` | Run TypeScript checks without emitting files. |
| `npm run lint` | Run the project checks. |
| `npm run clean` | Remove generated build and server files. |

## Environment variables

See `.env.example` for the available configuration values:

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Recommended | Enables AI-powered case-study generation. |
| `GEMINI_API_KEY` | Optional | Gemini integration key, when applicable. |
| `APP_URL` | Optional | The deployed application URL used for application links and callbacks. |
| `PORT` | Optional | Express server port; defaults to `3000`. |

Never commit `.env` or expose API keys in client-side code.

## API endpoints

- `GET /api/business-case-studies` — Return available case studies.
- `GET /api/business-rss` — Return current business RSS stories.
- `POST /api/business-case-studies/generate` — Generate a case study from a supplied headline and source data.

The API also supports the `/web`-prefixed versions of these routes for the deployed GitHub Pages path.

## Project structure

```text
├── public/                 # Static assets
├── src/                    # React application and server-side services
├── index.html              # HTML entry point and SEO metadata
├── server.js               # Express API and production server
├── vite.config.ts          # Vite configuration
├── metadata.json           # Application metadata
└── .env.example            # Environment variable template
```

## Deployment

Build the frontend with:

```bash
npm run build
```

For a Node-based deployment, start the Express server with:

```bash
npm start
```

The repository is also configured for the published site at [shubhamsonale2004-ux.github.io/web](https://shubhamsonale2004-ux.github.io/web/).

## License

No license has been specified yet.
