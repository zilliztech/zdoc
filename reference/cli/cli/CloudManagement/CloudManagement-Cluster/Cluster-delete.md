---
title: "delete | Cloud"
slug: /cli/cli/Cluster-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes a cluster. This action is irreversible. | Cloud"
type: docx
token: S4Omd93kpoyuqtx4E7scLCoXnyB
sidebar_position: 2
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

This operation deletes a cluster. This action is irreversible.

## Description\{#description}

Removing a cluster also wipes out the data that it stores. Please exercise with caution. Running this command without any options triggers a set of interactive prompts.

## Synopsis\{#synopsis}

```bash
zilliz cluster delete
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the cluster to delete, which is similar to `inxx-xxxxx`.

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

- **--yes, -y** (*boolean*) -

    Indicates whether to skip the confirmation prompt.

## Example\{#example}

```bash
zilliz cluster delete --cluster-id in01-xxxxxxxxxxxx

# Skip confirmation prompt
zilliz cluster delete --cluster-id in01-xxxxxxxxxxxx -y
```
