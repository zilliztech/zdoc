---
displayed_sidbar: cliSidebar
title: "status | Cloud"
slug: /cli/cli/Import-status
sidebar_label: "status"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets the status of an import job. | Cloud"
type: docx
token: WgScdvYdRoGsQyxTnfDcLim2nBh
sidebar_position: 3
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - status
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# status

This operation gets the status of an import job.

## Synopsis

```bash
zilliz import status
--job-id <value>
--cluster-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

**OPTIONS:**

- **--job-id** (*string*) -

    **[REQUIRED]**

    Indicates an import job ID, which is similar to `job-xxxxx`.

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the involved cluster in the specified import job, which is similar to `inxx-xxxxx`.

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
zilliz import status --job-id job-xxxx --cluster-id in01-xxxxxxxxxxxx
```
