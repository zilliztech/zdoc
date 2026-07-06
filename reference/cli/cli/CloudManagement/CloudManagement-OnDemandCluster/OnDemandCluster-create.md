---
title: "create | Cloud"
slug: /cli/cli/OnDemandCluster-create
sidebar_label: "create"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an on-demand cluster in Zilliz Cloud. | Cloud"
type: docx
token: IqkTduvaBo7477xaW1Hc1wBTn9c
sidebar_position: 1
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

This operation creates an on-demand cluster in Zilliz Cloud.

## Description\{#description}

Creates an on-demand cluster in Zilliz Cloud. On-demand clusters can suspend when idle and resume for query workloads.

## Synopsis\{#synopsis}

```bash
zilliz on-demand-cluster create
--project-id <value>
--region-id <value>
--cu-size <value>
--cluster-name <value>
[--session-ttl <value>]
[--max-query-node-cu <value>]
[--max-query-node-replicas <value>]
```

## Options\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    Specifies the project ID.

- **--region-id** (*string*) -

    **[REQUIRED]**

    Specifies the cloud region (e.g. `aws-us-east-1`).

- **--cu-size** (*integer*) -

    **[REQUIRED]**

    Specifies the number of compute units. Minimum: `8`.

- **--cluster-name** (*string*) -

    **[REQUIRED]**

    Specifies the cluster display name. Max 64 characters. Allowed characters: letters, digits, space, `_`, `-`, and Chinese characters.

- **--session-ttl** (*string*) -

    Specifies the auto-suspend TTL. Format: `<number><s|m|h>` (e.g. `30m`, `1h`, `90s`). Minimum: `60s`. Default: `60s`.

- **--max-query-node-cu** (*integer*) -

    Specifies the maximum query node CU.

- **--max-query-node-replicas** (*integer*) -

    Specifies the maximum query node replicas.

## Example\{#example}

```bash
# Create with minimum requirements
zilliz on-demand-cluster create --project-id proj-xxxx --region-id aws-us-east-1 --cu-size 8 --cluster-name my-on-demand

# Create with custom TTL and query node limits
zilliz on-demand-cluster create --project-id proj-xxxx --region-id aws-us-east-1 --cu-size 16 --cluster-name my-cluster --session-ttl 30m --max-query-node-cu 4 --max-query-node-replicas 2
```
