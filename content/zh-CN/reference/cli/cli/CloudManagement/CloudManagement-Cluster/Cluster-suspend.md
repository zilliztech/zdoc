---
displayed_sidbar: cliSidebar
title: "suspend | Cloud"
slug: /cli/cli/Cluster-suspend
sidebar_label: "suspend"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation suspends a running cluster. Suspending stops compute charges. | Cloud"
type: docx
token: RaGJdFRlQo2nlVxxyc5cbUtCnsh
sidebar_position: 10
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - suspend
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# suspend

This operation suspends a running cluster. Suspending stops compute charges.

## Synopsis

```bash
zilliz cluster suspend
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

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

## Example

```bash
zilliz cluster suspend --cluster-id in01-xxxxxxxxxxxx
```
