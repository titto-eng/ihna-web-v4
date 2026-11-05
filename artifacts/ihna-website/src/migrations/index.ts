import * as migration_20261021_120328_ihna_baseline from './20261021_120328_ihna_baseline';
import * as migration_20261022_015647_course_shared_stats from './20261022_015647_course_shared_stats';

export const migrations = [
  {
    up: migration_20261021_120328_ihna_baseline.up,
    down: migration_20261021_120328_ihna_baseline.down,
    name: '20261021_120328_ihna_baseline',
  },
  {
    up: migration_20261022_015647_course_shared_stats.up,
    down: migration_20261022_015647_course_shared_stats.down,
    name: '20261022_015647_course_shared_stats'
  },
];
