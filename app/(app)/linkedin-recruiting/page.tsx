'use client';

import { useState, useEffect } from 'react';
import { LinkedInRecruitingDashboard, TechnicalCandidate, RecruitingFilters } from '@/components/linkedin/linkedin-recruiting-dashboard';
import { toast } from 'sonner';

export default function LinkedInRecruitingPage() {
  const [candidates, setCandidates] = useState<TechnicalCandidate[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for development
  const mockCandidates: TechnicalCandidate[] = [
    {
      id: 'candidate_1',
      firstName: 'Sarah',
      lastName: 'Chen',
      headline: 'Senior Full Stack Engineer @ Stripe | React, Node.js, TypeScript',
      location: 'San Francisco, CA',
      company: 'Stripe',
      experience: '6 years in fintech and e-commerce',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
      industry: 'Financial Technology',
      seniority: 'Senior',
      profileUrl: 'https://linkedin.com/in/sarahchen',
      connectionDegree: '2nd',
      premium: true,
      lastActive: '2024-01-15',
      recruitable: true,
      salaryRange: { min: 150000, max: 200000, currency: 'USD' },
      techStack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
      yearsExperience: 6,
      openToWork: false,
      score: 94,
      matchReasons: ['Senior React experience', 'Fintech background', 'Strong TypeScript skills']
    },
    {
      id: 'candidate_2',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      headline: 'Staff Software Engineer @ Google | Go, Kubernetes, Distributed Systems',
      location: 'Mountain View, CA',
      company: 'Google',
      experience: '8 years in large-scale distributed systems',
      skills: ['Go', 'Kubernetes', 'Docker', 'PostgreSQL', 'GCP'],
      industry: 'Technology',
      seniority: 'Principal',
      profileUrl: 'https://linkedin.com/in/michaelrodriguez',
      connectionDegree: '3rd',
      premium: false,
      lastActive: '2024-01-14',
      recruitable: true,
      salaryRange: { min: 200000, max: 280000, currency: 'USD' },
      techStack: ['Go', 'Kubernetes', 'Docker', 'Microservices', 'GCP', 'Terraform'],
      yearsExperience: 8,
      openToWork: true,
      score: 91,
      matchReasons: ['Principal level', 'Distributed systems expert', 'Open to work']
    },
    {
      id: 'candidate_3',
      firstName: 'Emily',
      lastName: 'Watson',
      headline: 'Frontend Lead @ Airbnb | React, Vue.js, Design Systems',
      location: 'San Francisco, CA',
      company: 'Airbnb',
      experience: '7 years in frontend development and design systems',
      skills: ['React', 'Vue.js', 'JavaScript', 'CSS', 'Design Systems'],
      industry: 'Technology',
      seniority: 'Lead',
      profileUrl: 'https://linkedin.com/in/emilywatson',
      connectionDegree: '2nd',
      premium: true,
      lastActive: '2024-01-16',
      recruitable: true,
      salaryRange: { min: 170000, max: 220000, currency: 'USD' },
      techStack: ['React', 'Vue.js', 'TypeScript', 'Storybook', 'Figma', 'CSS-in-JS'],
      yearsExperience: 7,
      openToWork: false,
      score: 87,
      matchReasons: ['Frontend leadership', 'Design systems experience', 'Strong React skills']
    },
    {
      id: 'candidate_4',
      firstName: 'David',
      lastName: 'Kim',
      headline: 'DevOps Engineer @ Netflix | AWS, Terraform, CI/CD',
      location: 'Los Gatos, CA',
      company: 'Netflix',
      experience: '5 years in cloud infrastructure and automation',
      skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Python'],
      industry: 'Entertainment Technology',
      seniority: 'Senior',
      profileUrl: 'https://linkedin.com/in/davidkim',
      connectionDegree: '1st',
      premium: false,
      lastActive: '2024-01-13',
      recruitable: true,
      salaryRange: { min: 140000, max: 180000, currency: 'USD' },
      techStack: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Python', 'Jenkins', 'Prometheus'],
      yearsExperience: 5,
      openToWork: true,
      score: 89,
      matchReasons: ['DevOps expertise', 'AWS certified', 'Open to work', '1st connection']
    },
    {
      id: 'candidate_5',
      firstName: 'Priya',
      lastName: 'Patel',
      headline: 'Machine Learning Engineer @ OpenAI | Python, TensorFlow, LLMs',
      location: 'San Francisco, CA',
      company: 'OpenAI',
      experience: '4 years in ML and AI research',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP'],
      industry: 'Artificial Intelligence',
      seniority: 'Mid',
      profileUrl: 'https://linkedin.com/in/priyapatel',
      connectionDegree: '3rd',
      premium: true,
      lastActive: '2024-01-15',
      recruitable: true,
      salaryRange: { min: 180000, max: 250000, currency: 'USD' },
      techStack: ['Python', 'TensorFlow', 'PyTorch', 'Transformers', 'AWS', 'MLOps'],
      yearsExperience: 4,
      openToWork: false,
      score: 92,
      matchReasons: ['AI/ML expertise', 'LLM experience', 'High-growth company background']
    }
  ];

  useEffect(() => {
    // Load initial mock data
    setCandidates(mockCandidates);
  }, []);

  const handleSearch = async (filters: RecruitingFilters) => {
    setLoading(true);
    
    try {
      // Mock API call - replace with actual LinkedIn API integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filter mock candidates based on search criteria
      let filteredCandidates = mockCandidates;
      
      if (filters.role) {
        filteredCandidates = filteredCandidates.filter(c => 
          c.headline.toLowerCase().includes(filters.role!.toLowerCase())
        );
      }
      
      if (filters.skills && filters.skills.length > 0) {
        filteredCandidates = filteredCandidates.filter(c =>
          filters.skills!.some(skill => c.techStack.includes(skill))
        );
      }
      
      if (filters.location) {
        filteredCandidates = filteredCandidates.filter(c =>
          c.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      if (filters.seniority && filters.seniority.length > 0) {
        filteredCandidates = filteredCandidates.filter(c =>
          filters.seniority!.includes(c.seniority)
        );
      }
      
      if (filters.openToWork) {
        filteredCandidates = filteredCandidates.filter(c => c.openToWork);
      }
      
      setCandidates(filteredCandidates);
      
      toast.success(`Found ${filteredCandidates.length} candidates matching your criteria`);
      
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (candidateId: string, message?: string) => {
    try {
      // Mock API call for connection request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const candidate = candidates.find(c => c.id === candidateId);
      toast.success(`Connection request sent to ${candidate?.firstName} ${candidate?.lastName}`);
      
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleMessage = async (candidateId: string, message: string) => {
    try {
      // Mock API call for sending message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const candidate = candidates.find(c => c.id === candidateId);
      toast.success(`Message sent to ${candidate?.firstName} ${candidate?.lastName}`);
      
    } catch (error) {
      console.error('Message error:', error);
      toast.error('Failed to send message');
    }
  };

  const handleAddToSequence = async (candidateIds: string[], sequenceId: string) => {
    try {
      // Mock API call for adding to sequence
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Added ${candidateIds.length} candidates to sequence`);
      
    } catch (error) {
      console.error('Sequence error:', error);
      toast.error('Failed to add candidates to sequence');
    }
  };

  return (
    <LinkedInRecruitingDashboard
      onSearch={handleSearch}
      onConnect={handleConnect}
      onMessage={handleMessage}
      onAddToSequence={handleAddToSequence}
      candidates={candidates}
      loading={loading}
    />
  );
}
