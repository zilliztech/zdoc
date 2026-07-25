---
displayed_sidbar: cliSidebar
title: "describe | Cloud"
slug: /cli/cli/Project-describe
sidebar_label: "describe"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation gets the details of a project. | Cloud"
type: docx
token: JHi7ddXcaoozIyxLplicI61mn1e
sidebar_position: 2
keywords: 
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# describe

This operation gets the details of a project.

## Synopsis

```bash
zilliz project describe
--project-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options

- **--project-id** (*string*) -

    **[REQUIRED]**

    Indicates a project ID, which is similar to `proj-xxxxx`.

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
zilliz project describe --project-id proj-xxxxxxxxxxxx
```
