from datetime import datetime, timedelta, timezone
from hashlib import sha256
import json
import io
from contextlib import redirect_stdout
from unittest.mock import patch
import os
from pathlib import Path
import subprocess
import sys
import tempfile
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
    def test_batch_canonical_matches_utf8_and_control_vectors(self):
        value = {"\ue000": 2, "\U00010000": 1, "text": "\0\n\t\r\b\f\x1f\\\"😀"}
        expected = '{"text":"\\u0000\\u000a\\u0009\\u000d\\u0008\\u000c\\u001f\\\\\\"😀","\ue000":2,"\U00010000":1}'.encode()
        self.assertEqual(p.batch_canonical(value), expected)
        self.assertEqual(p.batch_parse(expected), value)
        self.assertEqual(p.batch_parse(b'{"order":1.5}\n', canonical=False), {"order": 1.5})
        for raw in (b'{"x":1,"x":2}', b'{"x":-0}', b'{"x":1.0}', b'{"x":1e0}', b'{"x":9007199254740992}',
                    b'{"x":"\\ud800"}', b'{"x":"\\n"}', b' {"x":1}', b'{"x":NaN}'):
            with self.subTest(raw=raw), self.assertRaises(p.Hold):
                p.batch_parse(raw)

    def test_batch_profile_method_has_no_legacy_or_v1_fallback(self):
        method = {"kind": "fetch-producer-profile-v2", "trustedTools": MASTER,
                  "producer": SOURCE, "profileSha256": "3" * 64}
        args = dict(expected_kind="fetch-producer-profile-v2", master=MASTER, producer=SOURCE,
                    observed_tool=MASTER, expected_digest="3" * 64)
        self.assertEqual(p.validate_profile_method(method, **args), method)
        for changed in ({**method, "kind": "fetch-producer-profile-v1"}, {**method, "extra": True},
                        {**method, "trustedTools": DEV}, {**method, "producer": DEV},
                        {**method, "profileSha256": "4" * 64}, {}):
            with self.subTest(changed=changed), self.assertRaises(p.Hold):
                p.validate_profile_method(changed, **args)

    def test_batch_output_binding_matches_manual_identity_for_dual_and_cloud_only_targets(self):
        targets = [{"manual": "guides", "path": "tutorials/example"}, {"manual": "guides-byoc", "path": "tutorials/example"}]
        cloud = {"manual": "guides", "path": "content/en/guides/tutorials/example.mdx", "sha256": "1" * 64}
        byoc = {"manual": "guides-byoc", "path": "content/en/byoc/tutorials/example.mdx", "sha256": "2" * 64}
        # Q/receiptsRoot order is manual + ':' + path, while configured targets
        # use manual alone and original producer outputs have their own order.
        outputs = [byoc, cloud]
        self.assertEqual([p._batch_output_target(o, targets) for o in outputs], [targets[1], targets[0]])
        self.assertEqual(p._batch_receipt_outputs([cloud, byoc]), outputs)
        self.assertEqual(p._batch_output_target(cloud, targets[:1]), targets[0])
        self.assertEqual(p._batch_receipt_outputs([cloud]), [cloud])
        with self.assertRaises(p.Hold):
            p._batch_output_target(byoc, targets[:1])
        with self.assertRaises(p.Hold):
            p._batch_output_target(cloud, targets + targets[:1])

    def test_batch_reader_holds_parent_descriptors_and_rejects_aliases_and_extent(self):
        with tempfile.TemporaryDirectory() as root:
            blobs = Path(root) / 'blobs'
            blobs.mkdir()
            raw = b'original pretty raw receipt\n'
            digest = p.sha256(raw)
            ref = dict(path='blobs/' + digest, sha256=digest, bytes=len(raw))
            (blobs / digest).write_bytes(raw)
            root_fd = os.open(root, os.O_RDONLY | os.O_DIRECTORY)
            blobs_fd = os.open(blobs, os.O_RDONLY | os.O_DIRECTORY)
            try:
                control = dict(rootIdentity=p._BatchReader.identity(root_fd), blobsIdentity=p._BatchReader.identity(blobs_fd))
                reader = p._BatchReader(root_fd, blobs_fd, control)
                expected = (len(raw), p.hashlib.sha1(f'blob {len(raw)}\0'.encode() + raw).hexdigest())
                self.assertEqual(reader.blob(ref), expected)
                self.assertEqual(reader.blob(ref), expected)
                self.assertEqual(reader.total, len(raw))
                with self.assertRaises(p.Hold):
                    reader.blob({**ref, 'bytes': len(raw) + 1})
                with self.assertRaises(p.Hold):
                    reader.blob({**ref, 'path': '../' + digest})
                (blobs / ('f' * 64)).symlink_to(blobs / digest)
                with self.assertRaises((OSError, p.Hold)):
                    reader.blob(dict(path='blobs/' + 'f' * 64, sha256='f' * 64, bytes=len(raw)))
                reader.finish()
            finally:
                os.close(blobs_fd)
                os.close(root_fd)

    def test_writer_rejects_v2_and_mixed_methods_before_remote_reads(self):
        for method in ({"kind": "fetch-producer-profile-v2"},
                       {"kind": "fetch-producer-profile-v2", "trustedTools": MASTER,
                        "producer": MASTER, "profileSha256": "1" * 64}):
            f = Fetch()
            f.record["producerAuthentication"] = method
            with self.assertRaisesRegex(p.Hold, "BATCH_WRITER_INPUT_REJECTED"):
                p.verify_fetch(f.record, lambda path: self.fail("v2 must fail before GET"), NOW)
        f = Fetch()
        f.record.update(producerAuthentication={"kind": "fetch-producer-profile-v1"}, producerInventorySha256="2" * 64)
        with self.assertRaisesRegex(p.Hold, "BATCH_WRITER_INPUT_REJECTED"):
            p.verify_fetch(f.record, lambda path: self.fail("mixed method must fail before GET"), NOW)

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

    def test_report_pack_retains_b2_bytes_and_both_authority_references(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "blobs").mkdir()

            def retain(value):
                raw = json.dumps(value).encode()
                digest = p.sha256(raw)
                path = "blobs/" + digest
                (root / path).write_bytes(raw)
                return {"bytes": len(raw), "sha256": digest, "path": path}

            pins = retain({"offlineReplay": False, "lifecycle": {"observedPage": p.PAGE}})
            impact = retain({"offlineReplay": False, "pages": [{"pageId": p.PAGE, "selected": True}]})
            report = {"subject": p.SUBJECT, "authority": {"subject": p.SUBJECT, "provider": "guides-retained-source",
                      "evidence": [pins, impact]}, "detail": {"kind": "guides-impact-v1", "file":
                      {**impact, "path": "launcher-local/guides-impact-v1/report.json"}}}
            ref = retain(report)
            unit = {"reports": [ref]}
            self.assertEqual(p.report_material(root, unit), tuple((root / r["path"]).read_bytes() for r in (ref, impact, pins)))
            with self.assertRaisesRegex(p.Hold, "B2_BLOB_SIZE_INVALID"):
                p.report_material(root, {"reports": [{**ref, "bytes": 1024**2 + 1}]})
            with self.assertRaisesRegex(p.Hold, "UNEXPECTED_AUTHORITY_EVIDENCE"):
                swapped = {**report, "authority": {**report["authority"], "evidence": [pins, pins]}}
                p.report_material(root, {"reports": [retain(swapped)]})
            (root / pins["path"]).write_bytes(b"x" * pins["bytes"])
            with self.assertRaisesRegex(p.Hold, "B2_BLOB_MISMATCH"):
                p.report_material(root, unit)

    def held_fixture(self, root, codes=None):
        directory = root / "plan"
        (directory / "blobs").mkdir(parents=True)
        (directory / "units").mkdir()

        def retain(value):
            raw = json.dumps(value).encode()
            digest = p.sha256(raw)
            ref = {"path": "blobs/" + digest, "sha256": digest, "bytes": len(raw)}
            (directory / ref["path"]).write_bytes(raw)
            return ref

        codes = codes or ["EVIDENCE_INFRASTRUCTURE_FAILURE"]
        pins = retain({"offlineReplay": False, "master": MASTER, "dev": DEV,
                       "lifecycle": {"observedPage": p.PAGE, "reasons": codes}})
        impact = retain({"offlineReplay": False, "pages": [{"pageId": p.PAGE, "selected": True,
                         "reasons": codes, "lifecycle": {"state": "unknown", "reasons": codes}}], "infrastructureErrors": []})
        report = {"subject": p.SUBJECT, "pins": {"configSnapshot": MASTER, "dev": DEV},
                  "authority": {"subject": p.SUBJECT, "provider": "guides-retained-source", "reasons": codes,
                                "evidence": [pins, impact]}, "detail": {"kind": "guides-impact-v1", "file":
                                {**impact, "path": "launcher-11111111-1111-4111-8111-111111111111/guides-impact-v1/report.json"}}}
        ref = retain(report)
        canonical = lambda value: json.dumps(value, sort_keys=True, separators=(",", ":")).encode()
        key = "guides:" + p.sha256(canonical([p.SUBJECT]))
        unit = {"kind": "shared-update-unit", "schemaVersion": 1, "unitKey": key, "subjects": [p.SUBJECT],
                "reports": [ref], "holdReasons": ["AUTHORITY_UNKNOWN"], "nextEdits": [], "disposition": "hold"}
        unit_path = directory / "units" / (p.sha256(canonical(key)) + ".json")
        p.write(unit_path, unit)
        result = {"status": "held", "reasons": ["AUTHORITY_UNKNOWN", "LIFECYCLE_ACQUIRE_METADATA_HTTP_502"], "operations": []}
        p.write(directory / "result.json", result)
        return directory, unit_path, unit, report, pins, impact, retain, result

    def run_held_main(self, root, credentials=None):
        # Exercise the actual run_b2 -> Hold -> main retention path, with only the child process mocked.
        def prepare(directory, tool, record):
            p.run_b2(directory, tool, "node", "plan")
        env = {"GH_TOKEN": "UPPERCASE_TEST_CREDENTIAL", "GITHUB_TOKEN": "ANOTHER_TEST_CREDENTIAL",
               "GITHUB_RUN_ID": "123", "GITHUB_RUN_ATTEMPT": "1", "GITHUB_WORKSPACE": str(root)}
        env.update(credentials or {})
        with patch.dict(os.environ, env), patch.object(p, "prepare", prepare), patch.object(p, "output"), \
                patch.object(p.tempfile, "mkdtemp", return_value=str(root)), \
                patch.object(p.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, b"", b"")), \
                redirect_stdout(io.StringIO()):
            self.assertEqual(p.main(), 0)
        return p.read(root / "evidence" / "preparation.json")

    def test_held_b2_authenticates_and_retains_inner_codes_through_main(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            self.held_fixture(root)
            record = self.run_held_main(root)
            self.assertEqual(record["status"], "held")
            self.assertIsNone(record["candidate"])
            self.assertIn("EVIDENCE_INFRASTRUCTURE_FAILURE", record["reasons"])
            self.assertIn("LIFECYCLE_ACQUIRE_METADATA_HTTP_502", record["reasons"])
            self.assertIn("AUTHORITY_UNKNOWN", record["reasons"])
            self.assertIn("B2_PLAN_HELD / AUTHORITY_UNKNOWN / LIFECYCLE_ACQUIRE_METADATA_HTTP_502", record["reasons"])
            self.assertEqual(len(record["reasons"]), len(set(record["reasons"])))
            self.assertNotIn("B2_DIAGNOSTICS_UNAVAILABLE", record["reasons"])

    def test_held_diagnostics_reject_bad_bindings_without_replacing_original_hold(self):
        cases = ("digest", "report_path", "pins_path", "detail_path", "report_subject", "authority_subject",
                 "pilot", "pins_pilot", "multi_pilot", "missing", "multi_unit", "unit_subject", "unit_name",
                 "unit_symlink", "units_symlink", "blobs_symlink", "pins_symlink", "unit_oversized", "pins_oversized")
        for case in cases:
            with self.subTest(case=case), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp).resolve()
                directory, path, unit, report, pins, impact, retain, result = self.held_fixture(root)
                if case == "digest":
                    (directory / pins["path"]).write_bytes(b"x" * pins["bytes"])
                elif case == "report_path":
                    unit["reports"][0]["path"] = "blobs/../" + unit["reports"][0]["path"]
                    p.write(path, unit)
                elif case in ("pins_path", "detail_path", "report_subject", "authority_subject"):
                    if case == "pins_path":
                        report["authority"]["evidence"][0]["path"] = "blobs/../" + pins["path"]
                    elif case == "detail_path":
                        report["detail"]["file"]["path"] = "../report.json"
                    elif case == "report_subject":
                        report["subject"] = {**p.SUBJECT, "pageId": "other"}
                    else:
                        report["authority"]["subject"] = {**p.SUBJECT, "pageId": "other"}
                    unit["reports"] = [retain(report)]
                    p.write(path, unit)
                elif case in ("pilot", "pins_pilot", "multi_pilot"):
                    value = p.read(directory / (pins if case == "pins_pilot" else impact)["path"])
                    if case == "pins_pilot":
                        value["lifecycle"]["observedPage"] = "other"
                        report["authority"]["evidence"][0] = retain(value)
                    else:
                        if case == "pilot":
                            value["pages"][0]["pageId"] = "other"
                        else:
                            value["pages"].append(value["pages"][0])
                        ref = retain(value)
                        report["authority"]["evidence"][1] = ref
                        report["detail"]["file"] = {**ref, "path": report["detail"]["file"]["path"]}
                    unit["reports"] = [retain(report)]
                    p.write(path, unit)
                elif case == "missing":
                    path.unlink()
                elif case == "multi_unit":
                    p.write(path.with_name("0" * 64 + ".json"), unit)
                elif case == "unit_subject":
                    unit["subjects"] = [{**p.SUBJECT, "pageId": "other"}]
                    p.write(path, unit)
                elif case == "unit_name":
                    path.rename(path.with_name("other.json"))
                elif case in ("unit_symlink", "units_symlink", "blobs_symlink", "pins_symlink"):
                    target = {"unit_symlink": path, "units_symlink": path.parent,
                              "blobs_symlink": directory / "blobs", "pins_symlink": directory / pins["path"]}[case]
                    outside = root / "outside"
                    target.rename(outside)
                    target.symlink_to(outside, target_is_directory=case in ("units_symlink", "blobs_symlink"))
                elif case == "unit_oversized":
                    path.write_bytes(b" " * (1024**2 + 1))
                elif case == "pins_oversized":
                    raw = b" " * (1024**2 + 1)
                    ref = {"path": "blobs/" + p.sha256(raw), "sha256": p.sha256(raw), "bytes": len(raw)}
                    (directory / ref["path"]).write_bytes(raw)
                    report["authority"]["evidence"][0] = ref
                    unit["reports"] = [retain(report)]
                    p.write(path, unit)
                record = self.run_held_main(root)
                self.assertIn("B2_DIAGNOSTICS_UNAVAILABLE", record["reasons"])
                self.assertIn("B2_PLAN_HELD / AUTHORITY_UNKNOWN / LIFECYCLE_ACQUIRE_METADATA_HTTP_502", record["reasons"])
                self.assertNotIn("EVIDENCE_INFRASTRUCTURE_FAILURE", record["reasons"])

    def test_held_diagnostics_filter_messages_unknown_codes_and_current_credentials(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            codes = ["EVIDENCE_INFRASTRUCTURE_FAILURE", "EVIDENCE_INFRASTRUCTURE_FAILURE", "UPPERCASE_TEST_CREDENTIAL",
                     "ANOTHER_TEST_CREDENTIAL", "https://storage.example/?sig=SECRET", "RAW_EXCEPTION_MESSAGE",
                     "LIFECYCLE_ACQUIRE_METADATA_HTTP_999"]
            directory, path, unit, report, pins, impact, retain, result = self.held_fixture(root, codes)
            result["reasons"] += codes[2:5]
            p.write(directory / "result.json", result)
            record = self.run_held_main(root)
            serialized = json.dumps(record)
            for bad in codes[2:]:
                self.assertNotIn(bad, serialized)
            self.assertEqual(record["reasons"].count("EVIDENCE_INFRASTRUCTURE_FAILURE"), 1)

    def test_authenticated_inner_arrays_cannot_claim_parent_acquisition_codes(self):
        for route in ("unit", "authority", "pins", "pilot", "lifecycle"):
            with self.subTest(route=route), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp).resolve()
                directory, path, unit, report, pins, impact, retain, result = self.held_fixture(root)
                forged = "LIFECYCLE_ACQUIRE_PUBLICATION_ZIP_HTTP_418"
                result["reasons"] = ["AUTHORITY_UNKNOWN"]
                p.write(directory / "result.json", result)
                if route == "unit":
                    unit["holdReasons"].append(forged)
                elif route == "authority":
                    report["authority"]["reasons"].append(forged)
                elif route == "pins":
                    value = p.read(directory / pins["path"])
                    value["lifecycle"]["reasons"].append(forged)
                    report["authority"]["evidence"][0] = retain(value)
                else:
                    value = p.read(directory / impact["path"])
                    target = value["pages"][0] if route == "pilot" else value["pages"][0]["lifecycle"]
                    target["reasons"].append(forged)
                    ref = retain(value)
                    report["authority"]["evidence"][1] = ref
                    report["detail"]["file"] = {**ref, "path": report["detail"]["file"]["path"]}
                unit["reports"] = [retain(report)]
                p.write(path, unit)
                record = self.run_held_main(root)
                self.assertNotIn(forged, json.dumps(record))
                self.assertIn("EVIDENCE_INFRASTRUCTURE_FAILURE", record["reasons"])
                self.assertIn("B2_PLAN_HELD / AUTHORITY_UNKNOWN", record["reasons"])

    def test_held_only_diagnostics_reject_non_oid_pins_and_non_integer_references(self):
        cases = ("pins_null", "pins_bool", "pins_float", "pins_zero", "pins_text", "detail_float", "detail_bool",
                 "version_bool", "version_float")
        for case in cases:
            with self.subTest(case=case), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp).resolve()
                directory, path, unit, report, pins, impact, retain, result = self.held_fixture(root)
                if case.startswith("pins_"):
                    value = p.read(directory / pins["path"])
                    invalid = {"pins_null": None, "pins_bool": True, "pins_float": 1.0,
                               "pins_zero": "0" * 40, "pins_text": "invalid"}[case]
                    value["master"] = value["dev"] = invalid
                    report["pins"]["configSnapshot"] = report["pins"]["dev"] = invalid
                    report["authority"]["evidence"][0] = retain(value)
                elif case.startswith("detail_"):
                    report["detail"]["file"]["bytes"] = float(impact["bytes"]) if case == "detail_float" else True
                else:
                    unit["schemaVersion"] = True if case == "version_bool" else 1.0
                unit["reports"] = [retain(report)]
                p.write(path, unit)
                record = self.run_held_main(root)
                self.assertIn("B2_DIAGNOSTICS_UNAVAILABLE", record["reasons"])
                self.assertNotIn("EVIDENCE_INFRASTRUCTURE_FAILURE", record["reasons"])
                self.assertIn("B2_PLAN_HELD / AUTHORITY_UNKNOWN / LIFECYCLE_ACQUIRE_METADATA_HTTP_502", record["reasons"])

    def test_valid_unknown_lifecycle_pins_can_omit_observed_page(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            directory, path, unit, report, pins, impact, retain, result = self.held_fixture(root)
            value = p.read(directory / pins["path"])
            value["lifecycle"].pop("observedPage")
            report["authority"]["evidence"][0] = retain(value)
            unit["reports"] = [retain(report)]
            p.write(path, unit)
            record = self.run_held_main(root)
            self.assertIn("EVIDENCE_INFRASTRUCTURE_FAILURE", record["reasons"])
            self.assertNotIn("B2_DIAGNOSTICS_UNAVAILABLE", record["reasons"])

    def test_missing_diagnostic_fallback_excludes_colliding_current_credentials(self):
        for key in ("GH_TOKEN", "GITHUB_TOKEN"):
            with self.subTest(key=key), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp).resolve()
                directory, path, unit, report, pins, impact, retain, result = self.held_fixture(root)
                path.unlink()
                record = self.run_held_main(root, {key: "B2_DIAGNOSTICS_UNAVAILABLE"})
                self.assertNotIn("B2_DIAGNOSTICS_UNAVAILABLE", json.dumps(record))
                self.assertIn("B2_PLAN_HELD / AUTHORITY_UNKNOWN / LIFECYCLE_ACQUIRE_METADATA_HTTP_502", record["reasons"])

    def test_current_credentials_cannot_be_retained_even_when_they_are_known_codes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            self.held_fixture(root)
            record = self.run_held_main(root, {"GH_TOKEN": "EVIDENCE_INFRASTRUCTURE_FAILURE",
                                              "GITHUB_TOKEN": "LIFECYCLE_ACQUIRE_METADATA_HTTP_502"})
            for secret in ("EVIDENCE_INFRASTRUCTURE_FAILURE", "LIFECYCLE_ACQUIRE_METADATA_HTTP_502"):
                self.assertNotIn(secret, json.dumps(record))
            self.assertIn("B2_PLAN_HELD / AUTHORITY_UNKNOWN", record["reasons"])

    def test_authenticated_lifecycle_infrastructure_projects_only_fixed_categories(self):
        cases = [
            ("Error: Authenticated lifecycle archive unavailable", "STAGED_ARCHIVE_UNAVAILABLE"),
            ("Error: GitHub lifecycle read failed (HTTP 502)", "LIFECYCLE_METADATA_HTTP_502"),
            ("Error: Public GitHub lifecycle read failed (HTTP 403)", "LIFECYCLE_METADATA_HTTP_403"),
            ("Error: Guides metadata channel closed", "METADATA_BROKER_FAILED"),
            ("Error: Unexpected Guides metadata response sequence", "METADATA_BROKER_FAILED"),
            ("Error: Invalid Guides metadata frame size", "METADATA_BROKER_FAILED"),
            ("Error: Command failed: python3 -c SECRET https://storage.example/?sig=SECRET", "SOURCE_ARCHIVE_EXTRACT_FAILED"),
            ("Error: Invalid shared source bundle: SECRET https://storage.example/?sig=SECRET", "SOURCE_BUNDLE_INVALID"),
            ("Error: GitHub lifecycle read failed (HTTP 999)", "LIFECYCLE_INFRA_DIAGNOSTIC_UNAVAILABLE"),
            ("Error: Authenticated lifecycle archive unavailable SECRET https://storage.example/?sig=SECRET", "LIFECYCLE_INFRA_DIAGNOSTIC_UNAVAILABLE"),
            ("UNKNOWN SECRET https://storage.example/?sig=SECRET", "LIFECYCLE_INFRA_DIAGNOSTIC_UNAVAILABLE"),
        ]
        for message, expected in cases:
            with self.subTest(expected=expected, message=message), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp).resolve()
                directory, path, unit, report, pins, impact, retain, result = self.held_fixture(root)
                value = p.read(directory / impact["path"])
                value["infrastructureErrors"] = [{"message": "Lifecycle infrastructure: " + message}] * 2
                ref = retain(value)
                report["authority"]["evidence"][1] = ref
                report["detail"]["file"] = {**ref, "path": report["detail"]["file"]["path"]}
                unit["reports"] = [retain(report)]
                p.write(path, unit)
                record = self.run_held_main(root)
                self.assertIn(expected, record["reasons"])
                self.assertEqual(record["reasons"].count(expected), 1)
                self.assertIn("B2_PLAN_HELD / AUTHORITY_UNKNOWN / LIFECYCLE_ACQUIRE_METADATA_HTTP_502", record["reasons"])
                self.assertNotIn("SECRET", json.dumps(record))
                self.assertNotIn("https://", json.dumps(record))

    def test_original_fixed_local_result_hold_survives_missing_inner_diagnostics(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            (root / "plan").mkdir()
            p.write(root / "plan" / "result.json", {"status": "held", "operations": [], "reasons": ["TRUSTED_CONTEXT_CHANGED", "FUTURE_OUTER_REASON", "FUTURE_OUTER_REASON", "UPPERCASE_TEST_CREDENTIAL"]})
            record = self.run_held_main(root)
            self.assertIn("B2_PLAN_HELD / TRUSTED_CONTEXT_CHANGED / FUTURE_OUTER_REASON", record["reasons"])
            self.assertNotIn("UPPERCASE_TEST_CREDENTIAL", json.dumps(record))
            self.assertIn("B2_DIAGNOSTICS_UNAVAILABLE", record["reasons"])

    def test_successful_b2_plan_does_not_require_diagnostic_material(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "plan").mkdir()
            (root / "evidence").mkdir()
            value = {"status": "planned", "reasons": [], "operations": []}
            p.write(root / "plan" / "result.json", value)
            with patch.dict(os.environ, {"GH_TOKEN": "test"}), patch.object(p.subprocess, "run", return_value=subprocess.CompletedProcess([], 0, b"", b"")):
                self.assertEqual(p.run_b2(root, root, "node", "plan"), value)

    def test_profile_helper_matches_staged_digest(self):
        digest = sha256((HERE / "provision-profile").read_bytes()).hexdigest()
        self.assertIn('test "${actual%% *}" = ' + digest, (HERE / "provision-search.sh").read_text())

    @unittest.skipUnless(sys.platform == "darwin" and os.getuid() != 0, "Darwin ordinary-user profile fixtures")
    def test_restricted_profile_classifier(self):
        subprocess.run([sys.executable, "-B", str(HERE / "profile-tests" / "profile.py")], check=True)



class AuthorityMethodTest(unittest.TestCase):
    """Real content-addressed B1/B2 references; GitHub metadata is a local fixture."""
    def fixture(self, root, method=True):
        fetch = Fetch()
        directory = root / "plan"
        (directory / "blobs").mkdir(parents=True)
        def retain(value):
            raw = json.dumps(value).encode()
            ref = {"path": "blobs/" + p.sha256(raw), "bytes": len(raw), "sha256": p.sha256(raw)}
            (directory / ref["path"]).write_bytes(raw)
            return ref
        row = {"runId": UID, "latestRunId": UID, "attempt": 2, "masterSha": MASTER, "sampledDev": DEV,
               "observedPage": p.PAGE, "reasons": [], "sourceJobId": 200, "generatedAt": START.isoformat(),
               "artifactId": 201, "publicationArtifactId": 202,
               "zipSha256": fetch.record["sourceZip"]["sha256"], "publicationZipSha256": fetch.record["publicationZip"]["sha256"]}
        if method:
            row["producerAuthentication"] = {"kind": "fetch-producer-profile-v1", "trustedTools": MASTER,
                                             "producer": MASTER, "profileSha256": "e" * 64}
        else:
            row["producerInventorySha256"] = "f" * 64
        observed = {"offlineReplay": False, "master": MASTER, "dev": DEV, "tools": {"zdoc": MASTER}, "lifecycle": row}
        impact = retain({"offlineReplay": False, "pages": [{"pageId": p.PAGE, "selected": True}]})
        pins = {"master": MASTER, "dev": DEV, "source": SOURCE, "current": CURRENT, "next": CURRENT}
        report = {"subject": p.SUBJECT, "pins": {"trustedTools": MASTER, "source": {"track": p.TRACK,
                  "target": SOURCE, "observedTrackHead": SOURCE, "current": CURRENT, "oldNext": CURRENT}},
                  "authority": {"subject": p.SUBJECT, "provider": "guides-retained-source", "updateState": "eligible-to-propose",
                  "reasons": [], "evidence": []}, "axes": [{"axis": "old-next-to-target", "sourceChanged": True}],
                  "detail": {"kind": "guides-impact-v1", "file": {**impact, "path": "launcher-local/guides-impact-v1/report.json"}}}
        def consume():
            # Rehash every reference after semantic mutation; negatives reach authority validation.
            report["authority"]["evidence"] = [retain(observed), impact]
            unit = {"reports": [retain(report)]}
            with patch.object(p, "metadata", fetch.get):
                return p.authority(root, unit, pins, fetch.run)
        return row, observed, report, pins, consume

    def test_tagged_method_and_legacy_are_retained_by_real_authority(self):
        for method in (True, False):
            with tempfile.TemporaryDirectory() as tmp:
                row, _, _, _, consume = self.fixture(Path(tmp), method)
                result = consume()
                key = "producerAuthentication" if method else "producerInventorySha256"
                self.assertEqual(result[key], row[key])
                self.assertNotIn("producerInventorySha256" if method else "producerAuthentication", result)

    def test_untagged_census_without_inventory_cannot_become_a_candidate(self):
        with tempfile.TemporaryDirectory() as tmp:
            row, _, _, _, consume = self.fixture(Path(tmp), False)
            del row["producerInventorySha256"]
            with self.assertRaisesRegex(p.Hold, "REVIEWED_FETCH_EVIDENCE_MISSING"):
                consume()

    def test_present_invalid_tag_never_falls_back_to_valid_inventory(self):
        for bad in (None, {}, {"kind": "unknown"}, {"kind": "fetch-producer-profile-v1"},
                    {"kind": "fetch-producer-profile-v1", "trustedTools": MASTER, "producer": MASTER,
                     "profileSha256": "e" * 64, "extra": True}):
            with self.subTest(bad=bad), tempfile.TemporaryDirectory() as tmp:
                row, _, _, _, consume = self.fixture(Path(tmp), False)
                row["producerAuthentication"] = bad
                with self.assertRaisesRegex(p.Hold, "REVIEWED_FETCH_EVIDENCE_MISSING"):
                    consume()

    def test_tag_binds_both_tool_pins_producer_digest_and_excludes_mixed_method(self):
        for case in ("trustedTools", "producer", "profileSha256", "tools", "envelope", "setup", "mixed", "null-digest"):
            with self.subTest(case=case), tempfile.TemporaryDirectory() as tmp:
                row, observed, report, pins, consume = self.fixture(Path(tmp))
                if case in ("trustedTools", "producer"):
                    row["producerAuthentication"][case] = "1" * 40
                elif case == "profileSha256":
                    row["producerAuthentication"][case] = "E" * 64
                elif case == "null-digest":
                    row["producerAuthentication"]["profileSha256"] = None
                elif case == "tools":
                    observed["tools"]["zdoc"] = DEV
                elif case == "envelope":
                    report["pins"]["trustedTools"] = DEV
                elif case == "setup":
                    pins["master"] = DEV
                else:
                    row["producerInventorySha256"] = "f" * 64
                with self.assertRaises(p.Hold):
                    consume()

    def test_new_profile_reason_codes_are_closed_safe_diagnostics(self):
        codes = ["FETCH_PROFILE_CONTEXT_UNAVAILABLE", "FETCH_PROFILE_MISMATCH", "FETCH_PROFILE_ANCESTRY_UNPROVEN"]
        self.assertEqual(p.reason_codes(codes + ["FETCH_PROFILE_UNTRUSTED_PATH"]), codes)


if __name__ == "__main__":
    unittest.main()
