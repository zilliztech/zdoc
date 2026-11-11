from datetime import datetime, timedelta, timezone
from hashlib import sha256
import os
from pathlib import Path
import subprocess
import sys
import unittest

import prepare as p

HERE = Path(__file__).resolve().parent
NOW = datetime(2026, 1, 2, tzinfo=timezone.utc)
START = NOW - timedelta(hours=1)
UID = 100
MASTER = "a" * 40
DEV = "d" * 40
SOURCE = "b" * 40
CURRENT = "c" * 40


class Fetch:
    def __init__(self):
        self.run = {"id": UID, "run_attempt": 2, "head_sha": MASTER, "head_branch": "master",
                    "event": "schedule", "status": "completed", "conclusion": "success", "workflow_id": 83360731,
                    "path": ".github/workflows/fetch-docs.yml", "repository": {"id": p.REPO_ID},
                    "head_repository": {"id": p.REPO_ID}, "updated_at": NOW.isoformat()}
        self.job = {"id": 200, "run_id": UID, "run_attempt": 2, "head_sha": MASTER, "status": "completed",
                    "conclusion": "success", "name": "produce_guides_sources / fetch",
                    "steps": [{"name": "Fetch shared guides sources", "conclusion": "success", "started_at": START.isoformat()}]}
        self.record = {"status": "prepared", "page": p.PAGE, "fetchRun": UID, "fetchAttempt": 2,
                       "fetchProducer": MASTER, "scanStart": START.isoformat(), "sourceJob": 200}
        self.artifacts = {}
        for key, aid, name in (("sourceZip", 201, "guides-sources-en-100"), ("publicationZip", 202, "publication-results-fetch-100-2")):
            digest = sha256(name.encode()).hexdigest()
            self.record[key] = {"id": aid, "sha256": digest, "bytes": 10}
            self.artifacts[aid] = {"id": aid, "name": name, "expired": False, "digest": "sha256:" + digest,
                                   "size_in_bytes": 10, "workflow_run": {"id": UID, "head_sha": MASTER,
                                    "head_branch": "master", "repository_id": p.REPO_ID, "head_repository_id": p.REPO_ID}}
        self.history = [[self.run], []]

    def get(self, path):
        if "?event=schedule&branch=master" in path:
            return {"workflow_runs": [self.run]}
        if path.startswith("/actions/jobs/"):
            return self.job
        if path.startswith("/actions/artifacts/"):
            return self.artifacts[int(path.split("/")[-1])]
        if "?created=" in path:
            rows = self.history[int("requested" in path)]
            return {"workflow_runs": rows, "total_count": len(rows)}
        raise AssertionError(path)

    def verify(self):
        p.verify_fetch(self.record, self.get, NOW)


class PreparationTest(unittest.TestCase):
    def test_fetch_binds_successful_attempt_job_and_both_retained_digests(self):
        Fetch().verify()
        for field in ("expired", "head_sha", "sourceZip", "publicationZip", "conclusion", "started_at", "run_attempt"):
            with self.subTest(field=field):
                f = Fetch()
                if field == "expired":
                    f.artifacts[201][field] = True
                elif field == "head_sha":
                    f.artifacts[202]["workflow_run"][field] = DEV
                elif field in ("sourceZip", "publicationZip"):
                    f.record[field]["sha256"] = "4" * 64
                elif field == "started_at":
                    f.job["steps"][0][field] = NOW.isoformat()
                else:
                    f.run[field] = 3 if field == "run_attempt" else "failure"
                with self.assertRaises(p.Hold):
                    f.verify()

    def test_new_observation_and_old_run_rerun_each_supersede(self):
        for idx, status, updated, should_hold in (
                (1, "completed", START, True), (0, "in_progress", START - timedelta(hours=4), True),
                (1, "completed", START - timedelta(seconds=1), False)):
            f = Fetch()
            f.history[idx].append({**f.run, "id": 2, "status": status, "updated_at": updated.isoformat(),
                                   "workflow_id": 355332213 if idx else f.run["workflow_id"]})
            with self.subTest(idx=idx, status=status):
                if should_hold:
                    with self.assertRaisesRegex(p.Hold, "SUPERSEDED"):
                        f.verify()
                else:
                    f.verify()

    def test_stale_scan_and_truncated_histories(self):
        f = Fetch()
        with self.assertRaisesRegex(p.Hold, "EXPIRED"):
            p.verify_fetch(f.record, f.get, NOW + timedelta(days=2))
        with self.assertRaisesRegex(p.Hold, "INCOMPLETE"):
            p.check_histories(lambda _: {"total_count": 2, "workflow_runs": [f.run]}, f.run, START)

    def test_selection_is_single_page_track_head(self):
        d = dict(status="candidate", page=p.PAGE, sourceTrack=p.TRACK, master=MASTER, dev=DEV, sourceHead=SOURCE,
                 sourceTarget=SOURCE, current=CURRENT, next=CURRENT)
        self.assertEqual(p.discovery_pins(d)["source"], SOURCE)
        for overrides in ({"sourceTarget": CURRENT}, {"page": "other"}, {"master": "-c"}, {"next": SOURCE},
                          {"status": "unchanged"}, {"sourceTrack": "other"}):
            with self.assertRaises(p.Hold):
                p.discovery_pins({**d, **overrides})

    def test_b2_no_change_and_holds_never_become_candidates(self):
        unit = {"subjects": [p.SUBJECT], "nextEdits": [], "disposition": "noop", "holdReasons": []}
        for disp in ("noop", "report-only"):
            self.assertEqual(p.unit_status({**unit, "disposition": disp}), "unchanged")
        for change in ({"disposition": "draft-failure"}, {"subjects": []}, {"subjects": [p.SUBJECT, p.SUBJECT]},
                       {"disposition": "candidate"}, {"holdReasons": ["AMBIGUOUS"]}):
            with self.assertRaises(p.Hold):
                p.unit_status({**unit, **change})

    def test_profile_helper_matches_staged_digest(self):
        digest = sha256((HERE / "provision-profile").read_bytes()).hexdigest()
        self.assertIn('test "${actual%% *}" = ' + digest, (HERE / "provision-search.sh").read_text())

    @unittest.skipUnless(sys.platform == "darwin" and os.getuid() != 0, "Darwin ordinary-user profile fixtures")
    def test_restricted_profile_classifier(self):
        subprocess.run([sys.executable, "-B", str(HERE / "profile-tests" / "profile.py")], check=True)


if __name__ == "__main__":
    unittest.main()
