#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Configure NiFi processors and controller services for Loki -> PostgreSQL flow."""
import json
import time
import requests

BASE_URL = "http://localhost:8088/nifi-api"


def get_root_group():
    r = requests.get(f"{BASE_URL}/flow/process-groups/root")
    if r.status_code == 200:
        return r.json()["processGroupFlow"]["id"]
    return None


def get_processors_by_name(group_id):
    r = requests.get(f"{BASE_URL}/flow/process-groups/{group_id}")
    if r.status_code != 200:
        return {}
    procs = r.json()["processGroupFlow"]["flow"].get("processors", [])
    by_name = {}
    for p in procs:
        name = p.get("component", {}).get("name")
        if name:
            by_name[name] = p.get("id")
    return by_name


def get_controller_services(group_id):
    r = requests.get(f"{BASE_URL}/flow/process-groups/{group_id}/controller-services")
    if r.status_code != 200:
        return {}
    services = r.json().get("controllerServices", [])
    by_name = {}
    state_rank = {"ENABLED": 3, "ENABLING": 2, "DISABLED": 1}
    for s in services:
        name = s.get("component", {}).get("name")
        if name:
            current_id = by_name.get(name)
            if not current_id:
                by_name[name] = s.get("id")
                continue
            # Prefer higher state rank
            current_state = "DISABLED"
            for existing in services:
                if existing.get("id") == current_id:
                    current_state = existing.get("component", {}).get("state", "DISABLED")
                    break
            new_state = s.get("component", {}).get("state", "DISABLED")
            if state_rank.get(new_state, 0) > state_rank.get(current_state, 0):
                by_name[name] = s.get("id")
    return by_name


def update_processor(processor_id, properties=None, auto_terminate=None, scheduling_strategy=None, scheduling_period=None):
    r = requests.get(f"{BASE_URL}/processors/{processor_id}")
    if r.status_code != 200:
        print(f"Cannot read processor {processor_id}")
        return False

    processor = r.json()
    revision = processor.get("revision", {}).get("version", 0)
    component = processor.get("component", {})
    config = component.get("config", {})

    if properties is not None:
        config["properties"] = properties
    if auto_terminate is not None:
        config["autoTerminatedRelationships"] = auto_terminate
    if scheduling_strategy is not None:
        config["schedulingStrategy"] = scheduling_strategy
    if scheduling_period is not None:
        config["schedulingPeriod"] = scheduling_period

    component["config"] = config

    payload = {
        "revision": {"version": revision},
        "component": component
    }

    r = requests.put(f"{BASE_URL}/processors/{processor_id}", json=payload)
    if r.status_code not in [200, 201]:
        print(f"Failed to update {processor_id}: {r.status_code} {r.text[:200]}")
        return False
    return True


def create_controller_service(group_id, name, service_type, bundle, properties):
    url = f"{BASE_URL}/process-groups/{group_id}/controller-services"
    payload = {
        "revision": {"version": 0},
        "component": {
            "type": service_type,
            "bundle": bundle,
            "name": name,
            "properties": properties
        }
    }
    r = requests.post(url, json=payload)
    if r.status_code in [200, 201]:
        return r.json().get("id")
    print(f"Failed to create controller service {name}: {r.status_code} {r.text[:200]}")
    return None


def enable_controller_service(service_id):
    r = requests.get(f"{BASE_URL}/controller-services/{service_id}")
    if r.status_code != 200:
        print(f"Cannot read controller service {service_id}")
        return False
    revision = r.json().get("revision", {}).get("version", 0)
    payload = {
        "revision": {"version": revision},
        "state": "ENABLED"
    }
    r = requests.put(f"{BASE_URL}/controller-services/{service_id}/run-status", json=payload)
    if r.status_code not in [200, 201]:
        print(f"Failed to enable controller service {service_id}: {r.status_code} {r.text[:200]}")
        return False
    return True


def stop_all_processors(group_id):
    r = requests.get(f"{BASE_URL}/flow/process-groups/{group_id}")
    if r.status_code != 200:
        return
    procs = r.json()["processGroupFlow"]["flow"].get("processors", [])
    for p in procs:
        pid = p.get("id")
        r2 = requests.get(f"{BASE_URL}/processors/{pid}")
        if r2.status_code != 200:
            continue
        revision = r2.json().get("revision", {}).get("version", 0)
        payload = {"revision": {"version": revision}, "component": {"id": pid, "state": "STOPPED"}}
        requests.put(f"{BASE_URL}/processors/{pid}", json=payload)


if __name__ == "__main__":
    group_id = get_root_group()
    if not group_id:
        print("Cannot access NiFi")
        raise SystemExit(1)

    stop_all_processors(group_id)

    # Create or reuse controller services
    services = get_controller_services(group_id)
    dbcp_id = services.get("PostgreSQL_Logs")
    if not dbcp_id:
        dbcp_id = create_controller_service(
            group_id,
            "PostgreSQL_Logs",
            "org.apache.nifi.dbcp.DBCPConnectionPool",
            {"group": "org.apache.nifi", "artifact": "nifi-dbcp-service-nar", "version": "1.25.0"},
            {
                "Database Connection URL": "jdbc:postgresql://postgres:5432/logs_db",
                "Database Driver Class Name": "org.postgresql.Driver",
                "Database User": "postgres",
                "Password": "postgres",
                "Max Wait Time": "500 millis",
                "Max Pool Size": "8"
            }
        )

    reader_id = services.get("JsonTreeReader2")
    if not reader_id:
        reader_id = create_controller_service(
            group_id,
            "JsonTreeReader2",
            "org.apache.nifi.json.JsonTreeReader",
            {"group": "org.apache.nifi", "artifact": "nifi-record-serialization-services-nar", "version": "1.25.0"},
            {}
        )

    time.sleep(1)
    if dbcp_id:
        enable_controller_service(dbcp_id)
    if reader_id:
        enable_controller_service(reader_id)

    # Configure processors
    procs = get_processors_by_name(group_id)

    # Generate Loki Query
    update_processor(
        procs["Generate Loki Query"],
        properties={
            "File Size": "1 B",
            "Data Format": "Text"
        },
        auto_terminate=[],
        scheduling_strategy="TIMER_DRIVEN",
        scheduling_period="1 min"
    )

    # Query Loki (InvokeHTTP)
    update_processor(
        procs["Query Loki"],
        properties={
            "HTTP Method": "GET",
            "HTTP URL": "http://loki:3100/loki/api/v1/query_range?query={job=\"docker\"}&start=1&end=9999999999&limit=100",
            "Remote URL": "http://loki:3100/loki/api/v1/query_range?query={job=\"docker\"}&start=1&end=9999999999&limit=100",
            "Connection Timeout": "5 sec",
            "Read Timeout": "10 sec"
        },
        auto_terminate=["Failure", "No Retry", "Original", "Retry"]
    )

    # Split JSON Results
    update_processor(
        procs["Split JSON Results"],
        properties={
            "JsonPath Expression": "$.data.result[*]"
        },
        auto_terminate=["failure", "original"]
    )

    # Split Log Entries
    update_processor(
        procs["Split Log Entries"],
        properties={
            "JsonPath Expression": "$.values[*]"
        },
        auto_terminate=["failure", "original"]
    )

    # Transform to System Logs (Jolt)
    jolt_spec = [
        {"operation": "shift", "spec": {"1": "message"}},
        {"operation": "default", "spec": {"service": "unknown", "level": "INFO"}}
    ]
    update_processor(
        procs["Transform to System Logs"],
        properties={
            "jolt-spec": json.dumps(jolt_spec),
            "jolt-transform": "jolt-transform-chain",
            "Jolt Specification": None,
            "Jolt Transform": None
        },
        auto_terminate=["failure"]
    )

    # Write to PostgreSQL
    update_processor(
        procs["Write to PostgreSQL"],
        properties={
            "put-db-record-dcbp-service": dbcp_id,
            "put-db-record-record-reader": reader_id,
            "put-db-record-table-name": "system_logs",
            "put-db-record-statement-type": "INSERT"
        },
        auto_terminate=["success", "failure", "retry"]
    )

    print("Configuration complete.")
