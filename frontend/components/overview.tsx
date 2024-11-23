import { motion } from 'framer-motion';
import Link from 'next/link';
import { Languages, Mic, BookOpen } from 'lucide-react';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <Languages size={32} />
          <span>+</span>
          <Mic size={32} />
        </p>
        <p>
          Welcome to{' '}
          <span className="font-medium text-blue-600">LinguaMate</span>, your
          personal AI-powered assistant for improving pronunciation and fluency
          in any language. LinguaMate uses advanced speech recognition and AI
          feedback to help you perfect your accent and improve your confidence
          in speaking.
        </p>
        <p>
          Whether you&apos;re learning a new language or polishing your skills,{' '}
          <span className="font-medium">LinguaMate</span> provides tailored
          exercises and real-time guidance. Learn with interactive activities,
          personalized feedback, and a seamless learning experience.
        </p>
        <p>
          Explore more features and get started with LinguaMate today by
          visiting our{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="/features"
          >
            Features Page
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};