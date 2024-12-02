import { motion } from 'framer-motion';
import Link from 'next/link';
import { Languages, Mic, BookOpen, ImageDown, GitBranch } from 'lucide-react';
import Markdown from 'react-markdown';

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
       <Markdown>
       ### Introduction to LLaMA with Extended Capabilities  

The **LLaMA Family Large Language Model (LLM)** introduces a new era of advanced artificial intelligence 
designed to seamlessly integrate multiple modalities and real-time capabilities.
 This cutting-edge model extends beyond traditional text-based interaction,
  empowering users with access to a diverse range of features:  

1. **Text Generation and Comprehension**  

2. **Web Search and Knowledge Retrieval**  

3. **URL Fetching**  


How can this LLM assist you today? 😊
       </Markdown>
      </div>
    </motion.div>
  );
};





export const ImageOverview = () => {
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
        <p>
          Welcome to{' '}
          <span className="font-medium text-blue-600">LlamaVision AI</span>, where the art of visual content meets the power of advanced AI.
          Revolutionizing the way you analyze, interpret, and create visuals, 
          <span className=' font-medium'>LlamaVision AI</span> brings cutting-edge technology to the forefront of your creative and professional projects. Whether you're in marketing, design, security, or any field that relies on imagery,
           <span className=' font-medium'>LlamaVision AI</span> enhances your workflow and helps you unlock new possibilities.
        </p>
        <p>
        <span className=' font-medium'>LlamaVision AI</span> is your all-in-one solution for powerful visual recognition, enhancement, and generation—empowering you to see the world like never before
        </p>
        <p>
          Explore more features and get started with AkashImage AI Generator today by
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


export const PixtralOverview = () => {
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
         <ImageDown />
        <p>
          Welcome to{' '}
          <span className="font-medium text-blue-600">Pixtral AI</span>, the cutting-edge artificial intelligence platform
          Whether you're an artist, designer, marketer, or content creator,
           <span className=' font-medium'>Pixtral AI</span> empowers you to push the boundaries of your creativity like never before.
        </p>
        <p>
        Harness the power of advanced machine learning algorithms and deep neural 
        networks to generate stunning visuals, enhance photos, and create captivating designs—all with just a few clicks.
        </p>
        <p>
          Explore more features and get started with AkashImage AI Generator today by
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


export const RagOverview = () => {
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
         <p className=' text-center w-full'> <GitBranch /> </p>
        <Markdown >
        ### **Transform Your Data into Action with RAG AI**

Welcome to **RAG AI**—the next generation of intelligent, data-driven decision-making. 
Powered by advanced AI and cutting-edge retrieval-augmented generation technology, 
RAG AI helps you harness the full potential of your data, turning it into valuable insights and actionable solutions in real-time. 
Whether you're optimizing customer experiences, enhancing your business operations, or automating complex tasks, 
RAG AI takes data processing and interaction to a whole new level.

### **Revolutionize Your Business with RAG AI**
Analyze your github

        </Markdown>
      </div>
    </motion.div>
  );
};



