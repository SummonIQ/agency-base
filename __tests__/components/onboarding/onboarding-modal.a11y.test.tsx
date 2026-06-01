import { axe } from 'jest-axe';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { OnboardingProvider } from '@/components/onboarding/onboarding-context';

// Mock the onboarding context to control the modal state for testing
jest.mock('@/components/onboarding/onboarding-context', () => ({
  useOnboarding: jest.fn().mockReturnValue({
    isOnboarding: true,
    currentStep: 'welcome',
    nextStep: jest.fn(),
    prevStep: jest.fn(),
    skipOnboarding: jest.fn(),
  }),
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('OnboardingModal Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <OnboardingProvider>
        <OnboardingModal />
      </OnboardingProvider>
    );
    
    // Wait for any async rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper accessible elements and attributes', async () => {
    render(
      <OnboardingProvider>
        <OnboardingModal />
      </OnboardingProvider>
    );
    
    // Check for important accessibility attributes
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    
    // Check for proper ARIA attributes
    const dialog = document.querySelector('[aria-labelledby="onboarding-title"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-describedby', 'onboarding-description');
    
    // Check for proper button accessibility
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});
