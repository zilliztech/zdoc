---
title: "suspend | Cloud"
slug: /cli/cli/Cluster-suspend
sidebar_label: "suspend"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation suspends a running cluster. Suspending stops compute charges. | Cloud"
type: docx
token: RjlQdGJyzolWm0xZVyUc6yAdnyc
sidebar_position: 10
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - suspend
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# suspend

This operation suspends a running cluster. Suspending stops compute charges.

## Synopsis\{#synopsis}

```bash
zilliz cluster suspend
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the cluster to suspend.

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
zilliz cluster suspend --cluster-id in01-xxxxxxxxxxxx
```
