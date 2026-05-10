// Shared cppgc/heap.h MSVC patcher.
//
// V8 13 dropped the MSVC fallback in <cppgc/heap.h>: the StackStartMarker
// constructor calls __builtin_frame_address(0) unconditionally, which is a
// GCC/Clang builtin MSVC does not recognize.  Restore the MSVC branch using
// _AddressOfReturnAddress() (the same intrinsic V8 itself used to ship)
// in every cached copy of the header so MSVC-built native addons that
// transitively include cppgc headers (e.g. electron-edge-js) compile.
//
// Two cache directories must be patched on Windows:
//   - %LOCALAPPDATA%\node-gyp\Cache\<v>\  (used by direct node-gyp builds)
//   - %USERPROFILE%\.electron-gyp\<v>\    (used by @electron/rebuild during
//     packaging via electron-builder)
//
// Idempotent: detects the already-patched marker and skips.

const fs = require("fs");
const path = require("path");
require("colors");

function patchCppgcHeapAt(headerPath) {
    if (!fs.existsSync(headerPath)) {
        console.log(`cppgc/heap.h not present at ${headerPath} - skipping`.bold.yellow);
        return;
    }

    let content = fs.readFileSync(headerPath, "utf8");
    if (content.includes("_AddressOfReturnAddress")) {
        console.log(`cppgc/heap.h already patched for MSVC at ${headerPath}`.bold.green);
        return;
    }

    const original = "StackStartMarker() : stack_start_(__builtin_frame_address(0)) {}";
    if (!content.includes(original)) {
        console.log(`cppgc/heap.h does not contain expected StackStartMarker line at ${headerPath} - skipping`.bold.yellow);
        return;
    }
    const replacement =
        "#if defined(_MSC_VER) && !defined(__clang__)\n" +
        "  StackStartMarker() : stack_start_(_AddressOfReturnAddress()) {}\n" +
        "#else\n" +
        "  StackStartMarker() : stack_start_(__builtin_frame_address(0)) {}\n" +
        "#endif";
    content = content.replace(original, replacement);

    // _AddressOfReturnAddress is declared in <intrin.h>; cppgc/heap.h does
    // not include it on its own.  Insert the include + intrinsic pragma
    // right after v8config.h so the MSVC branch above resolves cleanly.
    const includeAnchor = '#include "v8config.h"  // NOLINT(build/include_directory)';
    if (content.includes(includeAnchor)) {
        const includeBlock = includeAnchor +
            "\n\n#if defined(_MSC_VER) && !defined(__clang__)\n" +
            "#include <intrin.h>\n" +
            "#pragma intrinsic(_AddressOfReturnAddress)\n" +
            "#endif";
        content = content.replace(includeAnchor, includeBlock);
    }

    fs.writeFileSync(headerPath, content, "utf8");
    console.log(`Patched cppgc/heap.h for MSVC at ${headerPath}`.bold.green);
}

function knownCachePaths(electronVersion) {
    const candidates = [];
    if (process.env.LOCALAPPDATA) {
        candidates.push(path.join(
            process.env.LOCALAPPDATA, "node-gyp", "Cache", electronVersion,
            "include", "node", "cppgc", "heap.h"));
    }
    if (process.env.USERPROFILE) {
        candidates.push(path.join(
            process.env.USERPROFILE, ".electron-gyp", electronVersion,
            "include", "node", "cppgc", "heap.h"));
    }
    return candidates;
}

function patchAllKnownCaches(electronVersion) {
    const candidates = knownCachePaths(electronVersion);

    if (candidates.length === 0) {
        console.log("Neither LOCALAPPDATA nor USERPROFILE set - skipping cppgc/heap.h MSVC patch".bold.yellow);
        return;
    }
    for (const headerPath of candidates) {
        console.log(`found cppgc/heap.h at ${headerPath}`.bold.blue);
        patchCppgcHeapAt(headerPath);
    }
}

patchAllKnownCaches(process.argv[2]);