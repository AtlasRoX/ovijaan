import json, sys, os

base = os.path.expanduser("~/.puku-cli/projects/X--ovijhann/07fd992d-1615-44ec-9caa-7648b9eb27a9")

def texts(path):
    out = []
    with open(path, encoding="utf-8", errors="replace") as f:
        for i, line in enumerate(f):
            try:
                d = json.loads(line)
            except Exception:
                continue
            m = d.get("message", {})
            if not isinstance(m, dict):
                continue
            role = m.get("role")
            c = m.get("content")
            parts = []
            if isinstance(c, str):
                parts.append(c)
            elif isinstance(c, list):
                for b in c:
                    if not isinstance(b, dict):
                        continue
                    t = b.get("type")
                    if t == "text":
                        parts.append(b.get("text", ""))
                    elif t == "tool_use":
                        parts.append("[TOOL_USE:%s]" % b.get("name"))
                    elif t == "tool_result":
                        parts.append("[TOOL_RESULT]")
            out.append((i, d.get("type"), role, "\n".join(parts)))
    return out

files = [os.path.join(base, "07fd992d-1615-44ec-9caa-7648b9eb27a9.jsonl")]
sd = os.path.join(base, "subagents")
for fn in sorted(os.listdir(sd)):
    if fn.endswith(".jsonl"):
        files.append(os.path.join(sd, fn))

for p in files:
    print("=== FILE", p)
    for i, ty, role, txt in texts(p):
        print("%6s %-8s %-10s len=%d" % (i, ty, role, len(txt)))
