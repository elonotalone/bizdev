"use client";

// Data-only compatibility entrypoint. UI projection lives in the shared-shell
// adapter, not in this registry.
export {
  artifactContextFor,
  fixtureRecordsForContext,
  type ArtifactFixtureRecord,
  type ContextRequest,
} from "./artifact-contexts";
