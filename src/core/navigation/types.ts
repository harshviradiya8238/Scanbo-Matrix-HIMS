/**
 * Navigation Types
 * Type definitions for menu configuration and navigation
 */

export type MenuItemType = 'item' | 'group' | 'divider';

export interface MenuItem {
  id: string;
  label: string;
  iconName?: string;
  route?: string;
  type: MenuItemType;
  children?: MenuItem[];
  requiredPermissions?: string[];
  badgeCount?: number;
  featureFlag?: string;
  order?: number;
}

export interface MenuConfig {
  items: MenuItem[];
}

export type SystemUserRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTION'
  | 'CARE_COORDINATOR'
  | 'INFECTION_CONTROL'
  | 'LAB_TECH'
  | 'RADIOLOGY_TECH'
  | 'PHARMACIST'
  | 'BILLING'
  | 'INVENTORY'
  | 'PATIENT_PORTAL'
  | 'AUDITOR';

export type UserRole = SystemUserRole | (string & {});
