---
title: "delete | Cloud"
slug: /cli/cli/Volume-delete
sidebar_label: "delete"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes a volume. | Cloud"
type: docx
token: CgVKdrm2YoAiM8xBvFacmxpWnrb
sidebar_position: 2
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
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

This operation deletes a volume.

## Synopsis\{#synopsis}

```bash
zilliz volume delete
--name <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the name of the volume to delete.

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
zilliz volume delete --name my-volume
```
