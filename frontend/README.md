# LinguaMate

LinguaMate is an interactive language learning platform designed to help users master new languages through personalized learning paths, interactive lessons, and real-time conversations.

## Features

### Core Functionality
- **User Authentication**: Secure email and password-based authentication system
- **Personalized Learning**: Tailored learning paths based on user proficiency
- **Interactive Lessons**: Engaging content for effective language acquisition
- **Multiple Languages**: Support for over 30 languages
- **Progress Tracking**: Monitor your learning journey with detailed statistics

### Technical Features
- Modern, responsive UI built with Next.js 15
- Server-side rendering for optimal performance
- Type-safe development with TypeScript
- Secure authentication using Next-Auth
- Form validation using Zod
- Real-time feedback with toast notifications
- Dark mode support
- Tailwind CSS for styling

## Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Toast Notifications**: Sonner

### Backend
- **Authentication**: Next-Auth
- **Database**: (Your database choice)
- **Validation**: Zod
- **API**: Next.js Server Actions

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- (Any other prerequisites)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/linguamate.git
```

2. Install dependencies
```bash
cd linguamate
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Fill in your environment variables in `.env.local`

4. Run the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

### Environment Variables

Create a `.env.local` file with the following variables:
```env
# Get your OpenAI API Key here: https://platform.openai.com/account/api-keys
OPENAI_API_KEY=


# Generate a random secret: https://generate-secret.vercel.app/32 or `openssl rand -base64 32`
AUTH_SECRET=

GOOGLE_API_KEY=

# Instructions to create kv database here: https://vercel.com/docs/storage/vercel-blob
BLOB_READ_WRITE_TOKEN=


POSTGRES_URL=

```

## Project Structure

```
linguamate/
├── app/                   # Next.js app directory
├── components/           # Reusable components
├── lib/                  # Utility functions and shared logic
├── public/              # Static assets
├── styles/              # Global styles
└── types/               # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting solutions
- shadcn/ui for the beautiful components
- Gemini API
- All contributors and supporters of the project

## Support

For support, please open an issue in the GitHub repository or contact us at (your contact information).

## Contact



## Roadmap

- [ ] Add voice recognition features
- [ ] Implement AI-powered conversation practice
- [ ] Add gamification elements
- [ ] Integrate with language learning APIs
- [ ] Add community features
- [ ] Implement progress sharing
- [ ] Add mobile app support

---

Made with ❤️ by (Your Name/Team Name)
