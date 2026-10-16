-- Existing accounts predate SMTP verification. Mark them verified so turning
-- the feature on does not lock anyone out on the next login.
UPDATE "user" SET "emailVerified" = true WHERE "emailVerified" = false;
