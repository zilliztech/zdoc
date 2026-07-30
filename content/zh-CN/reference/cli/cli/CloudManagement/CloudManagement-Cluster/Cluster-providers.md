---
displayed_sidbar: cliSidebar
title: "providers | Cloud"
slug: /cli/cli/Cluster-providers
sidebar_label: "providers"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists all applicable cloud providers. | Cloud"
type: docx
token: Dd7HdLhKaoNhFSxVzGZcfit9nzf
sidebar_position: 7
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - providers
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# providers

This operation lists all applicable cloud providers.

## Synopsis

```bash
zilliz cluster providers
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

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
zilliz cluster providers
```
