# Nginx 404 Redirects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce 404s for the reported top-100 broken paths by adding verified nginx normalization rules and exact redirects in `default.conf` without masking unresolved URLs.

**Architecture:** Keep the existing strict `try_files $uri $uri.html =404` fallback and extend only the nginx redirect layer. Add a very small normalization block for safe repeated patterns, then add exact-match `location = ...` redirects only for targets already verified in the repo or built output. Verify behavior by building the deploy image and asserting response headers with `curl`.

**Tech Stack:** nginx config (`default.conf`), Docker multi-stage build (`Dockerfile`), Docusaurus static build output, `curl`

---

## File Structure

- Modify: `default.conf` — add the minimal normalization rules and exact redirects for verified top-100 404 paths.
- Use: `Dockerfile` — build the deploy image that copies `default.conf` into `/etc/nginx/conf.d` and serves the built site from `/usr/share/nginx/html`.
- Use: existing `build/` output — confirm canonical targets already exist before adding redirects.
- No new source files or test files are required; verification is done with containerized HTTP requests.

### Task 1: Capture failing behavior for verified candidates

**Files:**
- Modify: `default.conf:28-1820` (reference only; no edit in this task)
- Use: `Dockerfile:39-63`
- Use: `build/`

- [ ] **Step 1: Build the deploy image with the current nginx config**

Run:
```bash
docker build --target deploy -t zdoc-nginx-redirects:test .
```
Expected: build completes successfully and prints a final image line similar to `naming to docker.io/library/zdoc-nginx-redirects:test`.

- [ ] **Step 2: Start the container on a local port**

Run:
```bash
docker run -d --rm --name zdoc-nginx-redirects -p 18080:80 zdoc-nginx-redirects:test
```
Expected: command prints a container ID.

- [ ] **Step 3: Record a failing docs redirect candidate**

Run:
```bash
curl -I http://127.0.0.1:18080/docs/quickstart
```
Expected: response contains `HTTP/1.1 404 Not Found` before the config change.

- [ ] **Step 4: Record a failing locale-casing candidate**

Run:
```bash
curl -I http://127.0.0.1:18080/ja-jp/docs/access-control
```
Expected: response contains `HTTP/1.1 404 Not Found` before the config change.

- [ ] **Step 5: Record a failing reference candidate**

Run:
```bash
curl -I http://127.0.0.1:18080/reference/restful/list-stages-v2
```
Expected: response contains `HTTP/1.1 404 Not Found` before the config change.

- [ ] **Step 6: Stop the container after capturing the failing cases**

Run:
```bash
docker rm -f zdoc-nginx-redirects
```
Expected: command prints `zdoc-nginx-redirects`.

- [ ] **Step 7: Commit the baseline verification notes if you saved any local scratch output**

Run:
```bash
git status --short
```
Expected: either no tracked changes yet or only scratch artifacts you intentionally created outside the repo. Do not commit anything in this step if only the working tree is clean.

### Task 2: Add the normalization rules

**Files:**
- Modify: `default.conf:28-47`

- [ ] **Step 1: Add a locale normalization rule near the top of the server redirect section**

Insert this block immediately after `location = /docs { return 301 /docs/home; }` and before the existing exact-match redirects:

```nginx
    location ~ ^/ja-jp/(.*)$ {
        return 301 /ja-JP/$1;
    }

    location = /docs/quickstart {
        return 301 /docs/quick-start;
    }
```

Expected: `default.conf` now normalizes the lowercase locale prefix and adds the verified `quickstart` alias without changing the 404 fallback.

- [ ] **Step 2: Keep the normalization layer intentionally narrow**

Verify the inserted block does **not** include any of the following:

```nginx
    # Do NOT add rules like these
    location ~ ^/docs/(.*)$ {
        return 301 /docs/home;
    }

    location ~ ^/(.*)\.$ {
        return 301 /$1;
    }
```
```
Expected: only the safe locale normalization regex and the exact verified `quickstart` redirect are added.

- [ ] **Step 3: Review the diff for this task only**

Run:
```bash
git diff -- default.conf
```
Expected: diff shows only the newly inserted normalization block and no unrelated edits.

- [ ] **Step 4: Commit the normalization change**

Run:
```bash
git add default.conf && git commit -m "feat: normalize verified legacy doc paths"
```
Expected: git creates a new commit containing only the normalization block.

### Task 3: Add exact redirects for the verified top-100 paths

**Files:**
- Modify: `default.conf:1341-1374`
- Modify: `default.conf:1762-1783`

- [ ] **Step 1: Add the verified Japanese docs redirects next to the existing `ja-JP` entries**

Insert these exact blocks after the existing `location = /ja-JP/docs/quick-setup-collections` block:

```nginx
    location = /ja-JP/docs/view-snapshot-details {
        return 301 /ja-JP/docs/manage-backup-files;
    }

    location = /ja-jp/docs/access-control {
        return 301 /ja-JP/docs/access-control;
    }

    location = /ja-jp/docs/authentication {
        return 301 /ja-JP/docs/authentication;
    }

    location = /ja-jp/docs/projects {
        return 301 /ja-JP/docs/projects;
    }

    location = /ja-jp/docs/home {
        return 301 /ja-JP/docs/home;
    }
```

Expected: the locale-specific redirects sit beside the existing `ja-JP` canonical rules instead of being scattered elsewhere in the file.

- [ ] **Step 2: Add the verified docs and reference redirects next to the existing volume-related rules**

Insert these exact blocks after `location = /docs/manage-volumes-via-console` and before `location = /reference/restful/apply-volume-v2`:

```nginx
    location = /reference/restful/list-stages-v2 {
        return 301 /reference/restful/list-volumes-v2;
    }
```

Also keep the existing verified blocks in this area intact:

```nginx
    location = /docs/manage-stages {
        return 301 /docs/managed-volume;
    }

    location = /docs/volume-explained {
        return 301 /docs/volume;
    }
```

Expected: `list-stages-v2` now resolves to the verified `list-volumes-v2` endpoint alongside the existing volume redirects.

- [ ] **Step 3: Add only the additional exact redirects you can verify from `build/` or existing config patterns**

Use this decision rule while editing:

```text
Add the redirect only if the target already exists in build/ or the exact canonical destination is already proven by current default.conf patterns.
Leave the path unresolved if the target is ambiguous.
```

Candidate examples that may be added only after verification in the current tree:

```text
/docs/offline-migration. -> /docs/offline-migration
/docs/release-notes-2104 -> /docs/changelogs
/docs/release-notes-2106 -> /docs/changelogs
/docs/release-notes-2113 -> /docs/changelogs
/docs/release-notes-2114 -> /docs/changelogs
/ja-jp/search -> /ja-JP/search   (only if the built target exists)
```

Expected: this step extends coverage for clearly verified entries without introducing guessed destinations.

- [ ] **Step 4: Review the exact redirect diff before testing**

Run:
```bash
git diff -- default.conf
```
Expected: diff shows only the intended redirect additions; no existing redirect destinations were changed accidentally.

- [ ] **Step 5: Commit the verified exact redirects**

Run:
```bash
git add default.conf && git commit -m "feat: add verified nginx redirects for top 404 paths"
```
Expected: git creates a second focused commit containing only the exact-match redirect additions.

### Task 4: Verify the nginx behavior end to end in the deploy image

**Files:**
- Modify: `default.conf:28-1820` (already changed in prior tasks)
- Use: `Dockerfile:39-63`

- [ ] **Step 1: Rebuild the deploy image with the updated nginx config**

Run:
```bash
docker build --target deploy -t zdoc-nginx-redirects:test .
```
Expected: build completes successfully.

- [ ] **Step 2: Start the updated container**

Run:
```bash
docker run -d --rm --name zdoc-nginx-redirects -p 18080:80 zdoc-nginx-redirects:test
```
Expected: command prints a container ID.

- [ ] **Step 3: Verify the exact docs redirect now returns 301**

Run:
```bash
curl -I http://127.0.0.1:18080/docs/quickstart
```
Expected output contains:
```text
HTTP/1.1 301 Moved Permanently
Location: http://127.0.0.1:18080/docs/quick-start
```

- [ ] **Step 4: Verify the locale normalization now returns 301**

Run:
```bash
curl -I http://127.0.0.1:18080/ja-jp/docs/access-control
```
Expected output contains:
```text
HTTP/1.1 301 Moved Permanently
Location: http://127.0.0.1:18080/ja-JP/docs/access-control
```

- [ ] **Step 5: Verify the Japanese snapshot redirect now returns 301**

Run:
```bash
curl -I http://127.0.0.1:18080/ja-JP/docs/view-snapshot-details
```
Expected output contains:
```text
HTTP/1.1 301 Moved Permanently
Location: http://127.0.0.1:18080/ja-JP/docs/manage-backup-files
```

- [ ] **Step 6: Verify the docs volume redirect now returns 301**

Run:
```bash
curl -I http://127.0.0.1:18080/docs/manage-stages
```
Expected output contains:
```text
HTTP/1.1 301 Moved Permanently
Location: http://127.0.0.1:18080/docs/managed-volume
```

- [ ] **Step 7: Verify the reference redirect now returns 301**

Run:
```bash
curl -I http://127.0.0.1:18080/reference/restful/list-stages-v2
```
Expected output contains:
```text
HTTP/1.1 301 Moved Permanently
Location: http://127.0.0.1:18080/reference/restful/list-volumes-v2
```

- [ ] **Step 8: Verify an unresolved path still returns 404**

Run:
```bash
curl -I http://127.0.0.1:18080/docs/this-path-should-still-404
```
Expected output contains:
```text
HTTP/1.1 404 Not Found
```

- [ ] **Step 9: Stop the verification container**

Run:
```bash
docker rm -f zdoc-nginx-redirects
```
Expected: command prints `zdoc-nginx-redirects`.

- [ ] **Step 10: Record the final verified diff state**

Run:
```bash
git status --short
```
Expected: working tree is clean if both commits were made successfully, or shows only the intended `default.conf` modification if commits were deferred.
