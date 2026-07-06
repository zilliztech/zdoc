---
title: "list | Cloud"
slug: /cli/cli/History-list
sidebar_label: "list"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists recent commands recorded in the local history log, ordered newest first. Each entry includes the timestamp, command line, command type, and success flag. | Cloud"
type: docx
token: JsXAdb04GodEnVxihb5csm28nze
sidebar_position: 2
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

This operation lists recent commands recorded in the local history log, ordered newest first. Each entry includes the timestamp, command line, command type, and success flag.

## Synopsis\{#synopsis}

```bash
zilliz history list
[--limit <integer>]
[--all]
```

## Options\{#options}

- **--limit** (*integer*) -

    Indicates the maximum number of entries to display. Default: 50. Ignored when `--all` is set.

- **--all** (*boolean*) -

    Shows every recorded entry instead of the most recent `--limit` entries.

## Example\{#example}

```bash
# Last 50 entries
zilliz history list

# Last 10 entries as JSON
zilliz history list --limit 10 -o json

# Full history
zilliz history list --all
```
