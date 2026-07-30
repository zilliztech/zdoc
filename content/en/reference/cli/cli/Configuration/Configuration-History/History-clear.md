---
title: "clear | Cloud"
slug: /cli/cli/History-clear
sidebar_label: "clear"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation truncates the local command history file. The script holds an exclusive lock during the truncate-then-remove sequence so concurrent CLI invocations cannot lose appended records. | Cloud"
type: docx
token: I7fKd8mPNoKYEAxmKpxcgaH8nsb
sidebar_position: 1
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - clear
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# clear

This operation truncates the local command history file. The script holds an exclusive lock during the truncate-then-remove sequence so concurrent CLI invocations cannot lose appended records.

## Synopsis\{#synopsis}

```bash
zilliz history clear
[--force]
```

## Options\{#options}

- **--force** (*boolean*) -

    Skips the interactive `[y/N]` confirmation prompt. Required for non-interactive scripts.

## Example\{#example}

```bash
# Interactive (asks for confirmation)
zilliz history clear

# Non-interactive
zilliz history clear --force
```
