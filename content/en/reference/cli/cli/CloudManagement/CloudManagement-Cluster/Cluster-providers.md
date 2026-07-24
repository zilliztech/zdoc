---
title: "providers | Cloud"
slug: /cli/cli/Cluster-providers
sidebar_label: "providers"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all applicable cloud providers. | Cloud"
type: docx
token: Rhked7rPvopHixxQZe6czSUwnvf
sidebar_position: 7
keywords: 
  - knn
  - Image Search
  - LLMs
  - Machine Learning
  - zilliz
  - zilliz cloud
  - cloud
  - providers
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# providers

This operation lists all applicable cloud providers.

## Synopsis\{#synopsis}

```bash
zilliz cluster providers
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

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
zilliz cluster providers
```
