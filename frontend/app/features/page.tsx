'use client';

import {
  BookOpen,
  Brain,
  Globe2,
  Headphones,
  Languages,
  LineChart,
  MessageCircle,
  Mic,
  PersonStanding,
  Bot,
  Target,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    title: 'Interactive Lessons',
    description: 'Engaging, multimedia-rich lessons designed by language experts for effective learning.',
    icon: BookOpen,
    color: 'text-blue-500',
  },
  {
    title: 'AI-Powered Practice',
    description: 'Practice conversations with our advanced AI tutors that adapt to your learning pace.',
    icon: Bot,
    color: 'text-purple-500',
  },
  {
    title: 'Speech Recognition',
    description: 'Perfect your pronunciation with real-time feedback on your speaking.',
    icon: Mic,
    color: 'text-red-500',
  },
  {
    title: 'Native Speaker Sessions',
    description: 'Connect with native speakers for authentic conversation practice.',
    icon: MessageCircle,
    color: 'text-green-500',
  },
  {
    title: 'Progress Tracking',
    description: 'Visualize your learning journey with detailed progress analytics.',
    icon: LineChart,
    color: 'text-yellow-500',
  },
  {
    title: 'Personalized Learning',
    description: 'Custom learning paths adapted to your goals and proficiency level.',
    icon: Target,
    color: 'text-indigo-500',
  },
  {
    title: 'Cultural Insights',
    description: 'Learn about the cultures behind the languages youre studying.',
    icon: Globe2,
    color: 'text-pink-500',
  },
  {
    title: 'Vocabulary Builder',
    description: 'Expand your vocabulary with smart flashcards and spaced repetition.',
    icon: Brain,
    color: 'text-cyan-500',
  },
  {
    title: 'Audio Lessons',
    description: 'Learn on the go with downloadable audio lessons and podcasts.',
    icon: Headphones,
    color: 'text-orange-500',
  },
];

const stats = [
  { number: '30+', label: 'Languages', icon: Languages },
  { number: '1M+', label: 'Active Users', icon: Users },
  { number: '50M+', label: 'Lessons Completed', icon: BookOpen },
  { number: '95%', label: 'Success Rate', icon: Target },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl mb-6">
          Unlock Your Language Learning Potential
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover why millions choose AkashChat to achieve their language learning goals
        </p>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-200"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-4 text-blue-500" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="transform hover:scale-105 transition-transform duration-200"
            >
              <CardHeader>
                <div className={`${feature.color} mb-4`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-20">
        <Card className="max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ready to Start Your Language Learning Journey?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Join millions of learners worldwide and start speaking a new language with confidence.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/register">Get Started for Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}