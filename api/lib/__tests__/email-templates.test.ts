import { describe, it, expect } from 'vitest';
import { invitationEmailHtml, passwordResetEmailHtml } from '../email-templates';

describe('email-templates', () => {
  describe('invitationEmailHtml', () => {
    it('returns valid HTML containing the organization name', () => {
      const html = invitationEmailHtml('Westside ISD', 'Jane Admin', 'editor', 'https://stratadash.org/invite/abc123');
      expect(html).toContain('Westside ISD');
    });

    it('contains the inviter name', () => {
      const html = invitationEmailHtml('Westside ISD', 'Jane Admin', 'editor', 'https://stratadash.org/invite/abc123');
      expect(html).toContain('Jane Admin');
    });

    it('contains the role', () => {
      const html = invitationEmailHtml('Westside ISD', 'Jane Admin', 'editor', 'https://stratadash.org/invite/abc123');
      expect(html).toContain('editor');
    });

    it('contains the accept URL as an href', () => {
      const url = 'https://stratadash.org/invite/abc123';
      const html = invitationEmailHtml('Westside ISD', 'Jane Admin', 'editor', url);
      expect(html).toContain(`href="${url}"`);
    });

    it('contains the CTA button text', () => {
      const html = invitationEmailHtml('Westside ISD', 'Jane Admin', 'editor', 'https://stratadash.org/invite/abc123');
      expect(html).toContain('Accept Invitation');
    });

    it('contains a disclaimer footer', () => {
      const html = invitationEmailHtml('Westside ISD', 'Jane Admin', 'editor', 'https://stratadash.org/invite/abc123');
      expect(html).toContain('ignore this email');
    });

    it('contains StrataDash branding', () => {
      const html = invitationEmailHtml('Westside ISD', 'Jane Admin', 'editor', 'https://stratadash.org/invite/abc123');
      expect(html).toContain('StrataDash');
    });

    it('is a complete HTML document', () => {
      const html = invitationEmailHtml('Westside ISD', 'Jane Admin', 'editor', 'https://stratadash.org/invite/abc123');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });
  });

  describe('passwordResetEmailHtml', () => {
    it('contains the reset URL as an href', () => {
      const url = 'https://stratadash.org/reset-password?token=xyz';
      const html = passwordResetEmailHtml(url);
      expect(html).toContain(`href="${url}"`);
    });

    it('contains the CTA button text', () => {
      const html = passwordResetEmailHtml('https://stratadash.org/reset-password?token=xyz');
      expect(html).toContain('Reset Password');
    });

    it('mentions the expiry time', () => {
      const html = passwordResetEmailHtml('https://stratadash.org/reset-password?token=xyz');
      expect(html).toContain('1 hour');
    });

    it('contains a safety disclaimer', () => {
      const html = passwordResetEmailHtml('https://stratadash.org/reset-password?token=xyz');
      expect(html).toContain('safely ignore');
    });

    it('contains StrataDash branding', () => {
      const html = passwordResetEmailHtml('https://stratadash.org/reset-password?token=xyz');
      expect(html).toContain('StrataDash');
    });

    it('is a complete HTML document', () => {
      const html = passwordResetEmailHtml('https://stratadash.org/reset-password?token=xyz');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('</html>');
    });
  });
});
