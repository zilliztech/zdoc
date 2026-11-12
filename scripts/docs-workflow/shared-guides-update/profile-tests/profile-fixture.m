// Only the local test binary has an alternate root or fault injection.
#import <Foundation/Foundation.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/xattr.h>

static const char *fault;
static char target[PATH_MAX], saved[PATH_MAX];

static void replaceFixture(void) {
    if (rename(target, saved)) abort();
    int fd = open(target, O_CREAT|O_EXCL|O_WRONLY, 0600);
    if (fd < 0 || close(fd)) abort();
}

static ssize_t fixtureRead(int fd, void *bytes, size_t size, off_t offset) {
    ssize_t n = pread(fd, bytes, size, offset);
    if (!strcmp(fault, "replace-before")) { fault=""; replaceFixture(); }
    return n;
}

static int fixtureChange(int fd, mode_t mode) {
    int result = fchmod(fd, mode);
    if (!result && mode == 0644 && !strcmp(fault, "replace-after")) replaceFixture();
    return result;
}

// Codex's macOS host adds protected com.apple.provenance to every new file.
// Remove only that exact name from this test shim. The unfiltered case below
// separately tests the production all-xattrs refusal with a real attribute.
static ssize_t fixtureAttrs(int fd, char *unused, size_t size, int options) {
    (void)unused; (void)size;
    char names[256];
    ssize_t length = flistxattr(fd, names, sizeof(names), options);
    if (length == sizeof("com.apple.provenance") && !memcmp(names,"com.apple.provenance",length) &&
        strcmp(fault, "unfiltered-xattr")) return 0;
    return length;
}

#define flistxattr fixtureAttrs
#define pread fixtureRead
#define fchmod fixtureChange
#define main productionEntry
#import "../provision-profile.m"
#undef main

int main(int argc, char **argv) {
    @autoreleasepool {
        if (getuid() == 0 || argc != 3) return 2;
        fault = argv[2];
        snprintf(target, sizeof(target), "%s/Library/Preferences/OpenDirectory/Configurations/Search.plist", argv[1]);
        snprintf(saved, sizeof(saved), "%s/saved", argv[1]);
        for (unsigned i = 0; i<=LEAF; i++) {
            if (!flagsAllowed(i, 0) || flagsAllowed(i, UF_IMMUTABLE) ||
                flagsAllowed(i, SF_NOUNLINK) != (i <= 2)) return 2;
        }
        return run(argv[1], getuid(), getgid());
    }
}
