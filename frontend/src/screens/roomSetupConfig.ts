import { AUTH_HERO_IMAGE_URL } from '@/screens/authConfig';

export const ROOM_SETUP_IMAGE_URL = AUTH_HERO_IMAGE_URL;
export const ROOM_SETUP_SKY_IMAGE_URL = AUTH_HERO_IMAGE_URL;
export const ROOM_SETUP_STUDENTS_IMAGE_URL =
  'https://images.pexels.com/photos/6281733/pexels-photo-6281733.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200';

export const ROOM_SETUP_FLOORS = ['B4', 'B3', 'B2', 'B1', 'GF', '1F', '2F', '3F', '4F', '5F'];
export const DEFAULT_ROOM_SETUP_FLOOR_INDEX = 4;
export const ROOM_CREATION_IMAGE_HEIGHT_RATIO = 0.55;
export const ROOM_CREATION_OUTER_STEP_RATIO = 0.06;
export const ROOM_CREATION_INNER_STEP_RATIO = 0.046;

export type RoomSetupStep = 0 | 1 | 2;
