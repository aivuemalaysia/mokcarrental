import fs from 'node:fs';
import path from 'node:path';

describe('MOK website contact admin policy guidance', () => {
  const admin = fs.readFileSync(path.join(process.cwd(), 'src/components/admin/ContactsManager.tsx'), 'utf8');

  it('does not instruct staff to run permissive SQL against customer enquiries', () => {
    expect(admin).not.toContain('CREATE POLICY');
    expect(admin).not.toContain('Run the migration SQL in your Supabase dashboard');
    expect(admin).not.toContain('auth.role()');
    expect(admin).toContain('Do not run unreviewed SQL or relax customer-contact permissions');
  });

  it('retains the contact list and missing-table warning without changing data access', () => {
    expect(admin).toContain("fetch('/api/admin/contacts'");
    expect(admin).toContain('contacts table not found in database');
    expect(admin).toContain('Ask the website administrator');
    expect(admin).not.toContain("fetch('/api/admin/contacts', { method: 'DELETE'");
  });

  it('keeps the proposed retention policy as a non-executing internal SOP', () => {
    const sop = fs.readFileSync(path.join(process.cwd(), 'docs/seo-phase-a-contact-retention-sop-proposal.md'), 'utf8');
    expect(sop).toContain('STATUS: PROPOSAL ONLY');
    expect(sop).toContain('12 months from collection');
    expect(sop).toContain('No automatic purging');
  });
});
