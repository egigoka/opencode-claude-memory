import { describe, expect, test } from "bun:test"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

const workflowPath = join(process.cwd(), ".github", "workflows", "sync-upstream.yml")

describe("fork upstream synchronization", () => {
  test("rebases fork patches onto upstream only after tests pass", () => {
    expect(existsSync(workflowPath)).toBe(true)

    const workflow = readFileSync(workflowPath, "utf-8")

    expect(workflow).toContain("schedule:")
    expect(workflow).toContain("workflow_dispatch:")
    expect(workflow).toContain("contents: write")
    expect(workflow).toContain("git fetch upstream main")
    expect(workflow).toContain("git rebase upstream/main")
    expect(workflow).toContain("bash -n bin/opencode-memory")
    expect(workflow).toContain("bun test")
    expect(workflow).toContain("bun run build")
    expect(workflow).toContain("git push --force-with-lease origin HEAD:main")
    expect(workflow).not.toContain("git push origin --tags")

    expect(workflow.indexOf("bun test")).toBeLessThan(workflow.indexOf("git push --force-with-lease"))
  })
})
