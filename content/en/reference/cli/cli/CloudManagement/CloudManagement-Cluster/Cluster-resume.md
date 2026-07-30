---
title: "resume | Cloud"
slug: /cli/cli/Cluster-resume
sidebar_label: "resume"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation resumes a suspended cluster. | Cloud"
type: docx
token: EfaUd8o9LoguWnx6jndcyTJfnzd
sidebar_position: 9
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - resume
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# resume

This operation resumes a suspended cluster.

## Synopsis\{#synopsis}

```bash
zilliz cluster resume
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the cluster to resume.

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

## Example\{#example}

```bash
zilliz cluster resume --cluster-id in01-xxxxxxxxxxxx
```
