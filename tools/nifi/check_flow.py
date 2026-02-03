#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check NiFi flow status
"""
import requests
import json

BASE_URL = "http://localhost:8088/nifi-api"

def check_flow():
    response = requests.get(f"{BASE_URL}/flow/process-groups/root")
    if response.status_code != 200:
        print("Cannot access NiFi")
        return
    
    data = response.json()
    flow = data["processGroupFlow"]["flow"]
    
    procs = flow.get("processors", [])
    conns = flow.get("connections", [])
    
    print("=" * 60)
    print("NiFi Flow Status")
    print("=" * 60)
    
    print(f"\nProcessors: {len(procs)}")
    for p in procs:
        comp = p.get("component", {})
        name = comp.get("name", "?")
        state = comp.get("state", "?")
        print(f"  • {name} [{state}]")
    
    print(f"\nConnections: {len(conns)}")
    for c in conns:
        comp = c.get("component", {})
        src_id = comp.get("source", {}).get("id", "?")
        dst_id = comp.get("destination", {}).get("id", "?")
        rels = comp.get("selectedRelationships", [])
        
        # Find names
        src_name = next((p.get("component", {}).get("name") for p in procs if p["id"] == src_id), "?")
        dst_name = next((p.get("component", {}).get("name") for p in procs if p["id"] == dst_id), "?")
        rel_str = ", ".join(rels) if rels else "?"
        
        print(f"  • {src_name} --[{rel_str}]--> {dst_name}")
    
    print("\n" + "=" * 60)
    
    if len(procs) == 6 and len(conns) == 5:
        print("SUCCESS: Flow is properly connected!")
        print("\nNext: Go to http://localhost:8088 and click START (play button)")
    elif len(procs) == 6 and len(conns) == 0:
        print("WARNING: Processors exist but NO connections!")
        print("You must manually connect them in the UI")
    else:
        print(f"STATUS: {len(procs)} processors, {len(conns)} connections")

if __name__ == "__main__":
    check_flow()
