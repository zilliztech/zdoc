---
title: "Schedule Automatic Backups | BYOC"
slug: /schedule-automatic-backups
sidebar_label: "Schedule Automatic Backups"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to enable automatic backups for your clusters, helping ensure data recovery in case of unexpected issues. Automatic backups apply to the entire cluster—backing up individual collections automatically is not supported. | BYOC"
type: origin
token: HDmKwGeGLi2P67kGdNXcigXDn3e
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - automatic
  - Image Search
  - LLMs
  - Machine Learning
  - RAG

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Schedule Automatic Backups

Zilliz Cloud allows you to enable **automatic backups** for your clusters, helping ensure data recovery in case of unexpected issues. Automatic backups apply to the **entire cluster**—backing up individual collections automatically is not supported.

This guide walks you through how to schedule automatic backups on Zilliz Cloud. To create on-demand backups, see [Create Backup](./create-snapshot).

## Limits\{#limits}

- **Access control**: You must be a **project admin**, **organization owner**, or have a **custom role** with backup privileges.

- **Excluded from backup**:

    - Collection TTL settings

    - Password for the default user `db_admin` (a new password is generated during [restore](./restore-from-snapshot))

    - Cluster dynamic and scheduled scaling settings

- **Cluster shard settings**: Backed up but may be adjusted during restore if the cluster CU size is reduced, due to shard-per-CU limits. See [Zilliz Cloud Limits](./limits#shards) for details.

- **Backup job restrictions**:

    - Manual backups cannot start while an automatic backup is in progress.

    - Automatic backups will still run if a manual backup is already in progress.

## Enable automatic backup\{#enable-automatic-backup}

Automatic backup settings are cluster-specific and **disabled by default**. Because backups incur storage costs, you can control when and how Zilliz Cloud creates them. Once automatic backup is enabled, Zilliz Cloud generates an initial backup immediately, followed by recurring backups based on your specified schedule.

### Via web console\{#via-web-console}

When you enable automatic backup on the web console, Zilliz Cloud is configured to the followings by default:

- **Frequency:** Create a backup daily

- **Backup Time:** Between 8 a.m. and 10 a.m. (UTC +08:00)

- **Retention Period:** Retain each backup for 7 days

You can adjust these settings to fit your needs. 

The following demo shows how to enable and configure automatic backups:

<Supademo id="cmcsqvpfk0gns9st8bd3faaje?utm_source=link" title=""  />

### Via RESTful API\{#via-restful-api}

The following example enables automatic backup for a cluster. For details about the RESTful API, see [Set Backup Policy](/reference/restful/set-backup-policy-v2).

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "frequency": "1,2,3,5",
    "startTime": "02:00-04:00",
    "retentionDays": 7,
    "enabled": true
}'
```

The following is an example output. A backup job is immediately generated once automatic backup is enabled. You can check the progress in the [project job center](/docs/job-center).

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED"
    }
}
```

## Check backup schedule\{#check-backup-schedule}

When automatic backup is enabled, you can check its schedule.

### Via web console\{#via-web-console}

The following demo shows how to check automatic backup schedule on the Zilliz Cloud web console.

<Supademo id="cmcsr43kx02umxk0ih3i31jaq?utm_source=link" title=""  />

### Via RESTful API\{#via-restful-api}

The following example checks the automatic backup policy of a cluster. For details about the RESTful API, see [Get Backup Policy](/reference/restful/get-backup-policy-v2).

```bash
curl --request GET \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
```

The following is an example output. 

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "ENABLED",
        "startTime": "02:00-04:00",
        "frequency": "1,2,3,5",
        "retentionDays": 7
    }
}
```

## Disable automatic backup\{#disable-automatic-backup}

You can also disable automatic backup for a cluster.

### Via web console\{#via-web-console}

The following demo shows how to check automatic backup schedule on the Zilliz Cloud web console.

<Supademo id="cmcsr7chx0gu29st8s0obm37l?utm_source=link" title=""  />

### Via RESTful API\{#via-restful-api}

The following example disables automatic backup for a cluster. For details about the RESTful API, see [Set Backup Policy](/reference/restful/set-backup-policy-v2).

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/policy" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "enabled": false
}'
```

The following is an example output. 

```bash
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "status": "DISABLED"
    }
}
```

## FAQs\{#faqs}

**How long does a backup job take?**
Backup duration depends on the size of your data. As a reference, backing up 700 MB typically takes about 1 second. If your cluster contains more than 1,000 collections, the process may take slightly longer.

**Can I perform DDL (Data Definition Language) operations during a backup?**
It is recommended to avoid major DDL (Data Definition Language) operations—such as creating or dropping collections—while a backup is in progress, as they may interfere with the process or lead to inconsistent results.

**What is the retention period of automatic backup files?**

The default retention period for automatic backups is 7 days, and you can adjust it up to a maximum of 30 days.

**Will backup files be deleted if the original cluster is dropped?**

This depends on the creation method of the backup file. All automatic backups are deleted along with the original cluster. But [manual cluster backups](./create-snapshot) are retained permanently and will not be deleted when the cluster is deleted. You must delete them manually if no longer needed.

