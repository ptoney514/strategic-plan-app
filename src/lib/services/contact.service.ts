import { supabase } from '../supabase';

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

    const { error } = await supabase.from('spb_contact_submissions').insert({
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      organization: data.organization,
      topic: data.topic,
      phone: data.phone || null,
      message: data.message || null,
    });

    if (error) {
      console.error('[ContactService] Error submitting contact form:', error);
      return {
        success: false,
        error: 'Failed to submit form. Please try again or email us directly.',
      };
    }

    console.log('[ContactService] Contact form submitted successfully');
    return { success: true };
  }

  /**
   * Get all contact submissions (admin only)
   */
  static async getAll(): Promise<ContactSubmission[]> {
    console.log('[ContactService] Fetching all contact submissions...');

    const { data, error } = await supabase
      .from('spb_contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ContactService] Error fetching submissions:', error);
      throw error;
    }

    console.log(`[ContactService] Fetched ${data?.length || 0} submissions`);
    return data || [];
  }

  /**
   * Update the status of a contact submission (admin only)
   */
  static async updateStatus(id: string, status: string): Promise<void> {
    console.log(`[ContactService] Updating submission ${id} status to ${status}...`);

    const { error } = await supabase
      .from('spb_contact_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[ContactService] Error updating submission:', error);
      throw error;
    }

    console.log('[ContactService] Submission status updated successfully');
  }

  /**
   * Delete a contact submission (admin only)
   */
  static async delete(id: string): Promise<void> {
    console.log(`[ContactService] Deleting submission ${id}...`);

    const { error } = await supabase.from('spb_contact_submissions').delete().eq('id', id);

    if (error) {
      console.error('[ContactService] Error deleting submission:', error);
      throw error;
    }

    console.log('[ContactService] Submission deleted successfully');
  }
}
