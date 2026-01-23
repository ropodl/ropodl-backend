import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export abstract class Seeder {
  abstract run(db: NodePgDatabase<Record<string, never>>): Promise<void>;
}
