---
displayed_sidbar: cliSidebar
title: "regions | Cloud"
slug: /cli/cli/Cluster-regions
sidebar_label: "regions"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all available regions for a cloud provider. | Cloud"
type: docx
token: IsRxdCpeEo3RmOxiY0jcCYLhnde
sidebar_position: 8
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - regions
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# regions

This operation lists all available regions for a cloud provider.

## Synopsis

```bash
zilliz cluster regions
--cloud-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

**OPTIONS:**

- **--cloud-id** (*string*) -

    Indicates a cloud provider. Possible values are: `aws`, `gcp`, and `azure`.

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
# List all regions
zilliz cluster regions

# List AWS regions only
zilliz cluster regions --cloud-id aws
```
