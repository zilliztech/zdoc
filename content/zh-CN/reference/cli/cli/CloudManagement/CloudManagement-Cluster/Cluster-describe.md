---
displayed_sidbar: cliSidebar
title: "describe | Cloud"
slug: /cli/cli/Cluster-describe
sidebar_label: "describe"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets details of a cluster. | Cloud"
type: docx
token: WsJBdDbB2ouQC0xk8c1cwDFanGf
sidebar_position: 3
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# describe

This operation gets details of a cluster.

## Description

This command returns the details of a cluster, including 

- The cluster display name (`clusterName`),

- The ID of the project it belongs to (`projectId`),

- The region it is located in (`regionId`),

- The subscription plan it uses (`plan`),

- Its current status (`status`),

- Its public and private connection endpoints (`connectAddress` and `privateLinkAddress`),

- The time it was created (`createTime`),

- The number of replicas it has (`replica`),

- Its CU size (`cuSize`, the value is always 0 for free and serverless clusters),

- Its storage size (`storageSize`) and deployment option (`deploymentOption`),

- The number of created backups (`snapshotNumber`, the value is always 0 for free and serverless clusters),

- The autoscaling policies (`autoscaling`) that are configured for it.

## Synopsis

```bash
zilliz cluster describe
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates a cluster ID. For example, `in01-xxxxxxxxxxxx`.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example

```bash
zilliz cluster describe --cluster-id in01-xxxxxxxxxxxx
```
