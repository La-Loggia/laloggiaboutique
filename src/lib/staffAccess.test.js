import { describe, expect, test } from 'bun:test';
import { loginAddress, staffPermissions } from './staffAccess';

describe('staff access', () => {
  test('Nerea García signs in without an email', () => {
    expect(loginAddress('Nerea García')).toBe('nerea.garcia@staff.laloggia.local');
    expect(loginAddress(' NEREA GARCÍA ')).toBe('nerea.garcia@staff.laloggia.local');
  });
  test('reader can view submissions', () => {
    expect(staffPermissions(['submissions_reader']).canViewSubmissions).toBe(true);
  });
  test('reader cannot edit or access full administration', () => {
    expect(staffPermissions(['submissions_reader']).canEditSubmissions).toBe(false);
    expect(staffPermissions(['submissions_reader']).isAdmin).toBe(false);
  });
  test('existing administrator keeps full access', () => {
    expect(staffPermissions(['admin']).canEditSubmissions).toBe(true);
  });
  test('unassigned account cannot access submissions', () => {
    expect(staffPermissions([]).canViewSubmissions).toBe(false);
  });
});