---
title: "describe | Cloud"
slug: /cli/cli/OnDemandCluster-describe
sidebar_label: "describe"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation gets details of an on-demand cluster. | Cloud"
type: docx
token: L2WsdkbDVoD5sGxAkkkcK4UEnHb
sidebar_position: 3
keywords: 
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

This operation gets details of an on-demand cluster.

## Description\{#description}

Gets details for a single on-demand cluster, including status, project, region, and CU size information.

## Synopsis\{#synopsis}

```bash
zilliz on-demand-cluster describe
--cluster-id <value>
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    On-demand cluster ID.

## Example\{#example}

```bash
zilliz -o json on-demand-cluster describe --cluster-id in-xxxxxxxxxxxx

# Example output
# {
#   "autoSuspend": 60,
#   "clusterId": "in-xxxxxxxxxxxx",
#   "clusterName": "c8_60",
#   "status": "RUNNING",
#   "cuSize": 8,
#   "projectId": "proj-xxxx",
#   "regionId": "aws-us-west-2"
# }
```
