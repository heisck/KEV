import { AUTH_HERO_IMAGE_URL } from '@/screens/authConfig';

export const ROOM_SETUP_IMAGE_URL = AUTH_HERO_IMAGE_URL;

export const ROOM_SETUP_FLOORS = ['B4', 'B3', 'B2', 'B1', 'GF', '1F', '2F', '3F', '4F', '5F'];
export const DEFAULT_ROOM_SETUP_FLOOR_INDEX = 4;

export type RoomSetupStep = 0 | 1 | 2;
