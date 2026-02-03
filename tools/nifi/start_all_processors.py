#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Start all processors in the root process group."""
import requests
import time

BASE_URL = "http://localhost:8088/nifi-api"

def get_root_group():
    r = requests.get(f"{BASE_URL}/flow/process-groups/root")
    if r.status_code == 200:
        return r.json()["processGroupFlow"]["id"]
    return None

def list_processors(group_id):
    r = requests.get(f"{BASE_URL}/flow/process-groups/{group_id}")
    if r.status_code != 200:
        return []
    return r.json()["processGroupFlow"]["flow"].get("processors", [])

def start_processor(pid):
    r = requests.get(f"{BASE_URL}/processors/{pid}")
    if r.status_code != 200:
        return False
    rev = r.json().get("revision", {}).get("version", 0)
    payload = {"revision": {"version": rev}, "component": {"id": pid, "state": "RUNNING"}}
    r = requests.put(f"{BASE_URL}/processors/{pid}", json=payload)
    return r.status_code in [200, 201]

if __name__ == "__main__":
    group_id = get_root_group()
    if not group_id:
        print("Cannot access NiFi")
        raise SystemExit(1)

    procs = list_processors(group_id)
    print(f"Starting {len(procs)} processors...")

    started = 0
    for p in procs:
        pid = p.get("id")
        name = p.get("component", {}).get("name", "?")
        if start_processor(pid):
            started += 1
            print(f"OK: {name}")
        else:
            print(f"FAILED: {name}")
        time.sleep(0.2)

    print(f"Started {started}/{len(procs)} processors")
