#!/usr/bin/env python3
"""First push to a brand-new repo: build tree from workdir, create root commit, POST refs/heads/main."""
import base64, json, os, sys, urllib.request
sys.path.insert(0, "/opt/hatch/skills/skill-creator/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

CREDENTIAL = "custom.github-pat"
API = "https://api.github.com"
OWNER, REPO = "builtbysai", "spiritual-seasons-pwa-v2"
WORKDIR = os.path.expanduser("~/workspace/unslop-hub/work/spiritual-seasons/v2")

def api(method, path, data=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(API + path, data=body,
        headers={"Accept": "application/vnd.github+json", "Content-Type": "application/json"}, method=method)
    add_surrogate_to_request(req, CREDENTIAL, entry_name="access_token", allowed_hosts=("api.github.com",))
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, read_json_response(resp)
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"GitHub API {method} {path} -> HTTP {exc.code}: {exc.read().decode()[:500]}")

def main():
    entries = []
    for root, dirs, files in os.walk(WORKDIR):
        dirs[:] = [d for d in dirs if d != ".git"]
        for f in sorted(files):
            full = os.path.join(root, f)
            rel = os.path.relpath(full, WORKDIR)
            with open(full, "rb") as fh:
                content = base64.b64encode(fh.read()).decode()
            _, blob = api("POST", f"/repos/{OWNER}/{REPO}/git/blobs",
                          {"content": content, "encoding": "base64"})
            entries.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})
            print("blob", rel, len(entries))
    _, tree = api("POST", f"/repos/{OWNER}/{REPO}/git/trees", {"tree": entries})
    print("tree", tree["sha"])
    _, commit = api("POST", f"/repos/{OWNER}/{REPO}/git/commits",
                    {"message": "Spiritual Seasons v2: responsive rebuild with native viewport fit",
                     "tree": tree["sha"]})
    print("commit", commit["sha"])
    _, ref = api("POST", f"/repos/{OWNER}/{REPO}/git/refs",
                 {"ref": "refs/heads/main", "sha": commit["sha"]})
    print("ref", ref["ref"], ref["object"]["sha"])

main()
