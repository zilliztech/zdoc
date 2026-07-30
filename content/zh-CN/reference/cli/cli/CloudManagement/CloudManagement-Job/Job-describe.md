---
displayed_sidbar: cliSidebar
title: "describe | Cloud"
slug: /cli/cli/Job-describe
sidebar_label: "describe"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets the status of an async job (backup, restore, migration, import, etc.). | Cloud"
type: docx
token: DKW5dWKqcoDIaHxD5dycfhzTnbd
sidebar_position: 1
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# describe

This operation gets the status of an async job (backup, restore, migration, import, etc.).

## Synopsis

```bash
zilliz job describe
--job-id <value>
[--wait]
[--timeout <value>]
[--interval <value>]
[--output <value>]
```

## Options

- **--job-id** (*string*) -

    **[REQUIRED]**

    Indicates a Job ID. For example, `job-xxxxxxxxxxxxxxxxxxxx`.

- **--wait** (*boolean*) -

    Indicates whether to wait until the job reaches a termination state.

- **--timeout** (*integer*) -

    Indicates the maximum number of seconds to wait. The value defaults to `1800`.

- **--interval** (*integer*) -

    Indicates the polling interval in seconds. The value defaults to 5, indicating that Zilliz Cloud retrieves the status of the specified job every 5 seconds.

- **--output, -o** (*string*) -

    Indicates the output format. Choices: `json`, `table`, `text`, `yaml`, `csv`.

## Example

```bash
zilliz job describe --job-id job-xxxxxx
```
