export type AppRole = 'public_user' | 'member' | 'secretary' | 'area_rep' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  iaabo_id?: string | null;
  phone: string;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  is_over_18: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  board_id: string | null;
  last_sign_in_at: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}
