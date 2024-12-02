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
    "title": "AI-Powered Chat Service for Instant Assistance",
    "description": "Use the **AkashChat API** to provide real-time, interactive AI-powered chat services. The AI bot can handle customer support, offer instant information, and engage users in personalized conversations based on their inputs and preferences.",
    "icon": "ChatBubbleLeftRight",
    "color": "text-blue-500"
  },
  {
    "title": "Real-Time Audio Transcription and Translation",
    "description": "Leverage **Rag AI**'s advanced speech recognition and natural language processing capabilities to provide real-time transcription and translation of audio content. Users can upload or stream audio, and the system will transcribe it into text while offering real-time language translation for multilingual support.",
    "icon": "Microphone",
    "color": "text-purple-500"
  },
  {
    "title": "AI-Generated Images from Text Descriptions",
    "description": "Utilize **LLamaVision**'s image generation and decoding capabilities to create unique images from user-generated text prompts. Users can input detailed descriptions, and the AI will generate corresponding visual representations, helping designers, marketers, and creatives quickly prototype visuals.",
    "icon": "Image",
    "color": "text-red-500"
  },
  {
    "title": "Decoding and Analyzing Images with AI",
    "description": "Leverage **LLamaVision** for advanced image recognition and decoding. This can include extracting text from images (OCR), identifying objects, and analyzing visual content to offer detailed insights. It can be used for applications like security, accessibility, and data extraction from images.",
    "icon": "Photo",
    "color": "text-green-500"
  },
  {
    "title": "AI-Driven Voice Interaction for Enhanced User Experience",
    "description": "Integrate **Rag AI**'s AI voice capabilities to provide natural language speech synthesis and recognition. Users can interact with the app using voice commands, which are processed by the AI to give intelligent responses and actions, making it suitable for hands-free operations or accessibility.",
    "icon": "Speakerphone",
    "color": "text-yellow-500"
  },
  {
    "title": "Git Repository Analysis and Code Insights",
    "description": "Use the **AkashChat API** to analyze Git repositories and provide insights into code structure, commit history, and dependencies. Developers can ask the AI for code reviews, get suggestions on best practices, and receive detailed reports on repository health and quality.",
    "icon": "Code",
    "color": "text-indigo-500"
  },
  {
    "title": "Audio-Based Code Analysis for Debugging and Suggestions",
    "description": "Integrate **Rag AI** with your app to transcribe and analyze audio-based queries related to Git repositories or code-related issues. Developers can speak their coding problems, and the AI will transcribe and offer debugging suggestions, along with analyzing the repository for potential fixes.",
    "icon": "Microphone",
    "color": "text-pink-500"
  },
  {
    "title": "Voice-Activated Git Repository Search and Commands",
    "description": "Utilize **AkashChat API** with integrated AI voice capabilities to enable voice-activated search and commands in Git repositories. Developers can say commands like 'Show me the latest commits' or 'Find bugs in the repository', and the AI will process them and provide relevant information.",
    "icon": "Voice",
    "color": "text-cyan-500"
  },
  {
    "title": "Instant Image Analysis and Feedback via Voice",
    "description": "With **LLamaVision**, enable users to upload images and receive instant voice-based feedback. Whether it’s object recognition, decoding text, or analyzing visual content, users can ask questions about images and get immediate voice responses, offering a more interactive experience.",
    "icon": "Photo",
    "color": "text-orange-500"
  }
];


const stats = [
  { number: '30+', label: 'Chats', icon: Languages },
  { number: '1M+', label: 'Active Users', icon: Users },
  { number: '50M+', label: 'Audios Reformed', icon: BookOpen },
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
                  <feature.icon  />
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