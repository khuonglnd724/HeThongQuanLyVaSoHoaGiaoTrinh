#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check processor validation status and controller services."""
import requests

BASE_URL = "http://localhost:8088/nifi-api"

def get_root_group():
    r = requests.get(f"{BASE_URL}/flow/process-groups/root")
    if r.status_code == 200:
        return r.json()["processGroupFlow"]["id"]
    return None

root = get_root_group()
if not root:
    print("Cannot access NiFi")
    raise SystemExit(1)

# Processors validation
r = requests.get(f"{BASE_URL}/flow/process-groups/{root}")
flow = r.json()["processGroupFlow"]["flow"]
procs = flow.get("processors", [])

print("=" * 60)
print("Processor Validation")
print("=" * 60)
for p in procs:
    pid = p.get("id")
    name = p.get("component", {}).get("name", "?")
    r2 = requests.get(f"{BASE_URL}/processors/{pid}")
    if r2.status_code != 200:
        print(f"{name}: cannot read")
        continue
    comp = r2.json().get("component", {})
    state = comp.get("state", "?")
    validation = comp.get("validationErrors", [])
    status = "OK" if not validation else "INVALID"
    print(f"- {name}: {state} | {status}")
    for err in validation:
        print(f"    • {err}")

print("\n" + "=" * 60)
print("Controller Services")
print("=" * 60)
svc = requests.get(f"{BASE_URL}/flow/process-groups/{root}/controller-services")
if svc.status_code == 200:
    services = svc.json().get("controllerServices", [])
    for s in services:
        comp = s.get("component", {})
        print(f"- {comp.get('name')} | {comp.get('state')} | {comp.get('type')}")
else:
    print("Cannot list controller services")
