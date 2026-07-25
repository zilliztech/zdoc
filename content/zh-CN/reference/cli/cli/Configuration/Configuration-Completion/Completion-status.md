---
displayed_sidbar: cliSidebar
title: "status | Cloud"
slug: /cli/cli/Completion-status
sidebar_label: "status"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation checks if shell completion is installed. | Cloud"
type: docx
token: MJsndwyMdo5CGLxqAXwc9MuKn7e
sidebar_position: 3
keywords: 
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - zilliz
  - zilliz cloud
  - cloud
  - status
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# status

This operation checks if shell completion is installed.

## Synopsis

```bash
zilliz completion status <SHELL>
```

## Options

- **SHELL** (*string*) -

    Indicates the name of the target shell. The current shell applies if this is not specified. Possible values:

    - `bash`,

    - `zsh`,

    - `fish`.

## Example

```bash
zilliz completion status
```
