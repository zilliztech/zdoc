// Disposable macOS 15 runner only. Production main accepts no paths or options.
#import "profile-format.m"
#include <CommonCrypto/CommonDigest.h>
#include <fcntl.h>
#include <sys/acl.h>
#include <sys/file.h>
#include <sys/stat.h>
#include <sys/xattr.h>
#include <unistd.h>

static const char *parts[] = {"Library","Preferences","OpenDirectory","Configurations","Search.plist"};
enum { LEAF = 5 };
typedef struct {
    int fd[LEAF+1];
    const char *root;
    uid_t owner;
    gid_t group;
} Chain;

static bool sameNode(struct stat a, struct stat b) {
    return a.st_dev == b.st_dev && a.st_ino == b.st_ino && a.st_gen == b.st_gen;
}

static bool sameTime(struct timespec a, struct timespec b) {
    return a.tv_sec == b.tv_sec && a.tv_nsec == b.tv_nsec;
}

static bool flagsAllowed(unsigned depth, unsigned flags) {
    return flags == 0 || (depth <= 2 && flags == SF_NOUNLINK);
}

static bool withoutACL(int fd) {
    errno = 0;
    acl_t acl = acl_get_fd_np(fd, ACL_TYPE_EXTENDED);
    if (!acl) return errno == ENOENT;
    acl_free(acl);
    return false;
}

// Check both names and pinned descriptors on every pass, including the final
// pass after fchmod. All mutable inputs must be under exclusively trusted dirs.
static bool authenticate(Chain *c, unsigned last, mode_t required, struct stat *leaf) {
    char path[PATH_MAX], physical[PATH_MAX];
    if (strlcpy(path, c->root, sizeof(path)) >= sizeof(path)) return false;
    for (unsigned i = 0; i <= last; i++) {
        struct stat opened, named;
        if (i) {
            if (strcmp(path, "/") && strlcat(path, "/", sizeof(path)) >= sizeof(path)) return false;
            if (strlcat(path, parts[i-1], sizeof(path)) >= sizeof(path) ||
                fstatat(c->fd[i-1], parts[i-1], &named, AT_SYMLINK_NOFOLLOW)) return false;
        } else if (lstat(path, &named)) return false;
        if (fstat(c->fd[i], &opened) || !sameNode(opened, named) ||
            fcntl(c->fd[i], F_GETPATH, physical) || strcmp(path, physical) ||
            opened.st_uid != c->owner || opened.st_gid != c->group ||
            !withoutACL(c->fd[i]) || !flagsAllowed(i, opened.st_flags)) return false;
        mode_t mode = opened.st_mode & 07777;
        if (i < LEAF) {
            if (!S_ISDIR(opened.st_mode) || (mode != 0755 && !(c->owner != 0 && mode == 0700))) return false;
        } else {
            if (!S_ISREG(opened.st_mode) || opened.st_nlink != 1 ||
                (required ? mode != required : mode != 0600 && mode != 0644) ||
                flistxattr(c->fd[i], NULL, 0, 0) != 0) return false;
            *leaf = opened;
        }
    }
    return true;
}

static bool readBytes(int fd, off_t size, unsigned char *bytes) {
    if (size <= 0 || size > MAX_PROFILE) return false;
    // Read one extra byte to reject growth; EINTR, short reads, etc. refuse.
    return pread(fd, bytes, MAX_PROFILE+1, 0) == size;
}

static NSDictionary *identity(struct stat st, const unsigned char *bytes) {
    unsigned char digest[CC_SHA256_DIGEST_LENGTH];
    char hex[sizeof(digest)*2+1];
    CC_SHA256(bytes, (CC_LONG)st.st_size, digest);
    for (unsigned i = 0; i < sizeof(digest); i++) snprintf(hex + 2*i, 3, "%02x", digest[i]);
    return @{@"device": @(st.st_dev), @"inode": [NSString stringWithFormat:@"%llu",st.st_ino],
             @"mode": [NSString stringWithFormat:@"%04o",st.st_mode & 07777], @"uid": @(st.st_uid),
             @"gid": @(st.st_gid), @"bytes": @(st.st_size), @"sha256": @(hex)};
}

static NSString *provision(Chain *c, NSMutableDictionary *report) {
    struct stat before, now;
    unsigned char original[MAX_PROFILE+1], check[MAX_PROFILE+1];
    c->fd[0] = open(c->root, O_DIRECTORY|O_RDONLY|O_NOFOLLOW|O_CLOEXEC);
    if (c->fd[0] < 0) return @"ancestry";
    for (unsigned i = 1; i <= LEAF; i++) {
        struct stat named;
        if (!authenticate(c, i-1, 0, NULL)) return @"ancestry";
        if (fstatat(c->fd[i-1], parts[i-1], &named, AT_SYMLINK_NOFOLLOW) ||
            (i==LEAF ? !S_ISREG(named.st_mode) : !S_ISDIR(named.st_mode))) return @"path";
        c->fd[i] = openat(c->fd[i-1], parts[i-1], O_RDONLY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC|(i<LEAF?O_DIRECTORY:0));
        if (c->fd[i] < 0) return @"path";
    }
    int fd = c->fd[LEAF];
    if (!authenticate(c, LEAF, 0, &before) || flock(fd, LOCK_EX|LOCK_NB)) return @"access";
    if (!readBytes(fd, before.st_size, original)) return @"size-or-read";
    if (!classified(original, before.st_size)) return @"unrecognized-profile";
    report[@"before"] = identity(before, original);
    if (!authenticate(c, LEAF, before.st_mode & 07777, &now) || !sameNode(before, now) ||
        !sameTime(before.st_mtimespec, now.st_mtimespec) || !sameTime(before.st_ctimespec, now.st_ctimespec) ||
        now.st_size != before.st_size || !readBytes(fd, now.st_size, check) ||
        memcmp(original, check, before.st_size)) return @"prechange-drift";
    if ((before.st_mode & 07777) == 0600) {
        if (fchmod(fd, 0644)) return @"mode-change-refused";
        report[@"modeChanged"] = @YES;
    }
    if (!authenticate(c, LEAF, 0644, &now) || !sameNode(before, now) ||
        !sameTime(before.st_mtimespec, now.st_mtimespec) || now.st_size != before.st_size ||
        !readBytes(fd, now.st_size, check) || memcmp(original, check, before.st_size)) {
        if ([report[@"modeChanged"] boolValue]) {
            bool restored = !fchmod(fd, 0600) && !fstat(fd, &now) && sameNode(before, now) &&
                            (now.st_mode & 07777) == 0600;
            report[@"restored"] = @(restored);
            if (!restored) return @"postchange-restore-failed";
        }
        return @"postchange-drift";
    }
    report[@"after"] = identity(now, check);
    return @"verified";
}

static int run(const char *root, uid_t owner, gid_t group) {
    Chain c = {.root=root, .owner=owner, .group=group};
    for (unsigned i=0; i<=LEAF; i++) c.fd[i] = -1;
    NSMutableDictionary *report = [@{@"schemaVersion": @1, @"productionQualified": @NO,
        @"before": NSNull.null, @"after": NSNull.null, @"restored": NSNull.null, @"modeChanged": @NO} mutableCopy];
    NSString *result = provision(&c, report);
    for (unsigned i=0; i<=LEAF; i++) if (c.fd[i] >= 0) close(c.fd[i]);
    report[@"result"] = result;
    NSData *json = [NSJSONSerialization dataWithJSONObject:report options:NSJSONWritingSortedKeys error:nil];
    if (!json || fwrite(json.bytes, 1, json.length, stdout) != json.length || puts("") < 0 || fflush(stdout)) return 1;
    return [result isEqualToString:@"verified"] ? 0 : 1;
}

int main(int argc, const char **argv) {
    @autoreleasepool {
        (void)argv;
        if (argc != 1 || getuid() || geteuid() ||
            NSProcessInfo.processInfo.operatingSystemVersion.majorVersion != 15) return 1;
        alarm(8);
        return run("/", 0, 0);
    }
}
