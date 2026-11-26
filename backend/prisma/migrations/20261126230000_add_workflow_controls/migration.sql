-- Nexora additive workflow controls.
-- Review against the production schema before applying.
-- This migration intentionally does not drop, rewrite, or delete existing data.

ALTER TABLE "workflows"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "workflow_transitions"
ADD COLUMN "allowed_role_id" UUID;

CREATE INDEX "idx_transitions_allowed_role_id"
ON "workflow_transitions"("allowed_role_id");

ALTER TABLE "workflow_transitions"
ADD CONSTRAINT "fk_transitions_allowed_role"
FOREIGN KEY ("allowed_role_id") REFERENCES "roles"("id")
ON DELETE NO ACTION ON UPDATE NO ACTION;
