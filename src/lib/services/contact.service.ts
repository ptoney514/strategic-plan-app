import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export interface ContactFormData {
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  topic: string;
  phone?: string;
  message?: string;
}

export interface ContactSubmission {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  organization: string;
  topic: string;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmissionResult {
  success: boolean;
  error?: string;
}

export class ContactService {
  /**
   * Submit a contact form to the database
   */
  static async submitContactForm(data: ContactFormData): Promise<ContactSubmissionResult> {
    console.log('[ContactService] Submitting contact form...');

    try {
      await apiPost('/contact', {
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        organization: data.organization,
        topic: data.topic,
        phone: data.phone || null,
        message: data.message || null,
      });

      console.log('[ContactService] Contact form submitted successfully');
      return { success: true };
    } catch (error) {
      console.error('[ContactService] Error submitting contact form:', error);
      return {
        success: false,
        error: 'Failed to submit form. Please try again or email us directly.',
      };
    }
  }

  /**
   * Get all contact submissions (admin only)
   */
  static async getAll(): Promise<ContactSubmission[]> {
    console.log('[ContactService] Fetching all contact submissions...');

    const data = await apiGet<ContactSubmission[]>('/contact');

    console.log(`[ContactService] Fetched ${data?.length || 0} submissions`);
    return data || [];
  }

  /**
   * Update the status of a contact submission (admin only)
   */
  static async updateStatus(id: string, status: string): Promise<void> {
    console.log(`[ContactService] Updating submission ${id} status to ${status}...`);

    await apiPut(`/contact/${id}`, { status });

    console.log('[ContactService] Submission status updated successfully');
  }

  /**
   * Delete a contact submission (admin only)
   */
  static async delete(id: string): Promise<void> {
    console.log(`[ContactService] Deleting submission ${id}...`);

    await apiDelete(`/contact/${id}`);

    console.log('[ContactService] Submission deleted successfully');
  }
}
