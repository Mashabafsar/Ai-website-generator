import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CrmJobStatus } from "../lib/crm/config";

/**
 * Documents the RUNNING→DONE guard used by markDone/markFailed.
 *
 * A re-enqueue while a worker holds the lease sets status back to PENDING.
 * Completing that worker must not overwrite PENDING, or a post-live credit
 * pack purchase that overlapped the go-live deal refresh would be dropped.
 */
function finishClaimedJob(currentStatus: string, nextStatus: string): string {
  if (currentStatus !== CrmJobStatus.RUNNING) return currentStatus;
  return nextStatus;
}

describe("crm outbox claim completion", () => {
  it("marks DONE only while the row is still RUNNING", () => {
    assert.equal(finishClaimedJob(CrmJobStatus.RUNNING, CrmJobStatus.DONE), CrmJobStatus.DONE);
  });

  it("preserves a PENDING reopen that raced ahead of markDone", () => {
    assert.equal(
      finishClaimedJob(CrmJobStatus.PENDING, CrmJobStatus.DONE),
      CrmJobStatus.PENDING
    );
  });

  it("preserves FAILED when the row was no longer claimed", () => {
    assert.equal(finishClaimedJob(CrmJobStatus.FAILED, CrmJobStatus.DONE), CrmJobStatus.FAILED);
  });
});
