"""Run only on owned fixtures as an ordinary macOS user. No live profile access."""
import fcntl
import hashlib
import json
import os
from pathlib import Path
import plistlib
import stat
import subprocess
import tempfile

assert os.getuid() != 0
here = Path(__file__).resolve().parent
system = Path("/System/Library/OpenDirectory/Configurations/Search.plist")
template = plistlib.loads(system.read_bytes())
marker = b"FIXTURE-SECRET"
active_shape = {k: v for k, v in template.items() if k != "locked"}
encode = lambda obj: plistlib.dumps(obj, fmt=plistlib.FMT_BINARY)
good = encode(active_shape)
target = Path("Library/Preferences/OpenDirectory/Configurations/Search.plist")

def orphan_record(b):
    table = int.from_bytes(b[-8:], "big")
    trailer = bytearray(b[-32:])
    trailer[15] += 1
    trailer[-8:] = (table + 1).to_bytes(8, "big")
    return b[:table] + bytes([9]) + b[table:-32] + table.to_bytes(2, "big") + trailer

def gap(b):
    table = int.from_bytes(b[-8:], "big")
    return b[:table] + marker + b[table:-8] + (table+len(marker)).to_bytes(8, "big")

cases = {
    "active": (good, "verified"),
    "apple-system-template": (system.read_bytes(), "verified"),
    "sorted-differently": (plistlib.dumps(active_shape, fmt=plistlib.FMT_BINARY, sort_keys=False), "verified"),
    "extra-key": (encode(dict(active_shape, password=marker.decode())), "unrecognized-profile"),
    "wrong-uuid": (good.replace(b"A840FC81", b"AAAAAAAA"), "unrecognized-profile"),
    "secret-path": (good.replace(b"/Local/Default", b"FIXTURE-SECRET"), "unrecognized-profile"),
    "xml": (b"<plist><!-- FIXTURE-SECRET --><dict/></plist>", "unrecognized-profile"),
    "trailing": (good + marker, "unrecognized-profile"),
    "unreferenced-object": (orphan_record(good), "unrecognized-profile"),
    "unreferenced-bytes": (gap(good), "unrecognized-profile"),
    "reserved": (good[:-32] + bytes([42]) + good[-31:], "unrecognized-profile"),
    "too-large": (b"x"*1025, "size-or-read"),
    "empty": (b"", "size-or-read"),
    "hardlink": (good, "access"), "unfiltered-xattr": (good, "access"),
    "acl": (good, "access"), "ancestor-acl": (good, "ancestry"),
    "writable": (good, "access"), "writable-dir": (good, "ancestry"),
    "symlink": (good, "path"), "symlink-dir": (good, "path"),
    "fifo": (good, "path"), "lock": (good, "access"),
    "replace-before": (good, "prechange-drift"), "replace-after": (good, "postchange-drift"),
    "already-readable": (good, "verified"),
}
with tempfile.TemporaryDirectory(prefix="b4-profile-tests-") as temp:
    base = Path(temp).resolve()
    binary = base / "fixture"
    subprocess.run(["/usr/bin/clang", "-fobjc-arc", "-Wall", "-Wextra", "-Werror",
                    "-framework", "Foundation", str(here/"profile-fixture.m"), "-o", binary], check=True)
    for name, (payload, outcome) in cases.items():
        root = base/name
        file = root/target
        file.parent.mkdir(parents=True)
        file.write_bytes(payload)
        file.chmod(0o644 if name == "already-readable" else 0o600)
        lock = None
        if name == "hardlink": os.link(file, root/"other")
        if name == "unfiltered-xattr": subprocess.run(["/usr/bin/xattr","-w","test.marker",marker.decode(),file], check=True)
        if name in ("acl", "ancestor-acl"):
            subprocess.run(["/bin/chmod", "+a", "everyone allow read", file if name=="acl" else file.parent], check=True)
        if name == "writable": file.chmod(0o666)
        if name == "writable-dir": file.parent.chmod(0o777)
        if name in ("symlink", "symlink-dir"):
            item = file if name == "symlink" else file.parent
            item.rename(root/"indirect")
            item.symlink_to(root/"indirect")
        if name == "fifo":
            file.unlink()
            os.mkfifo(file, 0o600)
        if name == "lock":
            lock = file.open("rb")
            fcntl.flock(lock, fcntl.LOCK_EX)
        initial = file.stat()
        res = subprocess.run([binary, root, name], capture_output=True, timeout=5)
        assert not res.stderr and marker not in res.stdout, name
        report = json.loads(res.stdout)
        assert report["result"] == outcome, (name, report)
        assert res.returncode == int(outcome != "verified"), name
        assert report["modeChanged"] == (outcome=="verified" and name!="already-readable" or name=="replace-after"), name
        if outcome == "verified":
            assert report["before"]["sha256"] == report["after"]["sha256"] == hashlib.sha256(payload).hexdigest()
            assert report["before"]["inode"] == report["after"]["inode"] == str(initial.st_ino)
            assert report["after"]["mode"] == "0644" and file.read_bytes() == payload
        else:
            assert report["after"] is None
            if name.startswith("replace-"):
                assert stat.S_IMODE((root/"saved").stat().st_mode) == 0o600
                assert report["restored"] is (True if name=="replace-after" else None)
                assert file.stat().st_ino != initial.st_ino and file.stat().st_mode & 0o777 == 0o600
            else:
                assert file.stat().st_mode == initial.st_mode
        if lock: lock.close()
print(f"{len(cases)} ordinary-user fixture cases passed")
