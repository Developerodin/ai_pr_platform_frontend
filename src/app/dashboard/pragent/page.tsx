// src/app/prassistant/page.tsx
import { Metadata } from 'next';
import AIAssistantPage from '@/components/ai-assistant/AIAssistantPage';

export const metadata: Metadata = {
  title: 'AI Assistant | Tagged',
  description: 'Your intelligent partner for PR campaigns, content creation, and workflow automation',
};

export default function PRAssistantPage() {
  return <AIAssistantPage />;
}
