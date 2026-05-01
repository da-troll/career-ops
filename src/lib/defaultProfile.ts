import type { UserProfile } from '../types'

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Daniel Tollefsen',
  title: 'Head of Product — AI, Automation & Integrations',
  location: 'Oslo, Norway (open to remote)',
  summary:
    'Product leader specializing in AI-native products, workflow automation, and enterprise SaaS integrations. Building agentic AI systems that turn complex multi-step processes into autonomous pipelines. Track record shipping AI features at scale in enterprise environments.',
  skills: [
    'AI product strategy',
    'Agentic systems',
    'Workflow automation',
    'Enterprise SaaS integrations',
    'OpenAI API',
    'n8n',
    'Supabase',
    'Product roadmapping',
    'Stakeholder alignment',
    'Technical product management',
  ],
  experience:
    'Head of Product AI/Automation/Integrations — leading the product vision for AI-native automation tools targeting enterprise customers. Built and shipped multiple AI-powered features including an agent household (Eve, Wilson, Pepper, Radar, C-3PO) for autonomous household ops. Prior background in enterprise SaaS product management.',
  preferences: {
    remote: 'preferred',
    teamSize: 'scaleup',
    industry: ['AI/ML', 'Enterprise SaaS', 'Developer Tools', 'Automation'],
    roleTypes: ['Head of Product', 'VP Product', 'Director of Product', 'CPO'],
  },
}
