import React from 'react';
import { render } from "@testing-library/react";
import App from './App';

it('renders without crashing', () => {
  render(<App />);
});
describe('SettingsPage', () => {
    it('displays user ID correctly', () => {
        const { getByText } = render(<SettingsPage />);
        expect(getByText(/Your unique User ID:/)).toBeInTheDocument();
    });

    it('shows "N/A" when userId is not provided', () => {
        const { getByText } = render(<SettingsPage />);
        expect(getByText(/Your unique User ID: N\/A/)).toBeInTheDocument();
    });

    it('renders membership status as "Paid" when isPaidMember is true', () => {
        const { getByText } = render(<SettingsPage />);
        expect(getByText(/Membership Status: Paid/)).toBeInTheDocument();
    });

    it('renders membership status as "Free" when isPaidMember is false', () => {
        const { getByText } = render(<SettingsPage />);
        expect(getByText(/Membership Status: Free/)).toBeInTheDocument();
    });

    it('displays notification preferences section', () => {
        const { getByText } = render(<SettingsPage />);
        expect(getByText(/Notification Preferences/)).toBeInTheDocument();
    });

    it('renders email notifications checkbox', () => {
        const { getByLabelText } = render(<SettingsPage />);
        expect(getByLabelText(/Email notifications/)).toBeInTheDocument();
    });

    it('renders SMS notifications checkbox', () => {
        const { getByLabelText } = render(<SettingsPage />);
        expect(getByLabelText(/SMS notifications/)).toBeInTheDocument();
    });

    it('displays data management section', () => {
        const { getByText } = render(<SettingsPage />);
        expect(getByText(/Data Management/)).toBeInTheDocument();
    });

    it('renders export data button', () => {
        const { getByText } = render(<SettingsPage />);
        expect(getByText(/Export My Data/)).toBeInTheDocument();
    });
describe('Setting