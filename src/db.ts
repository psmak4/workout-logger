import { Dexie, type EntityTable } from "dexie"

/*
========================================
Enums / Literal Types
========================================
*/

export type ExerciseCategory =
  | "strength"
  | "cardio"
  | "machine"
  | "bodyweight"
  | "mobility"
  | "custom";

export type ExerciseEntryType =
  | "strength_set"
  | "cardio_session"
  | "distance_session"
  | "timed_hold"
  | "bodyweight_set";

/*
========================================
Core Tables
========================================
*/

export interface WorkoutSession {
  id?: number;

  // ISO string: 2026-05-02
  date: string;

  // Optional user-defined label
  // Example: "Push Day", "Leg Day"
  name?: string;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ExerciseDefinition {
  id?: number;

  // Example:
  // "Dumbbell Curl"
  // "Incline Bench Press"
  // "Elliptical"
  name: string;

  category: ExerciseCategory;

  // Optional display helper
  // Example:
  // "lbs"
  // "minutes"
  // "miles"
  defaultUnit?: string;

  // User-created vs system seed data
  isCustom: boolean;

  createdAt: string;
}

export interface SessionExercise {
  id?: number;

  sessionId: number;
  exerciseDefinitionId: number;

  // Display order within the workout
  order: number;

  notes?: string;

  createdAt: string;
}

/*
========================================
Typed Payloads
========================================
*/

/*
Strength Example:
Dumbbell Curl
Bench Press
Leg Press
*/

export interface StrengthSetPayload {
  weight: number;
  reps: number;

  // Optional for RPE tracking
  rpe?: number;

  // Optional tempo notation
  // Example: "3-1-1"
  tempo?: string;
}

/*
Cardio Machine Example:
Elliptical
Bike
Stairmaster
*/

export interface CardioSessionPayload {
  durationMinutes: number;

  // Example:
  // resistance = 8
  resistance?: number;

  // Example:
  // incline = 5
  incline?: number;

  caloriesBurned?: number;
}

/*
Distance-Based Example:
Running
Walking
Cycling
Rowing
*/

export interface DistanceSessionPayload {
  durationMinutes?: number;
  distance: number;

  // Example:
  // mph / min-mile / kmh
  pace?: string;
}

/*
Timed Hold Example:
Plank
Wall Sit
Dead Hang
*/

export interface TimedHoldPayload {
  durationSeconds: number;
}

/*
Bodyweight Example:
Pullups
Pushups
Dips
*/

export interface BodyweightSetPayload {
  reps: number;

  // Optional weighted bodyweight work
  addedWeight?: number;
}

/*
========================================
Discriminated Union
========================================
*/

export interface StrengthSetEntry {
  entryType: "strength_set";
  payload: StrengthSetPayload;
}

export interface CardioSessionEntry {
  entryType: "cardio_session";
  payload: CardioSessionPayload;
}

export interface DistanceSessionEntry {
  entryType: "distance_session";
  payload: DistanceSessionPayload;
}

export interface TimedHoldEntry {
  entryType: "timed_hold";
  payload: TimedHoldPayload;
}

export interface BodyweightSetEntry {
  entryType: "bodyweight_set";
  payload: BodyweightSetPayload;
}

export type ExerciseEntryData =
  | StrengthSetEntry
  | CardioSessionEntry
  | DistanceSessionEntry
  | TimedHoldEntry
  | BodyweightSetEntry;

/*
========================================
Persisted Exercise Entry Table
========================================
*/

export interface ExerciseEntry {
  id?: number;

  sessionExerciseId: number;

  /*
  Stored separately for indexing/querying
  and narrowing TypeScript unions
  */
  entryType: ExerciseEntryType;

  /*
  Flexible but strongly typed
  depending on entryType
  */
  payload: ExerciseEntryData["payload"];

  createdAt: string;
}

/*
========================================
Dexie Database
========================================
*/

export class WorkoutLoggerDatabase extends Dexie {
  sessions!: EntityTable<WorkoutSession, "id">;
  exerciseDefinitions!: EntityTable<ExerciseDefinition, "id">;
  sessionExercises!: EntityTable<SessionExercise, "id">;
  exerciseEntries!: EntityTable<ExerciseEntry, "id">;

  constructor() {
    super("WorkoutLoggerDatabase");

    this.version(1).stores({
      /*
      Sessions
      */
      sessions: `
        ++id,
        date,
        name,
        createdAt
      `,

      /*
      Master Exercise Catalog
      */
      exerciseDefinitions: `
        ++id,
        name,
        category,
        isCustom
      `,

      /*
      Session -> Exercise relationship
      */
      sessionExercises: `
        ++id,
        sessionId,
        exerciseDefinitionId,
        order
      `,

      /*
      Actual logged performance rows
      */
      exerciseEntries: `
        ++id,
        sessionExerciseId,
        entryType,
        createdAt
      `,
    });
  }
}

export const db = new WorkoutLoggerDatabase();