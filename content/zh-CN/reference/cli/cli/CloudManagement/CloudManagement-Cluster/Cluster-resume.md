---
displayed_sidbar: cliSidebar
title: "resume | Cloud"
slug: /cli/cli/Cluster-resume
sidebar_label: "resume"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation resumes a suspended cluster. | Cloud"
type: docx
token: EbredHGusoLbZbxRLiWcjeManIf
sidebar_position: 9
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - resume
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# resume

This operation resumes a suspended cluster.

## Synopsis

```bash
zilliz cluster resume
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

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

## Example

```bash
zilliz cluster resume --cluster-id in01-xxxxxxxxxxxx
```
