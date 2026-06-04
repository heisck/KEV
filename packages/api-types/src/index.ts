/**
 * Public surface of @kev/api-types.
 *
 * The actual types live in ./schema.d.ts, which is GENERATED from the backend's
 * OpenAPI document via `npm run gen:api-types` (openapi-typescript). Do not edit
 * schema.d.ts by hand.
 */
export type { paths, components, operations } from './schema';
import type { components } from './schema';

/** Convenience alias for the `components.schemas` map. */
export type Schemas = components['schemas'];
