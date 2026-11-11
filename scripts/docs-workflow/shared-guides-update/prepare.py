"""Prepare the single production Guides lock with the measured B2 coordinator."""
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import urllib.request

PAGE = "json-field-overview"
SUBJECT = {"kind": "guides-page", "group": "guides", "pageId": PAGE}
LOCK = f"shared-docs/guides/pages/{PAGE}/lock.yaml"
TRACK = "v3.0.x"
REPO_ID = 660446555
REPO = "zilliztech/zdoc"
SHA = re.compile(r"[0-9a-f]{40}")
DIGEST = re.compile(r"[0-9a-f]{64}")
CLEAN = {"LANG": "C", "LC_ALL": "C", "TZ": "UTC", "JITI_CACHE": "false",
         "PATH": "/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"}
PROFILE = Path("/Library/Preferences/OpenDirectory/Configurations/Search.plist")


class Hold(Exception):
    """A completed observation cannot authorize preparing this candidate."""


def require(condition, reason):
    if not condition:
        raise Hold(reason)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def oid(value):
    return isinstance(value, str) and SHA.fullmatch(value) and value != "0" * 40


def read(path):
    return json.loads(path.read_bytes())


def write(path, value):
    path.write_text(json.dumps(value, indent=2) + "\n")


def output(key, value):
    with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf8") as stream:
        stream.write(f"{key}={value}\n")


def git(repo, *args, data=None):
    env = {**CLEAN, "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": "/dev/null",
           "GIT_TERMINAL_PROMPT": "0", "GIT_NO_REPLACE_OBJECTS": "1"}
    proc = subprocess.run(["/usr/bin/git", "-C", str(repo), *args], env=env, input=data,
                          capture_output=True, timeout=600)
    if proc.returncode:
        raise RuntimeError("Git failed during " + args[0])
    return proc.stdout


def rev(repo, ref):
    return git(repo, "rev-parse", "--verify", ref).decode().strip()


def profile_receipt():
    """Bind the active root-owned inode/bytes to the restricted helper's step receipt."""
    require(os.getuid() == os.geteuid() == 501, "WRONG_RUNNER_USER")
    flags = os.O_RDONLY | os.O_NONBLOCK | os.O_NOFOLLOW
    with os.fdopen(os.open(os.environ["PROFILE_RECEIPT"], flags), "rb") as handle:
        require(stat.S_ISREG(os.fstat(handle.fileno()).st_mode), "PROFILE_RECEIPT_INVALID")
        raw = handle.read(4097)
    require(len(raw) <= 4096 and sha256(raw) == os.environ["PROFILE_SHA256"], "PROFILE_RECEIPT_INVALID")
    receipt = json.loads(raw)
    require(receipt["schemaVersion"] == 1 and receipt["result"] == "verified"
            and receipt["productionQualified"] is False, "PROFILE_UNVERIFIED")
    after = receipt["after"]
    with os.fdopen(os.open(PROFILE, flags), "rb") as handle:
        st = os.fstat(handle.fileno())
        require(stat.S_ISREG(st.st_mode) and st.st_uid == st.st_gid == 0 and st.st_nlink == 1
                and stat.S_IMODE(st.st_mode) == 0o644 and 0 < st.st_size <= 1024, "PROFILE_INODE_INVALID")
        raw = handle.read(1025)
        named = PROFILE.lstat()
        require((named.st_dev, named.st_ino, named.st_ctime_ns) == (st.st_dev, st.st_ino, st.st_ctime_ns)
                and (after["uid"], after["gid"], after["mode"], int(after["device"]), after["inode"], after["bytes"])
                == (0, 0, "0644", st.st_dev, str(st.st_ino), st.st_size)
                and len(raw) == st.st_size and sha256(raw) == after["sha256"], "PROFILE_DRIFT")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


def metadata(path):
    request = urllib.request.Request(f"https://api.github.com/repos/{REPO}{path}", headers={
        "Accept": "application/vnd.github+json", "User-Agent": "zdoc-guides-preparation",
        "Authorization": "Bearer " + os.environ["GH_TOKEN"], "X-GitHub-Api-Version": "2022-11-28"})
    client = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    with client.open(request, timeout=30) as response:
        raw = response.read(16 * 1024 * 1024 + 1)
    require(len(raw) <= 16 * 1024 * 1024, "METADATA_OVERSIZED")
    return json.loads(raw)


def select_fetch(get):
    # This selects a prospective run only. B2 authenticates the complete 70-day
    # history of both Guides entry points including reruns, jobs, steps and ZIPs.
    rows = get("/actions/workflows/fetch-docs.yml/runs?event=schedule&branch=master&per_page=1")["workflow_runs"]
    require(len(rows) == 1, "SCHEDULED_FETCH_MISSING")
    row = rows[0]
    require(type(row["id"]) is int and row["id"] > 0 and type(row["run_attempt"]) is int and row["run_attempt"] > 0
            and row["workflow_id"] == 83360731 and row["path"] == ".github/workflows/fetch-docs.yml"
            and row["repository"]["id"] == row["head_repository"]["id"] == REPO_ID
            and row["head_branch"] == "master" and oid(row["head_sha"])
            and (row["event"], row["status"], row["conclusion"]) == ("schedule", "completed", "success"),
            "SCHEDULED_FETCH_UNAVAILABLE")
    return row


def artifact(get, run, artifact_id, name, digest, maximum):
    require(type(artifact_id) is int and artifact_id > 0 and DIGEST.fullmatch(digest), "ARTIFACT_ID_INVALID")
    item = get(f"/actions/artifacts/{artifact_id}")
    owner = item["workflow_run"]
    require(item["id"] == artifact_id and item["name"] == name and item["expired"] is False
            and item["digest"] == "sha256:" + digest and type(item["size_in_bytes"]) is int
            and 0 < item["size_in_bytes"] <= maximum and owner["id"] == run["id"]
            and owner["head_sha"] == run["head_sha"] and owner["head_branch"] == "master"
            and owner["repository_id"] == owner["head_repository_id"] == REPO_ID, "ARTIFACT_DRIFT")
    return {"id": artifact_id, "bytes": item["size_in_bytes"], "sha256": digest}



def instant(value):
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    require(result.tzinfo is not None, "FETCH_TIME_INVALID")
    return result


def check_histories(get, run, start):
    earliest = (start - timedelta(days=70)).date().isoformat()
    matched = False
    for filename, workflow in (("fetch-docs.yml", 83360731), ("fetch-guides-requested.yml", 355332213)):
        ids = set()
        total = None
        for page in range(1, 11):
            data = get(f"/actions/workflows/{filename}/runs?created=%3E%3D{earliest}&per_page=100&page={page}")
            count, rows = data["total_count"], data["workflow_runs"]
            require(type(count) is int and 0 <= count < 1000 and (total is None or total == count)
                    and len(rows) == min(100, count - len(ids)), "FETCH_INVENTORY_INCOMPLETE")
            total = count
            for row in rows:
                require(type(row["id"]) is int and row["id"] > 0 and row["id"] not in ids
                        and row["repository"]["id"] == REPO_ID and row["workflow_id"] == workflow,
                        "FETCH_INVENTORY_AMBIGUOUS")
                ids.add(row["id"])
                updated = instant(row["updated_at"])
                require(row["status"] == "completed", "FETCH_SUPERSEDED")
                if row["id"] == run["id"]:
                    require(not matched and workflow == run["workflow_id"] and row["run_attempt"] == run["run_attempt"]
                            and row["head_sha"] == run["head_sha"] and row["conclusion"] == "success", "FETCH_ATTEMPT_DRIFT")
                    matched = True
                else:
                    require(updated < start, "FETCH_SUPERSEDED")
            if len(ids) == count:
                break
        require(len(ids) == total, "FETCH_INVENTORY_INCOMPLETE")
    require(matched, "FETCH_NOT_IN_INVENTORY")


def verify_fetch(record, get, now):
    run = select_fetch(get)
    run_id, attempt = run["id"], run["run_attempt"]
    require(record["page"] == PAGE and record["status"] == "prepared"
            and (record["fetchRun"], record["fetchAttempt"], record["fetchProducer"]) == (run_id, attempt, run["head_sha"]),
            "FETCH_SUPERSEDED")
    job_id = record["sourceJob"]
    require(type(job_id) is int and job_id > 0, "INVALID_SOURCE_JOB")
    job = get(f"/actions/jobs/{job_id}")
    require((job["id"], job["run_id"], job["run_attempt"], job["head_sha"], job["name"], job["status"], job["conclusion"])
            == (job_id, run_id, attempt, run["head_sha"], "produce_guides_sources / fetch", "completed", "success"),
            "SOURCE_JOB_DRIFT")
    steps = [s for s in job["steps"] if s["name"] == "Fetch shared guides sources"]
    start = instant(record["scanStart"])
    require(len(steps) == 1 and steps[0]["conclusion"] == "success" and instant(steps[0]["started_at"]) == start,
            "SCAN_TIME_DRIFT")
    require(now - timedelta(hours=36) <= start <= now + timedelta(minutes=5), "FETCH_OBSERVATION_EXPIRED")
    for key, name, limit in (("sourceZip", f"guides-sources-en-{run_id}", 256 * 1024**2),
                             ("publicationZip", f"publication-results-fetch-{run_id}-{attempt}", 1024**2)):
        previous = record[key]
        require(artifact(get, run, previous["id"], name, previous["sha256"], limit) == previous,
                "ARTIFACT_DRIFT")
    check_histories(get, run, start)

def lock_bytes(current, next_sha):
    return f"schema_version: 1\ncurrent: {current}\nnext: {next_sha}\n".encode()


def discovery_pins(discovery):
    require(discovery["status"] == "candidate" and discovery["page"] == PAGE and discovery["sourceTrack"] == TRACK
            and all(oid(discovery[key]) for key in ("master", "dev", "sourceHead", "sourceTarget", "current", "next"))
            and discovery["sourceTarget"] == discovery["sourceHead"] != discovery["next"],
            "DISCOVERY_INPUT_INVALID")
    return {"master": discovery["master"], "dev": discovery["dev"], "source": discovery["sourceTarget"],
            "sourceTrackHead": discovery["sourceHead"], "current": discovery["current"], "next": discovery["next"]}


def setup(root, tool, pins, fetch):
    require(pins["master"] == os.environ["GITHUB_SHA"] == rev(tool, "HEAD")
            and git(tool, "show", pins["master"] + ":" + LOCK) == lock_bytes(pins["current"], pins["next"]),
            "TOOLING_OR_LOCK_DRIFT")
    for name, url, branch, expected in [
        ("dev.git", "https://github.com/zilliztech/zdoc.git", "dev", pins["dev"]),
        ("source.git", "https://github.com/milvus-io/milvus-docs.git", TRACK, pins["source"]),
    ]:
        git(root, "clone", "-q", "--bare", "--single-branch", "--no-tags", "--branch", branch, url, name)
        require(rev(root / name, "HEAD") == expected, "DISCOVERED_TIP_MOVED")
    # The B2 coordinator downloads and verifies both ZIPs and passes only
    # staged data plus its read-only metadata broker to the isolated worker.
    write(root / "request.json", {
        "kind": "shared-update-local-request", "schemaVersion": 1, "repository": str(tool),
        "devRepository": str(root / "dev.git"), "sourceRepository": str(root / "source.git"),
        "master": pins["master"], "dev": pins["dev"], "sourceTarget": pins["source"], "comparisonConfig": None,
        "subjects": [SUBJECT], "existing": None, "lifecycle": {"runId": fetch["id"], "archive": None}})


def run_b2(root, tool, node, phase, extra=()):
    proc = subprocess.run([node, "scripts/docs-tooling.js", "shared-docs", "update-" + phase,
                           "--request", str(root / "request.json"), "--out", str(root / phase), *extra],
                          cwd=tool, env={**CLEAN, "GH_TOKEN": os.environ["GH_TOKEN"]},
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=35 * 60)
    path = root / phase / "result.json"
    if proc.returncode:
        raise RuntimeError("B2_" + phase.upper() + "_FAILED")
    result = read(path) if path.exists() else json.loads(proc.stdout)
    write(root / "evidence" / (phase + ".json"), result)
    require(result.get("operations") == [], "UNEXPECTED_B2_OPERATIONS")
    if result.get("status") != {"plan": "planned", "prepare": "prepared"}[phase]:
        reasons = [code for code in result.get("reasons", []) if isinstance(code, str) and re.fullmatch("[A-Z0-9_]{1,100}", code)]
        raise Hold(" / ".join(["B2_" + phase.upper() + "_HELD", *reasons]))
    return result


def blob(directory, ref):
    digest = ref["sha256"]
    require(DIGEST.fullmatch(digest) and ref["path"] == "blobs/" + digest, "INVALID_BLOB_REFERENCE")
    raw = (directory / ref["path"]).read_bytes()
    require(len(raw) == ref["bytes"] and sha256(raw) == digest, "B2_BLOB_MISMATCH")
    return raw


def unit_status(unit):
    require(unit["subjects"] == [SUBJECT], "MULTI_PAGE_PLAN")
    if unit["disposition"] in ("report-only", "noop") and unit["nextEdits"] == [] and not unit["holdReasons"]:
        return "unchanged"
    require(unit["disposition"] == "candidate" and len(unit["nextEdits"]) == 1 and not unit["holdReasons"],
            "B2_UNIT_HELD")
    return "candidate"


def authority(root, unit, pins, run):
    plan = root / "plan"
    require(len(unit["reports"]) == 1, "AMBIGUOUS_UNIT_REPORT")
    report = json.loads(blob(plan, unit["reports"][0]))
    source = report["pins"]["source"]
    require(report["subject"] == SUBJECT and source["track"] == TRACK and source["target"] == source["observedTrackHead"] == pins["source"]
            and source["current"] == pins["current"] and source["oldNext"] == pins["next"]
            and report["authority"]["updateState"] == "eligible-to-propose"
            and report["authority"]["reasons"] == []
            and any(axis["axis"] == "old-next-to-target" and axis["sourceChanged"] is True for axis in report["axes"]),
            "NO_ELIGIBLE_SOURCE_CHANGE")
    # The exact B1 pins blob inside the authenticated B2 report identifies
    # what the measured collection used, independent of the discovery result.
    observations = [json.loads(blob(plan, ref)) for ref in report["authority"]["evidence"]]
    identities = [obs["lifecycle"] for obs in observations if "lifecycle" in obs and obs.get("master") == pins["master"]
                  and obs.get("dev") == pins["dev"] and obs.get("offlineReplay") is False]
    require(len(identities) == 1, "MISSING_LIFECYCLE_PINS")
    row = identities[0]
    require(row["runId"] == row["latestRunId"] == run["id"] and row["attempt"] == run["run_attempt"]
            and row["masterSha"] == run["head_sha"] and row["sampledDev"] == pins["dev"]
            and row["observedPage"] == PAGE and row["reasons"] == []
            and DIGEST.fullmatch(row.get("producerInventorySha256", "")), "REVIEWED_FETCH_EVIDENCE_MISSING")
    run_id, attempt = run["id"], run["run_attempt"]
    return {"fetchRun": run_id, "fetchAttempt": attempt, "fetchProducer": run["head_sha"],
            "sourceJob": row["sourceJobId"], "scanStart": row["generatedAt"],
            "sourceZip": artifact(metadata, run, row["artifactId"], f"guides-sources-en-{run_id}", row["zipSha256"], 256 * 1024**2),
            "publicationZip": artifact(metadata, run, row["publicationArtifactId"], f"publication-results-fetch-{run_id}-{attempt}",
                                       row["publicationZipSha256"], 1024**2)}


def verify_candidate(root, tool, unit, pins, result):
    directory = root / "prepare"
    evidence = root / "evidence"
    journal = read(directory / "journal.json")
    proof_raw = blob(directory, result["proof"])
    proof = json.loads(proof_raw)
    plan_raw = blob(directory, journal["plan"])
    candidate, master = result["candidate"], pins["master"]
    require(oid(candidate) and journal["phase"] == "installed" and json.loads(plan_raw) == unit
            and journal["unitKey"] == result["unitKey"] == unit["unitKey"]
            and sha256(b"shared-update/plan/v1\n" + plan_raw) == journal["planSha256"] == result["planSha256"]
            and proof_raw == (directory / "proof.json").read_bytes() and journal["proof"] == result["proof"]
            and journal["candidate"] == proof["candidate"] == candidate, "B2_JOURNAL_MISMATCH")
    planned = read(root / "plan" / "pins.json")
    require(planned["master"] == planned["trustedTools"] == master and planned["dev"] == pins["dev"]
            and planned["prepared"] == proof["prepared"] and proof["prepared"]["base"] == master
            and planned["toolsetSha256"] == proof["trustedToolsetSha256"]
            and [s["target"] for s in planned["source"]] == [pins["source"]], "B2_PIN_MISMATCH")
    repo = directory / "scratch.git"
    before, after = lock_bytes(pins["current"], pins["next"]), lock_bytes(pins["current"], pins["source"])
    require(rev(repo, "refs/shared-update/local/" + result["planSha256"]) == candidate
            and git(repo, "show", "-s", "--format=%P", candidate).decode().strip() == master
            and rev(repo, candidate + "^{tree}") == proof["candidateTree"]
            and git(repo, "diff", "--name-only", "-z", master, candidate) == LOCK.encode() + b"\0"
            and git(repo, "show", master + ":" + LOCK) == before and git(repo, "show", candidate + ":" + LOCK) == after
            and all(git(repo, "ls-tree", sha, "--", LOCK).startswith(b"100644 blob ") for sha in (master, candidate)),
            "UNEXPECTED_CANDIDATE_TREE")
    edit = unit["nextEdits"][0]
    require(proof["nextEdits"] == [edit] and edit["subject"] == SUBJECT and edit["target"] == pins["source"]
            and edit["before"] == {"current": pins["current"], "next": pins["next"], "path": LOCK, "sha256": sha256(before)}
            and edit["afterBlob"]["sha256"] == sha256(after)
            and blob(directory, proof["patch"]) == git(repo, "diff", "--raw", "--no-abbrev", "-z", master, candidate),
            "B2_PATCH_MISMATCH")
    patch = git(repo, "diff", "--no-ext-diff", master, candidate)
    git(tool, "apply", "--check", "-", data=patch)
    for name, raw in (("before.lock", before), ("after.lock", after), ("unit-plan.json", plan_raw),
                      ("candidate.commit", git(repo, "cat-file", "commit", candidate)),
                      ("lock.next.patch", patch), ("proof.json", proof_raw)):
        (evidence / name).write_bytes(raw)
    return {"candidate": candidate, "proofSha256": sha256(proof_raw), "patchSha256": sha256(patch)}


def prepare(root, tool, record):
    require(os.environ["GITHUB_REPOSITORY"] == REPO and os.environ["GITHUB_REPOSITORY_ID"] == str(REPO_ID)
            and os.environ["GITHUB_REF"] == "refs/heads/master" and record["runAttempt"] == 1, "INVALID_WORKFLOW_ORIGIN")
    pins = discovery_pins(json.loads(os.environ["DISCOVERY_JSON"]))
    record.update(pins)
    node = shutil.which("node")
    require(node and subprocess.check_output([node, "-p", "process.version"], env=CLEAN, text=True).strip() == "v22.23.4",
            "UNSUPPORTED_NODE")
    profile_receipt()
    run = select_fetch(metadata)
    record.update(fetchRun=run["id"], fetchAttempt=run["run_attempt"], fetchProducer=run["head_sha"])
    setup(root, tool, pins, run)
    run_b2(root, tool, node, "plan")
    units = list((root / "plan" / "units").glob("*.json"))
    require(len(units) == 1, "SINGLE_UNIT_UNAVAILABLE")
    unit = read(units[0])
    # Persist actionable product reasons even if the unit cannot be prepared.
    record["reasons"] = [reason for reason in unit["holdReasons"] if re.fullmatch("[A-Z0-9_]{1,100}", reason)]
    for path in (root / "plan").glob("launcher-*/guides-impact-v1/pins.json"):
        reasons = read(path).get("lifecycle", {}).get("reasons", [])
        record["reasons"].extend(r for r in reasons if isinstance(r, str) and re.fullmatch("[A-Z0-9_]{1,100}", r))
    if unit_status(unit) == "unchanged":
        record["status"] = "unchanged"
        return
    record.update(authority(root, unit, pins, run))
    result = run_b2(root, tool, node, "prepare", ["--plan", str(root / "plan"), "--unit", unit["unitKey"]])
    profile_receipt()
    verify_fetch({**record, "status": "prepared"}, metadata, datetime.now(timezone.utc))
    for repo, url, branch, expected in (
            (tool, "https://github.com/zilliztech/zdoc.git", "master", pins["master"]),
            (root / "dev.git", "origin", "dev", pins["dev"]),
            (root / "source.git", "origin", TRACK, pins["sourceTrackHead"])):
        ref = "refs/heads/" + branch
        require(git(repo, "ls-remote", "--exit-code", "--refs", url, ref) == f"{expected}\t{ref}\n".encode(),
                "DISCOVERED_TIP_MOVED")
    record.update(verify_candidate(root, tool, unit, pins, result))
    record["status"] = "prepared"


def main():
    os.umask(0o077)
    cache = Path.home() / ".cache"
    cache.mkdir(mode=0o700, exist_ok=True)
    require(cache.resolve() == cache, "ALIASED_CACHE")
    root = Path(tempfile.mkdtemp(prefix="shared-guides-update-", dir=cache))
    evidence = root / "evidence"
    evidence.mkdir(mode=0o700)
    output("evidence", evidence)
    record = {"schemaVersion": 1, "page": PAGE, "status": "held", "candidate": None, "reasons": [],
              "runId": int(os.environ["GITHUB_RUN_ID"]), "runAttempt": int(os.environ["GITHUB_RUN_ATTEMPT"])}
    code = 0
    try:
        prepare(root, Path(os.environ["GITHUB_WORKSPACE"]).resolve(strict=True), record)
    except Hold as error:
        record["reasons"].append(str(error))
    except Exception as error:
        # Never log an authenticated HTTP response, request URL, environment or child stderr.
        record["reasons"].append(str(error) if isinstance(error, RuntimeError) else type(error).__name__)
        code = 1
    write(evidence / "preparation.json", record)
    output("status", record["status"])
    if record["status"] == "prepared":
        output("candidate", record["candidate"])
    print(json.dumps({"status": record["status"], "reasons": record["reasons"]}))
    return code


if __name__ == "__main__":
    if sys.argv[1:] == ["verify-fetch"]:
        try:
            verify_fetch(json.loads(sys.stdin.buffer.read(65537)), metadata, datetime.now(timezone.utc))
        except Exception as exc:
            print(str(exc) if isinstance(exc, Hold) else type(exc).__name__, file=sys.stderr)
            sys.exit(1)
    elif not sys.argv[1:]:
        sys.exit(main())
    else:
        sys.exit(2)
