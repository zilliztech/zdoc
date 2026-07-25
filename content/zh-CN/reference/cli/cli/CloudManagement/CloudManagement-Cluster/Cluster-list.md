---
displayed_sidbar: cliSidebar
title: "list | Cloud"
slug: /cli/cli/Cluster-list
sidebar_label: "list"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all clusters. | Cloud"
type: docx
token: SGifd4eCmoxfMmxLohec5nFnn7g
sidebar_position: 4
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# list

This operation lists all clusters.

## Description

This command returns the following fields for each listed cluster:

- `clusterId`

- `clusterName`

- `description`

- `regionId`

- `cuType`

- `plan`

- `cuSize`

- `status`

## Synopsis

```bash
zilliz cluster list
[--page-size <value>]
[--page <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--all]
```

## Options

- **--page-size** (*integer*) -

    Indicates the items per page. The value defaults to **10**.

- **--page** (*integer*) -

    Indicates the page number. The value defaults to **1**.

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

- **--all, -a** (*boolean*) -

    Indicates whether to fetch all pages.

## Example

```bash
# List all clusters
zilliz cluster list

# Fetch all pages
zilliz cluster list --all
```
