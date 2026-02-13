/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@lunaz/ui';

describe('Manage app smoke test', () => {
  it('Button from @lunaz/ui renders', () => {
    render(<Button>Admin Action</Button>);
    expect(screen.getByRole('button', { name: /admin action/i })).toBeInTheDocument();
  });
});
