// The active profile uses Apple's binary plist object table. Match each encoded
// object against the literal policy, including its full byte span. A semantic
// plist parser alone can ignore duplicate keys, orphan records and trailing data.
#import <Foundation/Foundation.h>

static NSDictionary *localPolicy(BOOL includeLocked) {
    NSString *natural = @"dsAttrTypeStandard:NSPSearchPath";
    NSArray *local = @[@"/Local/Default"];
    NSDictionary *options = @{
        @"dsAttrTypeStandard:SearchPolicy": natural, natural: local,
        @"dsAttrTypeStandard:CSPSearchPath": local, @"dsAttrTypeStandard:LSPSearchPath": local,
        @"requiredNodes": local, @"notify_of_changes": @YES
    };
    NSDictionary *module = @{@"module": @"search", @"options": options,
                             @"uuid": @"A840FC81-A6CD-4665-899E-F8B52B1C6EC4"};
    NSMutableDictionary *policy = [@{@"node name": @"/Search", @"comment": @"Default search policy",
        @"mappings": @{}, @"modules": @{@"session": @[module]}} mutableCopy];
    if (includeLocked) policy[@"locked"] = @NO;
    return policy;
}

enum { MAX_RECORDS = 48, MAX_PROFILE = 1024 };
typedef struct {
    const unsigned char *bytes;
    unsigned offsets[MAX_RECORDS + 1];
    bool seen[MAX_RECORDS];
    unsigned count;
} Profile;

static unsigned read16(const unsigned char *p) { return p[0] * 256u + p[1]; }

// A validated record contains only the marker, optional minimal string-length
// byte pair, and exactly the expected literal or one-byte child references.
static bool matchRecord(Profile *p, unsigned index, id expected) {
    if (index >= p->count) return false;
    const unsigned char *r = p->bytes + p->offsets[index];
    unsigned span = p->offsets[index + 1] - p->offsets[index];
    unsigned kind = r[0] >> 4, count = r[0] & 15;
    if ([expected isKindOfClass:[NSString class]]) {
        NSUInteger len = [expected lengthOfBytesUsingEncoding:NSASCIIStringEncoding];
        unsigned header = len >= 15 ? 3 : 1;
        if (kind != 5 || span != header + len || count != MIN(len, 15u) ||
            (header == 3 && (r[1] != 0x10 || r[2] != len)) ||
            memcmp(r + header, [expected UTF8String], len)) return false;
    } else if ([expected isKindOfClass:[NSNumber class]]) {
        if (span != 1 || r[0] != ([expected boolValue] ? 9 : 8)) return false;
    } else if ([expected isKindOfClass:[NSArray class]]) {
        if (kind != 10 || count != [expected count] || span != count + 1) return false;
        for (unsigned i = 0; i < count; i++)
            if (!matchRecord(p, r[1+i], expected[i])) return false;
    } else {
        if (kind != 13 || count != [expected count] || span != count * 2 + 1) return false;
        for (NSString *key in expected) {
            unsigned i = 0;
            while (i < count && !matchRecord(p, r[1+i], key)) i++;
            if (i == count || !matchRecord(p, r[1+count+i], expected[key])) return false;
        }
    }
    p->seen[index] = true;
    return true;
}

static bool classified(const unsigned char *bytes, size_t size) {
    if (size < 42 || size > MAX_PROFILE || memcmp(bytes, "bplist00", 8)) return false;
    const unsigned char *t = bytes + size - 32;
    // Six zero reserved bytes, two-byte offsets, one-byte references, small
    // object count, top object zero, small offset-table position.
    if (memcmp(t, "\0\0\0\0\0\0\2\1", 8) || memcmp(t+8, (char[7]){0}, 7) ||
        memcmp(t+16, (char[14]){0}, 14)) return false;
    Profile p = {.bytes = bytes, .count = t[15]};
    unsigned table = read16(t + 30);
    if (!p.count || p.count > MAX_RECORDS || table + 2*p.count + 32 != size) return false;
    p.offsets[p.count] = table;
    for (int i = (int)p.count - 1; i >= 0; i--) {
        p.offsets[i] = read16(bytes + table + 2*i);
        if (p.offsets[i] < 8 || p.offsets[i] >= p.offsets[i+1]) return false;
    }
    if (p.offsets[0] != 8 || !matchRecord(&p, 0, localPolicy((bytes[8] & 15) == 5))) return false;
    for (unsigned i = 0; i < p.count; i++) if (!p.seen[i]) return false;
    return true;
}
