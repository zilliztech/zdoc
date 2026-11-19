"""Prepare the single production Guides lock with the measured B2 coordinator."""
from datetime import datetime, timedelta, timezone
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
import io
import time

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

    def __init__(self, reason, diagnostic_codes=()):
        super().__init__(reason)
        self.diagnostic_codes = tuple(diagnostic_codes)


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
    method = record.get("producerAuthentication")
    require(not (isinstance(method, dict) and method.get("kind") == "fetch-producer-profile-v2")
            and not ("producerAuthentication" in record and "producerInventorySha256" in record)
            and record.get("kind") not in ("guides-batch-collection-index-v1", "guides-batch-qualification-v1"),
            "BATCH_WRITER_INPUT_REJECTED")
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
        reasons = reason_codes(result.get("reasons", []), closed=False)
        diagnostics = held_diagnostic_codes(root / phase) if phase == "plan" else []
        raise Hold(" / ".join(["B2_" + phase.upper() + "_HELD", *reasons]), [*reasons, *diagnostics])
    return result


def blob(directory, ref, maximum=None):
    digest, size = ref["sha256"], ref["bytes"]
    require(DIGEST.fullmatch(digest) and ref["path"] == "blobs/" + digest, "INVALID_BLOB_REFERENCE")
    require(type(size) is int and size >= 0 and (maximum is None or size <= maximum), "B2_BLOB_SIZE_INVALID")
    with os.fdopen(os.open(directory / ref["path"], os.O_RDONLY | os.O_NONBLOCK | os.O_NOFOLLOW), "rb") as handle:
        info = os.fstat(handle.fileno())
        require(stat.S_ISREG(info.st_mode) and info.st_size == size, "B2_BLOB_MISMATCH")
        raw = handle.read(size + 1)
    require(len(raw) == size and sha256(raw) == digest, "B2_BLOB_MISMATCH")
    return raw


def unit_status(unit):
    require(unit["subjects"] == [SUBJECT], "MULTI_PAGE_PLAN")
    if unit["disposition"] in ("report-only", "noop") and unit["nextEdits"] == [] and not unit["holdReasons"]:
        return "unchanged"
    require(unit["disposition"] == "candidate" and len(unit["nextEdits"]) == 1 and not unit["holdReasons"],
            "B2_UNIT_HELD")
    return "candidate"


def report_material(directory, unit):
    # The canonical B2 envelope is also a remote producer member (1 MiB limit).
    # The larger B1 impact detail is review evidence in its own artifact.
    require(len(unit["reports"]) == 1, "AMBIGUOUS_UNIT_REPORT")
    report_raw = blob(directory, unit["reports"][0], 1024**2)
    report = json.loads(report_raw)
    require(report["subject"] == report["authority"]["subject"] == SUBJECT
            and report["detail"]["kind"] == "guides-impact-v1"
            and report["authority"]["provider"] == "guides-retained-source", "UNEXPECTED_REPORT_SUBJECT")
    detail = report["detail"]["file"]
    refs = report["authority"]["evidence"]
    detail_refs = [ref for ref in refs if ref["sha256"] == detail["sha256"] and ref["bytes"] == detail["bytes"]]
    pin_refs = [ref for ref in refs if ref["sha256"] != detail["sha256"]]
    require(len(refs) == 2 and len(detail_refs) == len(pin_refs) == 1, "UNEXPECTED_AUTHORITY_EVIDENCE")
    impact_raw = blob(directory, detail_refs[0], 16 * 1024**2)
    pins_raw = blob(directory, pin_refs[0], 1024**2)
    impact = json.loads(impact_raw)
    require(impact["offlineReplay"] is False and any(row["pageId"] == PAGE and row["selected"] is True
            for row in impact["pages"]), "MISSING_PAGE_IMPACT")
    return report_raw, impact_raw, pins_raw


# A closed vocabulary keeps malformed retained data from becoming log text.
DIAGNOSTIC_REASONS = frozenset("""
AUTHORITY_UNKNOWN AUTHORITY_RETIRED LIFECYCLE_UNAVAILABLE NO_RETAINED_EVIDENCE EVIDENCE_INFRASTRUCTURE_FAILURE
ANALYSIS_INFRASTRUCTURE_FAILURE PAGE_CONFIGURATION_INVALID GROUP_CONFIGURATION_INVALID
PRODUCER_ANCESTRY_UNPROVEN BASE_IDENTITY_UNPROVEN COLLECTION_MODE_UNPROVEN LATEST_OBSERVATION_UNPROVEN
PRODUCER_NOT_SUCCESSFUL RECORD_FRESHNESS_COMPLETENESS_UNPROVEN SOURCE_STAGE_UNPROVEN
SOURCE_TIME_BINDING_UNPROVEN SOURCE_WORKFLOW_UNPROVEN TABLE_RECORD_BINDING_UNPROVEN
FETCH_PROFILE_CONTEXT_UNAVAILABLE FETCH_PROFILE_MISMATCH FETCH_PROFILE_ANCESTRY_UNPROVEN
BASE_SCAN_ATTEMPT_UNPROVEN BASE_SCAN_CENSUS_UNPROVEN BASE_SCAN_PRODUCER_UNPROVEN BASE_SCAN_RECORD_UNPROVEN
DEV_TIP_CHANGED GUIDES_PUBLICATION_UNPROVEN PUBLICATION_ANCESTRY_UNPROVEN PUBLICATION_ARCHIVE_OVERSIZED
PUBLICATION_ATTEMPT_UNPROVEN PUBLICATION_RECEIPT_IDENTITY_MISMATCH PUBLISHED_OUTPUT_MISMATCH PUBLISHED_RECORD_MISMATCH
AMBIGUOUS_RECORD FUTURE_OBSERVATION MISSING_OBSERVATION_TIME NO_RECORD_NOT_DELETION OUTPUT_IDENTITY_MISMATCH
RECORD_IDENTITY_MISMATCH STALE_OBSERVATION UNACTIVATED_SHARED_RECORD UNKNOWN_CHANNEL
CROSS_UNIT_DEPENDENCY_UNAVAILABLE GUIDES_INPUT_UNAVAILABLE GUIDES_ENVELOPE_UNAVAILABLE
INPUT_UNAVAILABLE MATERIAL_UNAVAILABLE SOURCE_HISTORY_UNAVAILABLE NON_FORWARD_HISTORY
PREPARED_NEXT_MATERIAL_REQUIRED CROSS_REPOSITORY_OR_EXECUTION_PINS EXISTING_UNIT_AUTHENTICATION_REQUIRED
SUBJECT_OBSERVATION_UNAVAILABLE UPDATE_OBSERVATION_UNAVAILABLE
CONFIGURATION_ONLY NO_FORWARD_RELEVANT_DELTA LIFECYCLE_UNKNOWN LIFECYCLE_RETIRE CONTENT_FAILURE_REQUIRES_REVIEW
STAGED_ARCHIVE_UNAVAILABLE METADATA_BROKER_FAILED SOURCE_ARCHIVE_EXTRACT_FAILED SOURCE_BUNDLE_INVALID
LIFECYCLE_INFRA_DIAGNOSTIC_UNAVAILABLE
""".split())


def reason_codes(values, closed=True):
    if not isinstance(values, list) or len(values) > 128:
        return []
    secrets = [os.environ.get(key) for key in ("GH_TOKEN", "GITHUB_TOKEN") if os.environ.get(key)]
    codes = [code for code in values if isinstance(code, str) and len(code) <= 100
             and (not closed and re.fullmatch(r"[A-Z0-9_]{1,100}", code)
                  or code in DIAGNOSTIC_REASONS
                  or re.fullmatch(r"LIFECYCLE_METADATA_HTTP_[1-5][0-9]{2}", code))
             and not any(secret in code for secret in secrets)]
    return list(dict.fromkeys(codes))


def child_reason_codes(values):
    return [code for code in reason_codes(values, closed=False) if not code.startswith("LIFECYCLE_ACQUIRE_")]


BROKER_ERRORS = frozenset({
    "Guides metadata request limit exceeded", "Invalid Guides metadata frame size", "Guides metadata channel closed",
    "Guides metadata read failed", "Unexpected Guides metadata response sequence", "Unexpected Guides metadata operation",
    "Guides metadata channel does not serve archives",
})


def infrastructure_codes(errors):
    unavailable = "LIFECYCLE_INFRA_DIAGNOSTIC_UNAVAILABLE"
    if not isinstance(errors, list) or len(errors) > 128:
        return [unavailable]
    codes = []
    for error in errors:
        message = error.get("message") if isinstance(error, dict) else None
        if not isinstance(message, str) or len(message) > 16384:
            codes.append(unavailable)
            continue
        prefix = "Lifecycle infrastructure: "
        if not message.startswith(prefix):
            continue
        failure = message[len(prefix):]
        literal = failure.removeprefix("Error: ")
        http = re.fullmatch(r"(?:Public )?GitHub lifecycle read failed \(HTTP ([1-5][0-9]{2})\)", literal)
        if literal == "Authenticated lifecycle archive unavailable":
            codes.append("STAGED_ARCHIVE_UNAVAILABLE")
        elif http:
            codes.append("LIFECYCLE_METADATA_HTTP_" + http[1])
        elif literal in BROKER_ERRORS:
            codes.append("METADATA_BROKER_FAILED")
        elif failure.startswith("Error: Command failed: python3 "):
            codes.append("SOURCE_ARCHIVE_EXTRACT_FAILED")
        elif failure.startswith("Error: Invalid shared source bundle:"):
            codes.append("SOURCE_BUNDLE_INVALID")
        else:
            codes.append(unavailable)
    return reason_codes(codes)


def held_diagnostic_codes(directory):
    """Best-effort measured reasons only. Missing diagnostics never alter the original hold."""
    try:
        # Reject aliased ancestors as well as leaf symlinks before any retained reads.
        for path in (directory, directory / "units", directory / "blobs"):
            require(path.resolve(strict=True) == path and stat.S_ISDIR(path.lstat().st_mode), "B2_DIAGNOSTICS_UNAVAILABLE")
        units = directory / "units"
        paths = []
        with os.scandir(units) as entries:
            for entry in entries:
                paths.append(units / entry.name)
                require(len(paths) == 1, "B2_DIAGNOSTICS_UNAVAILABLE")
        require(len(paths) == 1, "B2_DIAGNOSTICS_UNAVAILABLE")
        with os.fdopen(os.open(paths[0], os.O_RDONLY | os.O_NONBLOCK | os.O_NOFOLLOW), "rb") as handle:
            info = os.fstat(handle.fileno())
            require(stat.S_ISREG(info.st_mode) and 0 < info.st_size <= 1024**2, "B2_DIAGNOSTICS_UNAVAILABLE")
            raw = handle.read(1024**2 + 1)
        require(len(raw) == info.st_size, "B2_DIAGNOSTICS_UNAVAILABLE")
        unit = json.loads(raw)
        canonical = lambda value: json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
        key = "guides:" + sha256(canonical([SUBJECT]))
        require(unit["kind"] == "shared-update-unit" and type(unit["schemaVersion"]) is int and unit["schemaVersion"] == 1
                and unit["subjects"] == [SUBJECT] and unit["unitKey"] == key
                and paths[0].name == sha256(canonical(key)) + ".json", "B2_DIAGNOSTICS_UNAVAILABLE")
        report_raw, impact_raw, pins_raw = report_material(directory, unit)
        report, impact, pins = (json.loads(raw) for raw in (report_raw, impact_raw, pins_raw))
        require(type(report["detail"]["file"]["bytes"]) is int and report["detail"]["file"]["bytes"] >= 0
                and re.fullmatch(r"launcher-[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}/guides-impact-v1/report\.json",
                             report["detail"]["file"]["path"]), "B2_DIAGNOSTICS_UNAVAILABLE")
        pilots = [row for row in impact["pages"] if row["pageId"] == PAGE]
        require(len(pilots) == 1 and pilots[0]["selected"] is True and pins["offlineReplay"] is False
                and oid(pins["master"]) and oid(pins["dev"])
                and pins["master"] == report["pins"]["configSnapshot"] and pins["dev"] == report["pins"]["dev"]
                and pins["lifecycle"].get("observedPage", PAGE) == PAGE, "B2_DIAGNOSTICS_UNAVAILABLE")
        groups = [unit["holdReasons"], report["authority"]["reasons"], pins["lifecycle"]["reasons"],
                  pilots[0].get("reasons", []), pilots[0]["lifecycle"]["reasons"],
                  infrastructure_codes(impact["infrastructureErrors"])]
        require(all(isinstance(values, list) and len(values) <= 128 for values in groups), "B2_DIAGNOSTICS_UNAVAILABLE")
        return sorted(set(code for values in groups for code in reason_codes(values)))[:128]
    except Exception:
        # Never retain file names, response bodies, exception text or credentials here.
        return reason_codes(["B2_DIAGNOSTICS_UNAVAILABLE"], closed=False)


def authority(root, unit, pins, run):
    report_raw, _, pins_raw = report_material(root / "plan", unit)
    report = json.loads(report_raw)
    source = report["pins"]["source"]
    require(report["subject"] == SUBJECT and source["track"] == TRACK and source["target"] == source["observedTrackHead"] == pins["source"]
            and source["current"] == pins["current"] and source["oldNext"] == pins["next"]
            and report["authority"]["updateState"] == "eligible-to-propose"
            and report["authority"]["reasons"] == []
            and any(axis["axis"] == "old-next-to-target" and axis["sourceChanged"] is True for axis in report["axes"]),
            "NO_ELIGIBLE_SOURCE_CHANGE")
    # The exact B1 pins blob inside the authenticated B2 report identifies
    # what the measured collection used, independent of the discovery result.
    observed = json.loads(pins_raw)
    require(observed.get("offlineReplay") is False and observed.get("master") == pins["master"]
            and observed.get("dev") == pins["dev"] and "lifecycle" in observed, "MISSING_LIFECYCLE_PINS")
    row = observed["lifecycle"]
    require(row["runId"] == row["latestRunId"] == run["id"] and row["attempt"] == run["run_attempt"]
            and row["masterSha"] == run["head_sha"] and row["sampledDev"] == pins["dev"]
            and row["observedPage"] == PAGE and row["reasons"] == [], "REVIEWED_FETCH_EVIDENCE_MISSING")
    if "producerAuthentication" in row:
        method = row["producerAuthentication"]
        require(isinstance(method, dict) and set(method) == {"kind", "trustedTools", "producer", "profileSha256"}
                and method["kind"] == "fetch-producer-profile-v1" and "producerInventorySha256" not in row
                and oid(method["trustedTools"]) and oid(method["producer"])
                and isinstance(observed.get("tools"), dict)
                and method["trustedTools"] == pins["master"] == observed["tools"].get("zdoc") == report["pins"].get("trustedTools")
                and method["producer"] == run["head_sha"]
                and isinstance(method["profileSha256"], str) and DIGEST.fullmatch(method["profileSha256"]),
                "REVIEWED_FETCH_EVIDENCE_MISSING")
        producer_evidence = {"producerAuthentication": method}
    else:
        inventory = row.get("producerInventorySha256")
        require(isinstance(inventory, str) and DIGEST.fullmatch(inventory), "REVIEWED_FETCH_EVIDENCE_MISSING")
        producer_evidence = {"producerInventorySha256": inventory}
    run_id, attempt = run["id"], run["run_attempt"]
    return {"fetchRun": run_id, "fetchAttempt": attempt, "fetchProducer": run["head_sha"],
            "sourceJob": row["sourceJobId"], "scanStart": row["generatedAt"],
            **producer_evidence,
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
    raw_patch = blob(directory, proof["patch"], 1024**2)
    require(proof["nextEdits"] == [edit] and edit["subject"] == SUBJECT and edit["target"] == pins["source"]
            and edit["before"] == {"current": pins["current"], "next": pins["next"], "path": LOCK, "sha256": sha256(before)}
            and edit["afterBlob"]["sha256"] == sha256(after)
            and raw_patch == git(repo, "diff", "--raw", "--no-abbrev", "-z", master, candidate),
            "B2_PATCH_MISMATCH")
    patch = git(repo, "diff", "--no-ext-diff", master, candidate)
    git(tool, "apply", "--check", "-", data=patch)
    report_raw, impact_raw, pins_raw = report_material(directory, unit)
    report_directory = root / "report-evidence"
    report_directory.mkdir(mode=0o700)
    (report_directory / "reports").mkdir()
    (report_directory / "guides-impact-v1").mkdir()
    for name, raw in (("reports/" + unit["reports"][0]["sha256"] + ".json", report_raw), ("patch.raw", raw_patch),
                      ("guides-impact-v1/pins.json", pins_raw), ("guides-impact-v1/report.json", impact_raw)):
        (report_directory / name).write_bytes(raw)
    for name, raw in (("report.json", report_raw), ("before.lock", before), ("after.lock", after), ("unit-plan.json", plan_raw),
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
    record["reasons"] = child_reason_codes(unit["holdReasons"])
    for path in (root / "plan").glob("launcher-*/guides-impact-v1/pins.json"):
        reasons = read(path).get("lifecycle", {}).get("reasons", [])
        record["reasons"].extend(child_reason_codes(reasons))
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
        record["reasons"] = list(dict.fromkeys([*record["reasons"], *error.diagnostic_codes, str(error)]))
    except Exception as error:
        # Never log an authenticated HTTP response, request URL, environment or child stderr.
        record["reasons"].append(str(error) if isinstance(error, RuntimeError) else type(error).__name__)
        code = 1
    write(evidence / "preparation.json", record)
    output("status", record["status"])
    if record["status"] == "prepared":
        output("candidate", record["candidate"])
        output("report_evidence", root / "report-evidence")
    print(json.dumps({"status": record["status"], "reasons": record["reasons"]}))
    return code


_BATCH_MAX = 64 * 1024**2
_BATCH_TAGS = {"discovery", "material", "materials", "closure", "scope", "qualifier", "index", "control"}


def batch_exact(value, fields):
    require(type(value) is dict and set(value) == set(fields.split()), "BATCH_SCHEMA_INVALID")
    return value


def batch_canonical(value):
    def quote(text):
        require(type(text) is str and not any(0xd800 <= ord(c) <= 0xdfff for c in text), "BATCH_UNICODE_INVALID")
        return '"' + ''.join('\\"' if c == '"' else '\\\\' if c == '\\' else f'\\u{ord(c):04x}' if ord(c) < 32 else c for c in text) + '"'

    def encode(item):
        if item is None:
            return "null"
        if type(item) is bool:
            return "true" if item else "false"
        if type(item) is int:
            require(abs(item) <= 9007199254740991, "BATCH_NUMBER_INVALID")
            return str(item)
        if type(item) is str:
            return quote(item)
        if type(item) is list:
            return '[' + ','.join(encode(v) for v in item) + ']'
        require(type(item) is dict and all(type(k) is str for k in item), "BATCH_SCHEMA_INVALID")
        for key in item:
            quote(key)
        return '{' + ','.join(quote(k) + ':' + encode(item[k]) for k in sorted(item, key=lambda k: k.encode('utf-8'))) + '}'
    try:
        return encode(value).encode('utf-8')
    except (UnicodeError, RecursionError):
        raise Hold("BATCH_CANONICAL_INVALID")


def batch_parse(raw, canonical=True):
    def pairs(items):
        result = {}
        for key, value in items:
            require(key not in result, "BATCH_DUPLICATE_KEY")
            result[key] = value
        return result

    def integer(text):
        require(text != "-0" and abs(int(text)) <= 9007199254740991, "BATCH_NUMBER_INVALID")
        return int(text)

    def forbidden(_text):
        raise Hold("BATCH_NUMBER_INVALID")

    def original_float(text):
        value = float(text)
        require(math.isfinite(value), "BATCH_NUMBER_INVALID")
        return value

    def original_unicode(value):
        if type(value) is str:
            require(not any(0xd800 <= ord(c) <= 0xdfff for c in value), "BATCH_UNICODE_INVALID")
        elif type(value) is dict:
            for key, child in value.items():
                original_unicode(key)
                original_unicode(child)
        elif type(value) is list:
            for child in value:
                original_unicode(child)
    try:
        require(not raw.startswith(b'\xef\xbb\xbf'), "BATCH_CANONICAL_INVALID")
        value = json.loads(raw.decode('utf-8'), object_pairs_hook=pairs, parse_int=integer if canonical else int,
                           parse_float=forbidden if canonical else original_float, parse_constant=forbidden)
        if not canonical:
            original_unicode(value)
            return value
        encoded = batch_canonical(value)
        require(not canonical or encoded == raw, "BATCH_CANONICAL_INVALID")
        return value
    except (ValueError, UnicodeError, RecursionError):
        raise Hold("BATCH_CANONICAL_INVALID")


def batch_digest(tag, value):
    require(tag in _BATCH_TAGS, "BATCH_DIGEST_TAG_INVALID")
    return sha256(f"zdoc/guides-batch/{tag}/v1\n".encode() + batch_canonical(value))


def validate_profile_method(row, *, expected_kind, master, producer, observed_tool, expected_digest):
    batch_exact(row, "kind trustedTools producer profileSha256")
    require(expected_kind in ("fetch-producer-profile-v1", "fetch-producer-profile-v2")
            and row["kind"] == expected_kind and oid(master) and oid(producer)
            and row["trustedTools"] == master == observed_tool and row["producer"] == producer
            and type(expected_digest) is str and DIGEST.fullmatch(expected_digest)
            and row["profileSha256"] == expected_digest, "BATCH_PROFILE_METHOD_INVALID")
    return row


def batch_sorted(values, key=lambda value: value):
    require(type(values) is list, "BATCH_SCHEMA_INVALID")
    keys = [key(v).encode('utf-8') for v in values]
    require(all(a < b for a, b in zip(keys, keys[1:])), "BATCH_MEMBER_SET_INVALID")
    return values


def batch_path(path):
    require(type(path) is str and path and not path.startswith('/') and '\\' not in path
            and not any(c in path for c in '\0\r\n') and all(p not in ('', '.', '..') for p in path.split('/')),
            "BATCH_PATH_INVALID")
    return path


def batch_ref(ref):
    batch_exact(ref, "path sha256 bytes")
    require(type(ref["sha256"]) is str and DIGEST.fullmatch(ref["sha256"])
            and ref["path"] == 'blobs/' + ref["sha256"] and type(ref["bytes"]) is int
            and 0 <= ref["bytes"] <= _BATCH_MAX, "BATCH_REF_INVALID")
    return ref


class _BatchReader:
    """Held directory descriptors only; hash each distinct raw blob once.

    Cache small typed projections, never the full raw/source/output byte set.
    """
    def __init__(self, root_fd, blobs_fd, control):
        self.root_fd, self.blobs_fd = root_fd, blobs_fd
        self.seen, self.objects, self.total = {}, {}, 0
        self.root_identity = self.identity(root_fd)
        self.blobs_identity = self.identity(blobs_fd)
        require(self.root_identity == control["rootIdentity"] and self.blobs_identity == control["blobsIdentity"],
                "BATCH_ROOT_IDENTITY_INVALID")
        check = os.open('blobs', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=root_fd)
        try:
            require(self.identity(check) == self.blobs_identity, "BATCH_ROOT_IDENTITY_INVALID")
        finally:
            os.close(check)

    @staticmethod
    def identity(fd):
        info = os.fstat(fd)
        require(stat.S_ISDIR(info.st_mode), "BATCH_ROOT_IDENTITY_INVALID")
        return {"dev": str(info.st_dev), "ino": str(info.st_ino)}

    def blob(self, ref, parse=False, original=False, git_kind=None, git_oid=None, transient=False, raw_bytes=False):
        batch_ref(ref)
        digest = ref["sha256"]
        if digest in self.seen:
            require(self.seen[digest][0] == ref["bytes"], "BATCH_BLOB_BINDING_INVALID")
            if git_kind is None and not transient and not raw_bytes:
                if parse:
                    require(digest in self.objects, "BATCH_TYPED_ALIAS_INVALID")
                    return self.objects[digest]
                return self.seen[digest]
        fd = os.open(digest, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=self.blobs_fd)
        chunks = [] if parse or git_kind is not None or raw_bytes else None
        try:
            before = os.fstat(fd)
            require(stat.S_ISREG(before.st_mode) and before.st_nlink == 1 and before.st_size == ref["bytes"], "BATCH_BLOB_TYPE_INVALID")
            sha, git_sha = hashlib.sha256(), hashlib.sha1(f'blob {before.st_size}\0'.encode())
            size = 0
            while True:
                chunk = os.read(fd, min(65536, ref["bytes"] + 1 - size))
                if not chunk:
                    break
                size += len(chunk)
                require(size <= ref["bytes"], "BATCH_BLOB_EXTENT_INVALID")
                sha.update(chunk)
                git_sha.update(chunk)
                if chunks is not None:
                    chunks.append(chunk)
            after = os.fstat(fd)
            signature = lambda st: (st.st_dev, st.st_ino, st.st_size, st.st_mtime_ns, st.st_ctime_ns, st.st_nlink, st.st_mode)
            require(signature(before) == signature(after) and size == ref["bytes"] and sha.hexdigest() == digest,
                    "BATCH_BLOB_BINDING_INVALID")
            if digest not in self.seen:
                self.total += size
                require(self.total <= 12 * 1024**3 + 192 * 1024**2, "BATCH_CAS_INPUT_LIMIT")
                self.seen[digest] = (size, git_sha.hexdigest())
            if git_kind is not None:
                raw = b''.join(chunks)
                require(hashlib.sha1(f'{git_kind} {size}\0'.encode() + raw).hexdigest() == git_oid,
                        'BATCH_SOURCE_GIT_IDENTITY_INVALID')
                return _batch_git_commit(raw) if git_kind == 'commit' else _batch_git_tree(raw)
            if raw_bytes:
                return b''.join(chunks)
            if parse:
                result = batch_parse(b''.join(chunks), canonical=not original)
                if not transient:
                    self.objects[digest] = result
                return result
            return self.seen[digest]
        finally:
            os.close(fd)

    def object(self, ref, fields, transient=False):
        return batch_exact(self.blob(ref, parse=True, transient=transient), fields)

    def finish(self):
        require(self.identity(self.root_fd) == self.root_identity and self.identity(self.blobs_fd) == self.blobs_identity,
                "BATCH_ROOT_IDENTITY_INVALID")


def _batch_base(base):
    batch_exact(base, 'origin session pins')
    require(type(base['session']) is str and DIGEST.fullmatch(base['session']), 'BATCH_BASE_INVALID')
    pins = batch_exact(base['pins'], 'master dev source trustedTools toolsetSha256')
    require(all(oid(pins[k]) for k in ('master', 'dev', 'source', 'trustedTools'))
            and pins['master'] == pins['trustedTools'] and DIGEST.fullmatch(pins['toolsetSha256']), 'BATCH_BASE_INVALID')
    origin = base['origin']
    if origin.get('kind') == 'observed':
        batch_exact(origin, 'kind')
    else:
        batch_exact(origin, 'kind fixtureSha256 replayClockMs')
        require(origin['kind'] == 'replay' and DIGEST.fullmatch(origin['fixtureSha256'])
                and type(origin['replayClockMs']) is int and origin['replayClockMs'] >= 0, 'BATCH_BASE_INVALID')
    return pins


def _batch_targets(targets):
    batch_sorted(targets, lambda t: t['manual'])
    require(targets, 'BATCH_TARGETS_INVALID')
    for target in targets:
        batch_exact(target, 'manual path')
        require(target['manual'] in ('guides', 'guides-byoc'), 'BATCH_TARGETS_INVALID')
        batch_path(target['path'])
    return targets


def _batch_output_target(output, targets):
    matches = [target for target in targets if target['manual'] == output['manual']]
    require(len(matches) == 1, 'BATCH_OUTPUT_INVALID')
    return matches[0]


def _batch_receipt_outputs(outputs):
    for output in outputs:
        batch_exact(output, 'manual path sha256')
    return sorted(outputs, key=lambda output: (output['manual'] + ':' + output['path']).encode('utf-8'))


def _batch_git_commit(raw):
    header, separator, _ = raw.partition(b'\n\n')
    lines = header.split(b'\n')
    match = re.fullmatch(rb'tree ([0-9a-f]{40})', lines[0])
    require(separator and match, 'BATCH_SOURCE_GIT_IDENTITY_INVALID')
    parents = []
    for index, line in enumerate(lines[1:], 1):
        require(not line.startswith(b'tree '), 'BATCH_SOURCE_GIT_IDENTITY_INVALID')
        if line.startswith(b'parent '):
            match_parent = re.fullmatch(rb'parent ([0-9a-f]{40})', line)
            require(index == len(parents) + 1 and match_parent, 'BATCH_SOURCE_GIT_IDENTITY_INVALID')
            parents.append(match_parent[1].decode('ascii'))
    return match[1].decode('ascii'), parents


def _batch_git_tree(raw):
    values = {}
    previous = b''
    offset = 0
    while offset < len(raw):
        space = raw.find(b' ', offset)
        end = raw.find(b'\0', space + 1)
        require(offset < space < end - 1 and end + 21 <= len(raw), 'BATCH_SOURCE_INVENTORY_INVALID')
        mode = raw[offset:space]
        try:
            name = raw[space + 1:end].decode('utf-8')
        except UnicodeDecodeError:
            raise Hold('BATCH_SOURCE_INVENTORY_INVALID') from None
        require(mode in (b'40000', b'100644', b'100755', b'120000', b'160000') and '/' not in name
                and name not in values, 'BATCH_SOURCE_INVENTORY_INVALID')
        _batch_inventory_path(name)
        key = raw[space + 1:end] + (b'/' if mode == b'40000' else b'')
        require(previous < key, 'BATCH_SOURCE_INVENTORY_INVALID')
        values[name] = mode, raw[end + 1:end + 21].hex()
        previous = key
        offset = end + 21
    return values


def _batch_inventory_path(path):
    batch_path(path)
    require(not re.match('^[a-zA-Z]:', path) and all(ord(c) >= 32 and not 127 <= ord(c) <= 159 for c in path),
            'BATCH_SOURCE_INVENTORY_INVALID')
    return path


# Exact path classification used by the renderer's Milvus discovery.
_BATCH_DISCOVERY_IGNORED = frozenset(('README.md', 'Variables.json', '.DS_Store', 'fragments', 'menuStructure',
                                     '.git', 'home', 'template', '_md2md_demo', 'release_notes', 'Tips.json'))


class _BatchGitInventory:
    def __init__(self, reader, proof, parents):
        self.reader, self.parents = reader, parents
        self.refs, self.trees, self.counts, self.commits = {}, {}, {}, {}
        self.metadata, self.reached_metadata = set(), set()
        for row in batch_sorted(proof['trees'], lambda row: row['oid']):
            batch_exact(row, 'oid ref')
            require(oid(row['oid']), 'BATCH_SOURCE_INVENTORY_INVALID')
            self.refs[row['oid']] = batch_ref(row['ref'])
        for row in batch_sorted(proof['discovery'], lambda row: row['oid']):
            batch_exact(row, 'oid metadata')
            require(oid(row['oid']), 'BATCH_SOURCE_INVENTORY_INVALID')
            if row['metadata'] is not None:
                metadata = batch_exact(row['metadata'], 'id title')
                require(type(metadata['id']) is str and type(metadata['title']) is str, 'BATCH_SOURCE_INVENTORY_INVALID')
            self.metadata.add(row['oid'])

    def tree(self, key):
        if key not in self.trees:
            require(key in self.refs, 'BATCH_INVENTORY_TREE_MISSING')
            self.trees[key] = self.reader.blob(self.refs[key], git_kind='tree', git_oid=key)
        return self.trees[key]

    def verify_subtree(self, key, discoverable, visiting):
        state = key, discoverable
        if state in self.counts:
            return self.counts[state]
        require(key not in visiting, 'BATCH_SOURCE_INVENTORY_INVALID')
        visiting.add(key)
        visits = 0
        for name, (mode, target) in self.tree(key).items():
            visits += 1
            eligible = discoverable and name not in _BATCH_DISCOVERY_IGNORED
            if mode == b'40000':
                visits += self.verify_subtree(target, eligible, visiting)
            else:
                require(mode in (b'100644', b'100755'), 'BATCH_SOURCE_INVENTORY_INVALID')
                if eligible and name.endswith('.md'):
                    require(target in self.metadata, 'BATCH_INVENTORY_DISCOVERY_MISSING')
                    self.reached_metadata.add(target)
            require(visits <= 50000, 'BATCH_SOURCE_INVENTORY_INVALID')
        visiting.remove(key)
        self.counts[state] = visits
        return visits

    def inventory(self, value, commit):
        batch_exact(value, 'kind commit treeOid commitRef absentPaths')
        require(value['kind'] == 'guides-batch-git-inventory-v1' and value['commit'] == commit and oid(commit)
                and oid(value['treeOid']), 'BATCH_SOURCE_INVALID')
        ref = batch_ref(value['commitRef'])
        key = commit, ref['sha256'], ref['bytes']
        if key not in self.commits:
            self.commits[key] = self.reader.blob(ref, git_kind='commit', git_oid=commit)
        expected_tree, parents = self.commits[key]
        require(expected_tree == value['treeOid'] and parents == self.parents.get(commit), 'BATCH_SOURCE_GIT_IDENTITY_INVALID')
        site = self.tree(expected_tree).get('site')
        require(site is None or site[0] == b'40000', 'BATCH_SOURCE_INVENTORY_INVALID')
        en = self.tree(site[1]).get('en') if site else None
        if en:
            require(en[0] == b'40000', 'BATCH_SOURCE_INVENTORY_INVALID')
            self.verify_subtree(en[1], True, set())

        def lookup(path):
            if not en or not path.startswith('site/en/'):
                return None
            entry = en
            for name in path[len('site/en/'):].split('/'):
                if not entry or entry[0] != b'40000':
                    return None
                entry = self.tree(entry[1]).get(name)
            return entry[1] if entry and entry[0] in (b'100644', b'100755') else None

        return lookup

    def finish(self):
        require(len(self.trees) == len(self.refs) and self.reached_metadata == self.metadata, 'BATCH_INVENTORY_PROOF_ORPHAN')


def _batch_verify_commit_proof(proof, parents):
    offset = 0
    for commit, declared in parents.items():
        require(offset + 4 <= len(proof), 'BATCH_HISTORY_PROOF_INVALID')
        size = int.from_bytes(proof[offset:offset + 4], 'big')
        offset += 4
        require(size <= len(proof) - offset, 'BATCH_HISTORY_PROOF_INVALID')
        raw = proof[offset:offset + size]
        require(hashlib.sha1(f'commit {size}\0'.encode() + raw).hexdigest() == commit
                and _batch_git_commit(raw)[1] == declared, 'BATCH_HISTORY_PROOF_INVALID')
        offset += size
    require(offset == len(proof), 'BATCH_HISTORY_PROOF_INVALID')


def _batch_render_commits(parents, current, old_next, target, legacy=False):
    def reachable(tip):
        pending, visited = [tip], set()
        while pending:
            commit = pending.pop()
            if commit in visited:
                continue
            require(commit in parents, 'BATCH_HISTORY_INVALID')
            visited.add(commit)
            if not legacy or commit != current:
                pending.extend(parents[commit])
        return visited

    excluded = reachable(old_next)
    included = reachable(target)
    if not legacy:
        require(current in excluded and old_next in included, 'SOURCE_NOT_ANCESTOR')
        require(len(included) == len(parents), 'SOURCE_HISTORY_INCOMPLETE')
    interval = included - excluded
    return sorted((interval | {parent for point in interval for parent in parents[point]}) - {current, old_next, target})


def _batch_material(reader, retained, base):
    batch_exact(retained, 'pageId requestSha256 requestBytes responseSha256 responseBytes materialRef materialDigest')
    header = reader.blob(retained['materialRef'], parse=True)
    fields = 'kind base pageId configRef lockRef targets current oldNext rawMaterialRefs inventoryRefs historyRef renderedManualRefs imagesRef projectionRef diagnosticsRef'
    batch_exact(header, fields + (' detailRef' if base['origin']['kind'] == 'replay' and 'detailRef' in header else ''))
    require(header['kind'] == 'guides-batch-material-v1' and header['base'] == base
            and header['pageId'] == retained['pageId'] and batch_digest('material', header) == retained['materialDigest'], 'BATCH_MATERIAL_BINDING_INVALID')
    for key, maximum in (('requestBytes', 32 * 1024**2), ('responseBytes', 128 * 1024**2)):
        require(type(retained[key]) is int and 0 < retained[key] <= maximum, 'BATCH_LAUNCH_BINDING_INVALID')
    require(all(DIGEST.fullmatch(retained[k]) for k in ('requestSha256', 'responseSha256')), 'BATCH_LAUNCH_BINDING_INVALID')
    _batch_targets(header['targets'])
    config = reader.object(header['configRef'], 'pageId sourceFile repository track registry files namespaceRef')
    require(config['pageId'] == header['pageId'] and config['repository'] == 'https://github.com/milvus-io/milvus-docs'
            and config['track'] == 'v3.0.x', 'BATCH_CONFIG_INVALID')
    batch_sorted(config['registry'], lambda p: p['pageId'])
    for page in config['registry']:
        batch_exact(page, 'pageId sourceFile targets current oldNext')
        _batch_targets(page['targets'])
        require(oid(page['current']) and oid(page['oldNext']), 'BATCH_CONFIG_INVALID')
    configured = [p for p in config['registry'] if p['pageId'] == header['pageId']]
    require(len(configured) == 1 and configured[0]['current'] == header['current'] and configured[0]['oldNext'] == header['oldNext']
            and configured[0]['targets'] == header['targets'] and configured[0]['sourceFile'] == config['sourceFile'], 'BATCH_CONFIG_INVALID')
    batch_sorted(config['files'], lambda f: f['path'])
    for file in config['files']:
        batch_exact(file, 'path oid ref')
        batch_path(file['path'])
        require(reader.blob(file['ref'])[1] == file['oid'], 'BATCH_CONFIG_INVALID')
    lock = next((f for f in config['files'] if f['path'] == f"shared-docs/guides/pages/{header['pageId']}/lock.yaml"), None)
    require(lock and lock['ref'] == header['lockRef'], 'BATCH_CONFIG_INVALID')
    reader.blob(header['lockRef'])
    namespace = reader.object(config['namespaceRef'], 'commit activeRef snapshotRef outputs')
    require(namespace['commit'] == base['pins']['dev'], 'BATCH_NAMESPACE_INVALID')
    reader.blob(namespace['activeRef'])
    reader.blob(namespace['snapshotRef'])
    batch_sorted(namespace['outputs'], lambda o: o['manual'] + ':' + o['path'])
    for output in namespace['outputs']:
        batch_exact(output, 'manual path oid ref')
        require(reader.blob(output['ref'])[1] == output['oid'], 'BATCH_NAMESPACE_INVALID')

    def raw_tree(ref, commit):
        tree = reader.object(ref, 'commit entries')
        require(tree['commit'] == commit, 'BATCH_SOURCE_INVALID')
        batch_sorted(tree['entries'], lambda e: e['path'])
        for entry in tree['entries']:
            batch_exact(entry, 'path oid ref')
            batch_path(entry['path'])
            require(reader.blob(entry['ref'])[1] == entry['oid'], 'BATCH_SOURCE_INVALID')
        return tree

    # Histories and their tree index can be large. Keep their parsed forms only
    # for this page and revalidate the original CAS bytes if another page needs them.
    history = reader.blob(header['historyRef'], parse=True, transient=True)
    compact = 'inventoryProofRef' in history
    exact_history = 'commitProofRef' in history
    if exact_history:
        require(compact, 'BATCH_HISTORY_PROOF_INVALID')
    else:
        require(base['origin']['kind'] == 'replay', 'BATCH_HISTORY_PROOF_REQUIRED')
    fields = 'commits interval'
    if compact:
        fields += ' inventoryProofRef'
    if exact_history:
        fields += ' commitProofRef'
    batch_exact(history, fields)
    require(type(history['commits']) is list and len(history['commits']) <= 50000, 'BATCH_HISTORY_INVALID')
    parents = {}
    for commit in batch_sorted(history['commits'], lambda c: c['oid']):
        batch_exact(commit, 'oid parents')
        require(oid(commit['oid']) and len(set(commit['parents'])) == len(commit['parents']) and all(oid(v) for v in commit['parents']), 'BATCH_HISTORY_INVALID')
        parents[commit['oid']] = commit['parents']
    if exact_history:
        _batch_verify_commit_proof(reader.blob(history['commitProofRef'], raw_bytes=True), parents)
    git_inventory = None
    if compact:
        proof = reader.object(history['inventoryProofRef'], 'trees discovery', transient=True)
        git_inventory = _BatchGitInventory(reader, proof, parents)
        del proof
    inventories = {}
    consumed = {config['sourceFile']} if config['sourceFile'].startswith('site/en/') else set()

    def inventory(ref, commit):
        if git_inventory:
            value = reader.object(ref, 'kind commit treeOid commitRef absentPaths')
            lookup = git_inventory.inventory(value, commit)
        else:
            value = reader.object(ref, 'commit treeOid entries absentPaths discoveryRef')
            require(value['commit'] == commit and oid(value['treeOid']), 'BATCH_SOURCE_INVALID')
            batch_sorted(value['entries'], lambda e: e['path'])
            for entry in value['entries']:
                batch_exact(entry, 'path oid mode')
                require(oid(entry['oid']) and entry['mode'] in ('100644', '100755'), 'BATCH_SOURCE_INVALID')
            lookup = {e['path']: e['oid'] for e in value['entries']}.get
            reader.blob(value['discoveryRef'])
        batch_sorted(value['absentPaths'])
        verify_path = _batch_inventory_path if git_inventory else batch_path
        require(all(lookup(verify_path(path)) is None for path in value['absentPaths']), 'BATCH_SOURCE_ABSENCE_INVALID')
        inventories[ref['sha256']] = lookup, value['absentPaths']
        return lookup

    def manual(ref, expected):
        value = reader.object(ref, 'manual path markdown output headings references')
        require(value['manual'] == expected['manual'] and value['path'] == expected['path'] and type(value['output']) is str
                and type(value['markdown']) is str and type(value['headings']) is list and type(value['references']) is list, 'BATCH_MANUAL_INVALID')
        # Only identity/extent is reused after this validation. Drop large text.
        value['markdown'], value['output'] = '', ''

    def images(ref):
        value = reader.blob(ref, parse=True)
        require(type(value) is list and len(value) == 3, 'BATCH_IMAGE_INVALID')
        for index, group in enumerate(value):
            batch_exact(group, 'role images')
            require(group['role'] == ('current', 'oldNext', 'target')[index], 'BATCH_IMAGE_INVALID')
            seen_images = set()
            for image in group['images']:
                batch_exact(image, 'original origin observed emitted uses ref')
                key = batch_canonical([image['original'], image['origin']])
                require(key not in seen_images and image['ref'] and image['observed'], 'BATCH_IMAGE_INVALID')
                seen_images.add(key)
                require(image['ref']['sha256'] == image['observed']['sha256'] == image['emitted']['sha256']
                        and image['ref']['bytes'] == image['observed']['bytes'], 'BATCH_IMAGE_INVALID')
                reader.blob(image['ref'])

    commits = [header['current'], header['oldNext'], base['pins']['source']]
    trees = []
    for index, role in enumerate(('current', 'oldNext', 'target')):
        edge, inv = header['rawMaterialRefs'][index], header['inventoryRefs'][index]
        batch_exact(edge, 'role commit ref')
        batch_exact(inv, 'role commit ref')
        require(edge['role'] == inv['role'] == role and edge['commit'] == inv['commit'] == commits[index], 'BATCH_SOURCE_INVALID')
        tree, listing = raw_tree(edge['ref'], commits[index]), inventory(inv['ref'], commits[index])
        require(all(listing(f['path']) == f['oid'] for f in tree['entries']), 'BATCH_SOURCE_INVALID')
        consumed.update(f['path'] for f in tree['entries'])
        trees.append(tree)
    batch_sorted(history['interval'], lambda o: o['commit'])
    for observation in history['interval']:
        batch_exact(observation, 'commit sourceFile rawRef inventoryRef manuals imagesRef diagnosticsRef dependencies outputStatus imageStatus')
        raw = raw_tree(observation['rawRef'], observation['commit'])
        listing = inventory(observation['inventoryRef'], observation['commit'])
        if git_inventory:
            require(all(listing(f['path']) == f['oid'] for f in raw['entries']), 'BATCH_SOURCE_INVALID')
            consumed.update(f['path'] for f in raw['entries'])
        for output in observation['manuals']:
            batch_exact(output, 'manual path ref')
            manual(output['ref'], output)
        images(observation['imagesRef'])
        reader.object(observation['diagnosticsRef'], 'errors rawErrors reasons')
    if git_inventory:
        git_inventory.finish()
        require([o['commit'] for o in history['interval']] == _batch_render_commits(parents, *commits, legacy=not exact_history),
                'BATCH_HISTORY_INVALID')
        paths = sorted(consumed, key=lambda path: path.encode('utf-8'))
        for lookup, absent in inventories.values():
            require(absent == [path for path in paths if lookup(path) is None], 'BATCH_SOURCE_ABSENCE_INVALID')
    for output in header['renderedManualRefs']:
        batch_exact(output, 'role manual path ref')
        manual(output['ref'], output)
    images(header['imagesRef'])
    projection = reader.object(header['projectionRef'], 'pageId observations promotionAnchors sourceAnchors')
    require(projection['pageId'] == header['pageId'] and len(projection['observations']) == 3, 'BATCH_PROJECTION_INVALID')
    for index, observation in enumerate(projection['observations']):
        batch_exact(observation, 'role commit sourceFile consumed manuals dependencies outputStatus imageStatus hasChannelRules')
        require(observation['role'] == ('current', 'oldNext', 'target')[index] and observation['commit'] == commits[index]
                and observation['consumed'] == trees[index]['entries'] and observation['outputStatus'] == observation['imageStatus'] == 'observed', 'BATCH_PROJECTION_INVALID')
        for output in observation['manuals']:
            require(any(r['role'] == observation['role'] and all(r[k] == output[k] for k in ('manual', 'path', 'ref')) for r in header['renderedManualRefs']), 'BATCH_PROJECTION_INVALID')
    diagnostics = reader.object(header['diagnosticsRef'], 'errors rawErrors reasons')
    require(diagnostics == {'errors': [], 'rawErrors': [], 'reasons': []}, 'BATCH_MATERIAL_DIAGNOSTICS')
    if 'detailRef' in header:
        detail = reader.object(header['detailRef'], 'kind pageId configPaths targets observations')
        require(detail['kind'] == 'guides-batch-material-detail-v1' and detail['pageId'] == header['pageId']
                and sorted(detail['targets'], key=lambda t: t['manual']) == header['targets']
                and len(detail['observations']) == 3, 'BATCH_MATERIAL_DETAIL_INVALID')
        files = {file['path']: file['ref']['sha256'] for file in config['files']}
        batch_sorted(detail['configPaths'])
        require(detail['configPaths'] and all(p in files for p in detail['configPaths']), 'BATCH_MATERIAL_DETAIL_INVALID')
        for i, endpoint in enumerate(detail['observations']):
            batch_exact(endpoint, 'role commit buildLock engine localInputs blocks diagnosticsRef')
            engine = batch_exact(endpoint['engine'], 'name version')
            require(endpoint['role'] == projection['observations'][i]['role'] and endpoint['commit'] == commits[i]
                    and endpoint['buildLock'] == {'current': commits[0], 'next': commits[1 if i == 1 else 2]}
                    and all(isinstance(v, str) and v for v in engine.values()), 'BATCH_MATERIAL_DETAIL_INVALID')
            batch_sorted(endpoint['localInputs'], lambda f: f['file'])
            inputs = {batch_exact(f, 'file sha256')['file']: f['sha256'] for f in endpoint['localInputs']}
            require(set(detail['configPaths']) <= set(inputs) and all(files.get(p) == v for p, v in inputs.items()), 'BATCH_MATERIAL_DETAIL_INVALID')
            for block in endpoint['blocks']:
                batch_exact(block, 'id type startLine endLine languages summary')
                require(block['type'] in ('markdown', 'code-group') and 0 < block['startLine'] <= block['endLine']
                        and isinstance(block['summary'], str) and isinstance(block['languages'], list)
                        and all(v is None or isinstance(v, str) for v in block['languages']), 'BATCH_MATERIAL_DETAIL_INVALID')
            endpoint_diagnostics = reader.object(endpoint['diagnosticsRef'], 'errors rawErrors reasons')
            require(endpoint_diagnostics == {'errors': [], 'rawErrors': [], 'reasons': []}, 'BATCH_MATERIAL_DIAGNOSTICS')
    return header, [p['pageId'] for p in config['registry']]


def _batch_verify_restorations(reader, report, ledger, history):
    """Validate the narrow merged feature edit/revert exception from retained raw evidence."""
    pairs = {}
    fields = 'commit parent oldPath newPath oldOid newOid oldMode newMode rangeIds associationResult introductionOid seedKey evidenceRefs evidence reasons'
    for index, edge in enumerate(ledger):
        restored = edge.get('associationResult') == 'restored'
        batch_exact(edge, fields + (' restorationRef' if restored else ''))
        for ref in edge['evidenceRefs']:
            reader.blob(ref)
        if restored:
            proof_ref = batch_ref(edge['restorationRef'])
            pairs.setdefault(proof_ref['sha256'], []).append((index, edge))
    if not pairs:
        return {}

    def checked(condition):
        require(condition, 'BATCH_RESTORE_PROOF_INVALID')

    checked(len(history) <= 50_000 and len(pairs) <= 1000)
    graph = {}
    for entry in batch_sorted(history, lambda row: row['oid']):
        batch_exact(entry, 'oid parents')
        checked(oid(entry['oid']) and type(entry['parents']) is list and all(oid(p) for p in entry['parents']))
        graph[entry['oid']] = entry['parents']
    git_indexes, commits, trees, ancestor_sets = {}, {}, {}, {}

    def git_ref(proof_ref, key, kind):
        digest = batch_ref(proof_ref)['sha256']
        if digest not in git_indexes:
            proof = reader.object(proof_ref, 'objects', transient=True)
            index = {}
            for item in batch_sorted(proof['objects'], lambda row: row['oid']):
                batch_exact(item, 'oid kind ref')
                checked(oid(item['oid']) and item['kind'] in ('tree', 'commit', 'blob'))
                index[item['oid']] = item['kind'], batch_ref(item['ref'])
            git_indexes[digest] = index
        item = git_indexes[digest].get(key)
        checked(item is not None and item[0] == kind)
        return item[1]

    def commit(git, key):
        cache_key = git['sha256'], key
        if cache_key not in commits:
            ref = git_ref(git, key, 'commit')
            value = reader.blob(ref, git_kind='commit', git_oid=key)
            checked(value[1] == graph.get(key))
            commits[cache_key] = value
        return commits[cache_key]

    def ancestors(git, tip):
        key = git['sha256'], tip
        if key not in ancestor_sets:
            seen, pending = set(), [tip]
            while pending:
                child = pending.pop()
                if child in seen:
                    continue
                seen.add(child)
                pending.extend(commit(git, child)[1])
            ancestor_sets[key] = seen
        return ancestor_sets[key]

    def file(git, c, path):
        tree = commit(git, c)[0]
        identity = b'40000', tree
        for name in path.split('/'):
            checked(identity[0] == b'40000')
            key = git['sha256'], identity[1]
            if key not in trees:
                ref = git_ref(git, identity[1], 'tree')
                trees[key] = reader.blob(ref, git_kind='tree', git_oid=identity[1])
            identity = trees[key].get(name)
            checked(identity is not None)
        ref = git_ref(git, identity[1], 'blob')
        checked(reader.blob(ref)[1] == identity[1])
        return identity

    def reply(ref, suffix, evidence):
        ref = batch_ref(ref)
        checked(0 < ref['bytes'] <= 2 * 1024**2)
        request = sha256(f'GET /repos/milvus-io/milvus-docs{suffix}\n200\n'.encode())
        checked(f"api:{request}:{ref['sha256']}" in evidence)
        return batch_parse(reader.blob(ref, raw_bytes=True), canonical=False)

    def fixed_repository(pull):
        repo = pull['base']['repo']
        return repo['id'] == 267273319 and repo['full_name'] == 'milvus-io/milvus-docs'

    def related(pull, number, head):
        return (type(pull['number']) is int and pull['number'] == number and pull['state'] == 'closed'
                and type(pull['merged_at']) is str and bool(pull['merged_at']) and pull['head']['sha'] == head
                and pull['base']['ref'] == 'v3.0.x' and fixed_repository(pull))

    obligations = {}
    for rows in pairs.values():
        checked(len(rows) == 2)
        _, one = rows[0]
        ref = one['restorationRef']
        proof = reader.object(ref, 'kind path mode original changed first prefix head base merge number rangeIds detailRef filesRef firstAssociationRef headAssociationRef')
        checked(proof['kind'] == 'guides-merged-restore-v1' and all(oid(proof[k]) for k in ('first', 'prefix', 'head', 'base', 'merge', 'original', 'changed')))
        path = batch_path(proof['path'])
        checked(path.startswith('site/en/') and path.endswith(('.md', '.mdx')) and proof['mode'] in ('100644', '100755') and proof['original'] != proof['changed'])
        checked(type(proof['number']) is int and proof['number'] > 0)
        checked(len(one['evidenceRefs']) == 1)
        git = one['evidenceRefs'][0]
        first, prefix, head, base, merge = (proof[k] for k in ('first', 'prefix', 'head', 'base', 'merge'))
        a, b = ((proof['mode'].encode(), proof[k]) for k in ('original', 'changed'))
        checked(commit(git, merge)[1] == [base, head] and commit(git, head)[1] == [first] and commit(git, first)[1] == [prefix])
        earlier = ancestors(git, base)
        reachable = ancestors(git, report['pins']['source'])
        checked(merge in reachable and first not in earlier and head not in earlier)
        checked(file(git, first, path) == b and all(file(git, edge, path) == a for edge in (base, head, merge)))
        point = prefix
        while True:
            checked(file(git, point, path) == a)
            if point in earlier:
                break
            parents = commit(git, point)[1]
            checked(len(parents) == 1)
            point = parents[0]
        range_ids = []
        for page in report['pages']:
            old = ancestors(git, page['oldNext'])
            checked((first not in old) == (head not in old))
            if first not in old:
                range_ids.append(page['pageId'])
        range_ids = sorted(range_ids)
        checked(range_ids and proof['rangeIds'] == range_ids and len(range_ids) == len(set(range_ids)))
        number = proof['number']
        direct = reply(proof['detailRef'], f'/pulls/{number}', one['evidence'])
        files = reply(proof['filesRef'], f'/pulls/{number}/files?per_page=100&page=1', one['evidence'])
        checked(related(direct, number, head) and direct['merged'] is True and direct['merge_commit_sha'] == merge and direct['base']['sha'] in earlier)
        checked(type(files) is list and type(direct['changed_files']) is int and len(files) == direct['changed_files'] < 100)
        names = [batch_path(item['filename']) for item in files]
        checked(len(set(names)) == len(names) and path not in names)
        for item in files:
            previous = item.get('previous_filename')
            if previous is not None:
                checked(batch_path(previous) != path and previous != item['filename'])
            status = item['status']
            checked(oid(item['sha']) and status in ('added', 'modified', 'removed', 'renamed', 'copied', 'changed', 'unchanged')
                    and (previous is not None) == (status in ('renamed', 'copied')))
        bindings = {first: (prefix, a[1], b[1], 'firstAssociationRef'), head: (first, b[1], a[1], 'headAssociationRef')}
        for index, row in rows:
            checked(row['commit'] in bindings)
            parent, old_oid, new_oid, association_ref = bindings.pop(row['commit'])
            checked(row['restorationRef'] == ref and row['evidenceRefs'] == [git] and row['rangeIds'] == range_ids and not row['reasons'])
            checked(row['parent'] == parent and row['oldPath'] == row['newPath'] == path and row['oldMode'] == row['newMode'] == proof['mode'])
            checked(row['oldOid'] == old_oid and row['newOid'] == new_oid and row['seedKey'] == f'pr:{number}' and row['introductionOid'] == merge)
            reply(proof['detailRef'], f'/pulls/{number}', row['evidence'])
            reply(proof['filesRef'], f'/pulls/{number}/files?per_page=100&page=1', row['evidence'])
            found = reply(proof[association_ref], f"/commits/{row['commit']}/pulls?per_page=100&page=1", row['evidence'])
            checked(type(found) is list and 0 < len(found) < 100)
            checked(all(fixed_repository(p) and type(p['number']) is int for p in found) and len({p['number'] for p in found}) == len(found))
            eligible = [p for p in found if p['base']['ref'] == 'v3.0.x' and p['state'] == 'closed' and p['merged_at']]
            checked(len(eligible) == 1 and related(eligible[0], number, head) and eligible[0]['base']['sha'] == direct['base']['sha'])
            label = f"{index}:{parent}:{row['commit']}:{path}"
            for page_id in range_ids:
                obligations[(page_id, label)] = row
        checked(not bindings)
    return obligations


def _batch_verify_restored_obligation(reader, obligation, header, edge):
    reason = 'BATCH_RESTORE_PROOF_INVALID'
    require(obligation['range'] == {'from': header['oldNext'], 'to': header['base']['pins']['source']}
            and obligation['seedKey'] == edge['seedKey']
            and obligation['supportRefs'] == sorted(edge['evidenceRefs'] + [edge['restorationRef']], key=lambda r: r['sha256']), reason)
    history = reader.blob(header['historyRef'], parse=True)
    raw_refs = [(r['commit'], r['ref']) for r in header['rawMaterialRefs']]
    raw_refs.extend((r['commit'], r['rawRef']) for r in history['interval'])
    used = False
    for commit, oid_at_path in ((edge['parent'], edge['oldOid']), (edge['commit'], edge['newOid'])):
        matches = [ref for key, ref in raw_refs if key == commit]
        require(matches, reason)
        for ref in matches:
            raw = reader.object(ref, 'commit entries', transient=True)
            require(raw['commit'] == commit, reason)
            consumed = [entry for entry in raw['entries'] if entry['path'] == edge['newPath']]
            require(len(consumed) <= 1 and all(entry['oid'] == oid_at_path for entry in consumed), reason)
            used = used or bool(consumed)
    require(obligation['status'] == ('consumed' if used else 'irrelevant')
            and obligation['reason'] == ('ACTUAL_CONSUMED_PATH' if used else 'COMPLETE_CONSUMPTION_ABSENCE')
            and obligation['consumedPaths'] == ([edge['newPath']] if used else []), reason)


def verify_batch_collection(root_fd, blobs_fd, control, retained_reader=None):
    batch_exact(control, 'kind base run discoveryRef discoveryDigest closureRef groupSha256 materialRoot materialDigest scopeRef scopeDigest qualifierRequestSha256 qualifierRequestBytes qualifierRef qualifierDigest profileDigest receiptsRoot indexRef indexDigest rootIdentity blobsIdentity')
    require(control['kind'] == 'guides-batch-verify-control-v1', 'BATCH_CONTROL_INVALID')
    pins = _batch_base(control['base'])
    run = batch_exact(control['run'], 'id attempt head')
    require(type(run['id']) is int and run['id'] > 0 and run['attempt'] == 1 and type(run['attempt']) is int and oid(run['head']), 'BATCH_RUN_INVALID')
    require(type(control['qualifierRequestBytes']) is int and 0 < control['qualifierRequestBytes'] <= 32 * 1024**2
            and DIGEST.fullmatch(control['qualifierRequestSha256']), 'BATCH_CONTROL_INVALID')
    reader = retained_reader or _BatchReader(root_fd, blobs_fd, control)
    base = control['base']
    scope = reader.object(control['scopeRef'], 'base run discoveryRef discoveryDigest materialRoot materialDigest closureRef groupSha256 pages')
    for key in ('base', 'run', 'discoveryRef', 'discoveryDigest', 'materialRoot', 'materialDigest', 'closureRef', 'groupSha256'):
        require(scope[key] == control[key], 'BATCH_SCOPE_BINDING_INVALID')
    require(batch_digest('scope', scope) == control['scopeDigest'], 'BATCH_SCOPE_BINDING_INVALID')
    batch_sorted(scope['pages'], lambda p: p['pageId'])
    members = [batch_exact(p, 'pageId materialSha256')['pageId'] for p in scope['pages']]
    require(members and all(re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*', p) for p in members), 'BATCH_MEMBER_SET_INVALID')
    discovery = reader.object(control['discoveryRef'], 'base reportRef edgeLedgerRef introductionOrderRef')
    require(discovery['base'] == base and batch_digest('discovery', discovery) == control['discoveryDigest'], 'BATCH_DISCOVERY_INVALID')
    report = reader.object(discovery['reportRef'], 'schema observation tools pins pages seeds changes dependencies reasons status writeEligible inventory groups')
    require(report['schema'] == 'guides-batch-discovery-v1' and report['tools'] == pins['trustedTools']
            and report['pins'] == {k: pins[k] for k in ('master', 'dev', 'source')} and report['observation'] == base['origin']['kind']
            and report['writeEligible'] is False, 'BATCH_DISCOVERY_INVALID')
    ledger = reader.blob(discovery['edgeLedgerRef'], parse=True)
    history = reader.blob(discovery['introductionOrderRef'], parse=True)
    restored = _batch_verify_restorations(reader, report, ledger, history)
    restoration_refs = {edge['restorationRef']['sha256'] for edge in restored.values()}
    restoration_keys = set(restored)
    materials = reader.object(control['materialRoot'], 'base pages')
    require(materials['base'] == base and batch_digest('materials', materials) == control['materialDigest'], 'BATCH_MATERIAL_BINDING_INVALID')
    batch_sorted(materials['pages'], lambda p: p['pageId'])
    all_ids = [p['pageId'] for p in materials['pages']]
    require(all_ids == sorted([p['pageId'] for p in report['pages']], key=lambda s: s.encode()), 'BATCH_REGISTRY_INVALID')
    headers = {}
    for retained in materials['pages']:
        header, registry = _batch_material(reader, retained, base)
        require(registry == all_ids, 'BATCH_REGISTRY_INVALID')
        headers[retained['pageId']] = header
    closure = reader.object(control['closureRef'], 'base discoveryDigest allMaterialDigest memberIds consideredPageIds componentIds seedKeys intervalRefs obligationRefs adoptionRef namespaceRef dispositionsRef')
    require(closure['base'] == base and closure['discoveryDigest'] == control['discoveryDigest'] and closure['allMaterialDigest'] == control['materialDigest']
            and closure['memberIds'] == members and closure['consideredPageIds'] == all_ids and batch_digest('closure', closure) == control['groupSha256'], 'BATCH_CLOSURE_INVALID')
    for ref in closure['intervalRefs']:
        interval = reader.object(ref, 'base pageId intervals historyRef')
        require(interval['base'] == base and interval['pageId'] in members, 'BATCH_CLOSURE_INVALID')
        require(interval['historyRef'] == headers[interval['pageId']]['historyRef'], 'BATCH_CLOSURE_INVALID')
    for ref in closure['obligationRefs']:
        obligation = reader.object(ref, 'base pageId range edge seedKey status consumedPaths supportRefs reason')
        require(obligation['base'] == base and obligation['pageId'] in all_ids and obligation['status'] in ('consumed', 'irrelevant'), 'BATCH_CLOSURE_INVALID')
        key = obligation['pageId'], obligation['edge']
        restored_edge = restored.pop(key, None)
        if restored_edge:
            _batch_verify_restored_obligation(reader, obligation, headers[obligation['pageId']], restored_edge)
        else:
            require(key not in restoration_keys and not any(support['sha256'] in restoration_refs for support in obligation['supportRefs']),
                    'BATCH_RESTORE_PROOF_INVALID')
        for support in obligation['supportRefs']:
            reader.blob(support)
    require(not restored, 'BATCH_RESTORE_PROOF_INVALID')
    adoption = reader.object(closure['adoptionRef'], 'base dependencies')
    namespace = reader.object(closure['namespaceRef'], 'base destinations')
    require(adoption['base'] == namespace['base'] == base, 'BATCH_CLOSURE_INVALID')
    for destination in namespace['destinations']:
        batch_exact(destination, 'pageId manual path role ref')
        reader.blob(destination['ref'])
    dispositions = reader.object(closure['dispositionsRef'], 'base pages')
    require(dispositions['base'] == base and [p['pageId'] for p in dispositions['pages']] == members, 'BATCH_CLOSURE_INVALID')
    for page in dispositions['pages']:
        batch_exact(page, 'pageId disposition beforeSha256 targetSha256 reasons')
        require(page['disposition'] in ('advance', 'noop') and page['reasons'] == [], 'BATCH_CLOSURE_INVALID')
    q = reader.object(control['qualifierRef'], 'kind base run scopeDigest method sourceArtifact publicationArtifact scanStartMs rows')
    require(q['kind'] == 'guides-batch-qualification-v1' and q['base'] == base and q['run'] == run and q['scopeDigest'] == control['scopeDigest']
            and batch_digest('qualifier', q) == control['qualifierDigest'], 'BATCH_QUALIFIER_BINDING_INVALID')
    method = validate_profile_method(q['method'], expected_kind='fetch-producer-profile-v2', master=pins['master'], producer=run['head'],
                                     observed_tool=pins['trustedTools'], expected_digest=control['profileDigest'])
    for key, limit in (('sourceArtifact', 256 * 1024**2), ('publicationArtifact', 1024**2)):
        artifact_row = batch_exact(q[key], 'id bytes sha256')
        require(type(artifact_row['id']) is int and artifact_row['id'] > 0 and type(artifact_row['bytes']) is int
                and 0 < artifact_row['bytes'] <= limit and DIGEST.fullmatch(artifact_row['sha256']), 'BATCH_ARTIFACT_INVALID')
    require(q['sourceArtifact']['id'] != q['publicationArtifact']['id'] and type(q['scanStartMs']) is int and q['scanStartMs'] >= 0,
            'BATCH_ARTIFACT_INVALID')
    require([r['pageId'] for r in q['rows']] == members, 'BATCH_MEMBER_SET_INVALID')
    receipts = batch_exact(control['receiptsRoot'], 'base scopeDigest qualifierRawSha256 pages')
    require(receipts['base'] == base and receipts['scopeDigest'] == control['scopeDigest'] and receipts['qualifierRawSha256'] == control['qualifierRef']['sha256']
            and [p['pageId'] for p in receipts['pages']] == members, 'BATCH_RECEIPTS_BINDING_INVALID')
    index = reader.object(control['indexRef'], 'kind base run discoveryRef discoveryDigest scopeDigest closureRef groupSha256 materialRoot materialDigest qualifierRef qualifierDigest method receiptsRoot pages obligationsRef writeEligible operations')
    require(index['kind'] == 'guides-batch-collection-index-v1' and index['writeEligible'] is False and index['operations'] == []
            and batch_digest('index', index) == control['indexDigest'], 'BATCH_INDEX_BINDING_INVALID')
    for key in ('base', 'run', 'discoveryRef', 'discoveryDigest', 'scopeDigest', 'closureRef', 'groupSha256', 'materialRoot', 'materialDigest', 'qualifierRef', 'qualifierDigest', 'receiptsRoot'):
        require(index[key] == control[key], 'BATCH_INDEX_BINDING_INVALID')
    require(index['method'] == method and index['obligationsRef'] == closure['obligationRefs'] and [p['pageId'] for p in index['pages']] == members, 'BATCH_INDEX_BINDING_INVALID')
    paths = set()
    for number, row in enumerate(q['rows']):
        batch_exact(row, 'pageId materialDigest configuredTargets current oldNext target observedTrackHead runId attempt method recordId tableId sourceJobId baseline resultSha sampledDev outcomeKind receiptPath receiptOid receiptBytes receiptSha256 outputTuples bundleSha256 publicationSnapshotSha256 publishedOutputsSha256 classification')
        header = headers[row['pageId']]
        require(row['materialDigest'] == scope['pages'][number]['materialSha256'] == batch_digest('material', header)
                and row['current'] == header['current'] and row['oldNext'] == header['oldNext'] and row['configuredTargets'] == header['targets']
                and row['target'] == row['observedTrackHead'] == pins['source'] and row['sampledDev'] == pins['dev']
                and row['runId'] == run['id'] and row['attempt'] == 1 and row['method'] == method
                and row['classification'] == {'state': 'active', 'channel': 'current', 'reasons': []}
                and row['outcomeKind'] in ('success', 'reused'), 'BATCH_ROW_BINDING_INVALID')
        require(oid(row['baseline']) and oid(row['resultSha']) and type(row['sourceJobId']) is int and row['sourceJobId'] > 0
                and all(type(row[k]) is str and DIGEST.fullmatch(row[k]) for k in ('bundleSha256', 'publicationSnapshotSha256', 'publishedOutputsSha256')),
                'BATCH_ROW_BINDING_INVALID')
        retained = batch_exact(receipts['pages'][number], 'pageId recordId receiptPath receiptRef outputs')
        require(all(retained[k] == row[k] for k in ('pageId', 'recordId', 'receiptPath')) and row['receiptPath'] == f"generated/en/manifests/shared-pages/guides/{row['pageId']}.json"
                and retained['receiptRef']['sha256'] == row['receiptSha256'] and retained['receiptRef']['bytes'] == row['receiptBytes'], 'BATCH_RECEIPT_INVALID')
        receipt = reader.blob(retained['receiptRef'], parse=True, original=True)
        require(reader.seen[retained['receiptRef']['sha256']][1] == row['receiptOid'], 'BATCH_RECEIPT_INVALID')
        require(receipt.get('schema_version') == 1 and receipt.get('page') == row['pageId'] and receipt.get('token') == 'shared-' + row['pageId']
                and receipt.get('channel') is None and receipt['inputs']['milvus_docs']['repository'] == 'milvus-io/milvus-docs'
                and receipt['inputs']['milvus_docs']['current'] == row['current'] and oid(receipt['inputs']['milvus_docs']['next']), 'BATCH_CURRENT_OWNER_INVALID')
        if row['outcomeKind'] == 'success':
            require(receipt['inputs']['tools']['zdoc'] == receipt['inputs']['zdoc']['commit'] == run['head']
                    and receipt['inputs']['dev']['commit'] == row['baseline'], 'BATCH_RECEIPT_INVALID')
        nav = receipt['inputs']['fetch']['navigation']['navigationRecords']
        owners = [n for n in nav if n.get('record_id') == row['recordId']]
        require(len(owners) == 1 and owners[0]['table_id'] == row['tableId'] and owners[0]['slug'] == row['pageId']
                and owners[0]['shared_page'] == {'group': 'guides', 'page': row['pageId']}, 'BATCH_RECEIPT_INVALID')
        batch_sorted(row['outputTuples'], lambda o: o['manual'] + ':' + o['path'])
        require(len(row['outputTuples']) == len(row['configuredTargets']) == len(retained['outputs']), 'BATCH_OUTPUT_INVALID')
        render_targets = receipt['inputs']['fetch']['render_targets']['targets']
        expected_outputs = []
        for output, actual in zip(row['outputTuples'], retained['outputs']):
            target = _batch_output_target(output, row['configuredTargets'])
            batch_exact(output, 'manual path oid bytes sha256')
            batch_exact(actual, 'manual path ref')
            require(output['manual'] == actual['manual'] == target['manual'] and output['path'] == actual['path']
                    and actual['ref']['bytes'] == output['bytes'] and actual['ref']['sha256'] == output['sha256'] and output['path'] not in paths, 'BATCH_OUTPUT_INVALID')
            paths.add(output['path'])
            root = 'content/en/guides/' if output['manual'] == 'guides' else 'content/en/byoc/'
            require(output['path'] in (root + target['path'] + '.md', root + target['path'] + '.mdx'), 'BATCH_OUTPUT_INVALID')
            matching = [t for t in render_targets if t['manual'] == target['manual'] and t['path'] == target['path'] and t['channel'] == 'current']
            require(len(matching) == 1 and root + matching[0]['path'] + matching[0]['extension'] == output['path'], 'BATCH_OUTPUT_INVALID')
            require(reader.blob(actual['ref'])[1] == output['oid'], 'BATCH_OUTPUT_INVALID')
            expected_outputs.append({k: output[k] for k in ('manual', 'path', 'sha256')})
        # Original receipts retain producer order and pretty JSON bytes. Compare
        # tuples semantically; never canonicalize/rewrite their raw payload.
        require(_batch_receipt_outputs(receipt['outputs']) == expected_outputs, 'BATCH_OUTPUT_INVALID')
        producer_order = [{k: o[k] for k in ('manual', 'path', 'sha256')} for o in receipt['outputs']]
        require(sha256(json.dumps(producer_order, ensure_ascii=False, separators=(',', ':')).encode('utf-8')) == row['publishedOutputsSha256'], 'BATCH_OUTPUT_INVALID')
        index_page = batch_exact(index['pages'][number], 'pageId materialDigest disposition reportRef pinsRef')
        require(index_page['pageId'] == row['pageId'] and index_page['materialDigest'] == row['materialDigest']
                and index_page['disposition'] == dispositions['pages'][number]['disposition'], 'BATCH_INDEX_BINDING_INVALID')
        report_page = reader.object(index_page['reportRef'], 'kind base pageId materialDigest groupSha256 targets pins disposition supportRefs')
        pins_page = reader.object(index_page['pinsRef'], 'kind base pageId materialDigest groupSha256 row receiptRef outputRefs')
        require(report_page['kind'] == 'guides-batch-qualified-report-v1' and pins_page['kind'] == 'guides-batch-qualified-pins-v1'
                and report_page['base'] == pins_page['base'] == base and report_page['pageId'] == pins_page['pageId'] == row['pageId']
                and report_page['materialDigest'] == pins_page['materialDigest'] == row['materialDigest']
                and report_page['groupSha256'] == pins_page['groupSha256'] == control['groupSha256'] and report_page['targets'] == row['configuredTargets']
                and report_page['pins'] == pins and report_page['disposition'] == index_page['disposition'] and pins_page['row'] == row
                and pins_page['receiptRef'] == retained['receiptRef'] and pins_page['outputRefs'] == retained['outputs'], 'BATCH_PAGE_BINDING_INVALID')
        require(report_page['supportRefs'] == [materials['pages'][all_ids.index(row['pageId'])]['materialRef']], 'BATCH_PAGE_BINDING_INVALID')
    reader.finish()
    return {'kind': 'guides-batch-verified-v1', 'controlDigest': batch_digest('control', control),
            'indexRef': control['indexRef'], 'indexDigest': control['indexDigest']}


def batch_archive_admission(members):
    require(len(members) <= 64 and len({name for name, _ in members}) == len(members), 'BATCH_ARCHIVE_MEMBER_LIMIT')
    total = 0
    for name, raw in members:
        batch_path(name)
        require(len(raw) <= 1024**2, 'BATCH_ARCHIVE_ENTRY_LIMIT')
        total += len(raw)
        require(total <= 16 * 1024**2, 'BATCH_ARCHIVE_EXPANDED_LIMIT')
    return total


def batch_zip_bytes(members):
    batch_archive_admission(members)
    compressed = io.BytesIO()
    with zipfile.ZipFile(compressed, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, raw in members:
            archive.writestr(name, raw)
            require(compressed.tell() <= 16 * 1024**2, 'BATCH_ARCHIVE_COMPRESSED_LIMIT')
    raw_zip = compressed.getvalue()
    require(len(raw_zip) <= 16 * 1024**2, 'BATCH_ARCHIVE_COMPRESSED_LIMIT')
    return raw_zip


def batch_archive_identity(root_fd, archive_fd):
    actual = os.stat('collection.zip', dir_fd=root_fd, follow_symlinks=False)
    held = os.fstat(archive_fd)
    signature = lambda info: (info.st_dev, info.st_ino, info.st_mode, info.st_nlink, info.st_size, info.st_mtime_ns, info.st_ctime_ns)
    require(stat.S_ISREG(actual.st_mode) and actual.st_nlink == 1 and signature(actual) == signature(held), 'BATCH_ARCHIVE_REPLACED')
    return signature(held)


def _batch_root_check(parent_fd, root_fd, blobs_fd, root_name, control):
    require(type(root_name) is str and root_name not in ('', '.', '..') and '/' not in root_name
            and '\\' not in root_name and '\0' not in root_name, 'BATCH_ROOT_IDENTITY_INVALID')
    root_stat = os.stat(root_name, dir_fd=parent_fd, follow_symlinks=False)
    require(stat.S_ISDIR(root_stat.st_mode) and {'dev': str(root_stat.st_dev), 'ino': str(root_stat.st_ino)} == control['rootIdentity'],
            'BATCH_ROOT_IDENTITY_INVALID')
    _BatchReader(root_fd, blobs_fd, control).finish()


def _batch_reserve_fd(root_fd, extent):
    fs = os.fstatvfs(root_fd)
    require(fs.f_frsize >= 512 and fs.f_bavail >= 0, 'BATCH_FILESYSTEM_UNSUPPORTED')
    allocation = ((extent + fs.f_frsize - 1) // fs.f_frsize + 2) * fs.f_frsize
    require(fs.f_bavail * fs.f_frsize - allocation > 1024**3, 'BATCH_FREE_SPACE_FLOOR')


def commit_batch_pointer(parent_fd, root_fd, blobs_fd, root_name, control, pointer, acknowledgement, check_deadline=lambda: None):
    batch_exact(acknowledgement, 'kind controlDigest freshnessRemainingMs')
    require(acknowledgement['kind'] == 'guides-batch-commit-v1' and acknowledgement['controlDigest'] == batch_digest('control', control)
            and type(acknowledgement['freshnessRemainingMs']) is int
            and 0 < acknowledgement['freshnessRemainingMs'] <= 36 * 3600000 + 5 * 60000, 'BATCH_COMMIT_ACK_INVALID')
    require(len(pointer) <= 65536, 'BATCH_POINTER_LIMIT')
    check_deadline()
    _batch_root_check(parent_fd, root_fd, blobs_fd, root_name, control)
    # The staged pointer is never a success signal. linkat is exclusive and does
    # not overwrite any existing entry; both names are rooted at the held FD.
    stage = '.index-' + os.urandom(16).hex()
    fd = os.open(stage, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=root_fd)
    installed = False
    try:
        with os.fdopen(fd, 'wb', closefd=False) as stream:
            stream.write(pointer)
            stream.flush()
            os.fsync(fd)
        _batch_root_check(parent_fd, root_fd, blobs_fd, root_name, control)
        check_deadline()
        os.link(stage, 'index.json', src_dir_fd=root_fd, dst_dir_fd=root_fd, follow_symlinks=False)
        installed = True
        os.fsync(root_fd)
        _batch_root_check(parent_fd, root_fd, blobs_fd, root_name, control)
        os.unlink(stage, dir_fd=root_fd)
        os.fsync(root_fd)
        require(os.fstat(fd).st_nlink == 1, 'BATCH_POINTER_REPLACED')
        check_deadline()
        return os.fstat(fd).st_dev, os.fstat(fd).st_ino
    except Exception:
        if installed:
            _batch_retract_pointer(root_fd, (os.fstat(fd).st_dev, os.fstat(fd).st_ino))
        raise
    finally:
        os.close(fd)


def _batch_retract_pointer(root_fd, expected):
    actual = os.stat('index.json', dir_fd=root_fd, follow_symlinks=False)
    require((actual.st_dev, actual.st_ino) == expected and stat.S_ISREG(actual.st_mode), 'BATCH_POINTER_REPLACED')
    os.unlink('index.json', dir_fd=root_fd)


def batch_commit_lifecycle_guard(acknowledgement, scan_start_ms, origin, verified_monotonic):
    batch_exact(acknowledgement, 'kind controlDigest freshnessRemainingMs')
    budget = acknowledgement['freshnessRemainingMs']
    require(type(budget) is int and 0 < budget <= 36 * 3600000 + 5 * 60000, 'BATCH_COMMIT_ACK_INVALID')
    def check():
        # The private parent samples this budget AFTER final freshness. Our ACK
        # instant is earlier, so charging the ENTIRE round trip is conservative
        # and never reconstructs unseen elapsed time from a wall-clock delta.
        elapsed = (time.monotonic() - verified_monotonic) * 1000
        require(0 <= elapsed < budget, 'BATCH_FRESHNESS_EXPIRED')
        if origin['kind'] == 'observed':
            now = time.time() * 1000
            require(scan_start_ms - now <= 5 * 60000 and now - scan_start_ms <= 36 * 3600000, 'BATCH_FRESHNESS_EXPIRED')
    return check


def _batch_verify_publish():
    # Two bounded newline frames; no EOF is required before independent final
    # freshness. The parent keeps the same descriptors alive until settlement.
    first = sys.stdin.buffer.readline(65537)
    require(first.endswith(b'\n') and len(first) <= 65536, 'BATCH_CONTROL_LIMIT')
    envelope = batch_exact(batch_parse(first[:-1]), 'control rootName remainingMs')
    require(type(envelope['remainingMs']) is int and 0 < envelope['remainingMs'] <= 600000, 'BATCH_OPERATION_DEADLINE')
    deadline = time.monotonic() + envelope['remainingMs'] / 1000
    archive_state = None
    lifecycle_check = None
    def remaining():
        require(time.monotonic() < deadline, 'BATCH_OPERATION_DEADLINE')
        if lifecycle_check is not None:
            lifecycle_check()
        if archive_state is not None:
            require(batch_archive_identity(4, archive_state[0]) == archive_state[1], 'BATCH_ARCHIVE_REPLACED')
    control, root_name = envelope['control'], envelope['rootName']
    _batch_root_check(6, 4, 5, root_name, control)
    reader = _BatchReader(4, 5, control)
    verified = verify_batch_collection(4, 5, control, reader)
    index = reader.objects[control['indexRef']['sha256']]
    refs = [('index.json', control['indexRef']), ('qualification.json', control['qualifierRef'])]
    for page in index['pages']:
        refs += [(f"pages/{page['pageId']}/report.json", page['reportRef']),
                 (f"pages/{page['pageId']}/pins.json", page['pinsRef'])]
    # Already verified canonical objects: no second raw-payload hashing pass.
    members = [(name, batch_canonical(reader.objects[ref['sha256']])) for name, ref in refs]
    expanded = batch_archive_admission(members)
    raw_zip = batch_zip_bytes(members)
    archive_info = {'path': 'collection.zip', 'sha256': sha256(raw_zip), 'bytes': len(raw_zip),
                    'expandedBytes': expanded, 'members': [name for name, _ in refs]}
    remaining()
    _batch_reserve_fd(4, len(raw_zip))
    fd = os.open('collection.zip', os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600, dir_fd=4)
    with os.fdopen(fd, 'wb', closefd=False) as stream:
        stream.write(raw_zip)
        stream.flush()
        os.fsync(fd)
    # Retain the archive descriptor through freshness and pointer settlement.
    archive_state = (fd, batch_archive_identity(4, fd))
    require(os.fstat(fd).st_size == len(raw_zip), 'BATCH_ARCHIVE_REPLACED')
    reader.finish()
    pointer = batch_canonical({'kind': 'guides-batch-collection-pointer-v1', 'origin': control['base']['origin'],
                               **{k: verified[k] for k in ('controlDigest', 'indexRef', 'indexDigest')},
                               'archive': archive_info, 'writeEligible': False, 'operations': []})
    require(len(pointer) <= 65536, 'BATCH_POINTER_LIMIT')
    verified_monotonic = time.monotonic()
    os.write(3, batch_canonical(verified) + b'\n')
    second = sys.stdin.buffer.readline(65537 - len(first))
    require(second.endswith(b'\n') and len(first) + len(second) <= 65536, 'BATCH_COMMIT_ACK_INVALID')
    require(sys.stdin.buffer.read(1) == b'', 'BATCH_COMMIT_ACK_INVALID')
    acknowledgement = batch_parse(second[:-1])
    lifecycle_check = batch_commit_lifecycle_guard(acknowledgement, reader.objects[control['qualifierRef']['sha256']]['scanStartMs'],
                                                   control['base']['origin'], verified_monotonic)
    remaining()
    _batch_reserve_fd(4, len(pointer))
    result = batch_canonical({**verified, 'kind': 'guides-batch-published-v1'})
    require(len(result) + len(batch_canonical(verified)) + 1 <= 65536, 'BATCH_ACK_LIMIT')
    installed = commit_batch_pointer(6, 4, 5, root_name, control, pointer, acknowledgement, remaining)
    try:
        remaining()
        require(os.write(3, result) == len(result), 'BATCH_ACK_LIMIT')
    except Exception:
        _batch_retract_pointer(4, installed)
        raise


if __name__ == "__main__":
    if sys.argv[1:] == ["verify-and-publish-batch-collection"]:
        try:
            _batch_verify_publish()
        except Exception as exc:
            print(str(exc) if isinstance(exc, Hold) else type(exc).__name__, file=sys.stderr)
            sys.exit(1)
    elif sys.argv[1:] == ["verify-batch-collection"]:
        try:
            raw = sys.stdin.buffer.read(65537)
            require(len(raw) <= 65536, "BATCH_CONTROL_LIMIT")
            result = batch_canonical(verify_batch_collection(4, 5, batch_parse(raw)))
            require(len(result) <= 65536, "BATCH_ACK_LIMIT")
            os.write(3, result)
        except Exception as exc:
            print(str(exc) if isinstance(exc, Hold) else type(exc).__name__, file=sys.stderr)
            sys.exit(1)
    elif sys.argv[1:] == ["verify-fetch"]:
        try:
            verify_fetch(json.loads(sys.stdin.buffer.read(65537)), metadata, datetime.now(timezone.utc))
        except Exception as exc:
            print(str(exc) if isinstance(exc, Hold) else type(exc).__name__, file=sys.stderr)
            sys.exit(1)
    elif not sys.argv[1:]:
        sys.exit(main())
    else:
        sys.exit(2)
