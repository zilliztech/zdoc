---
title: "search | Cloud"
slug: /cli/cli/History-search
sidebar_key: cli/History-search
sidebar_label: "search"
added_since: v1.0.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation filters command history to entries whose command line contains the given keyword (case-insensitive substring match), ordered newest first. | Cloud"
type: docx
token: FVmwd1ishoRaqUxQQNNch019nOf
sidebar_position: 3
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - search
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# search

This operation filters command history to entries whose command line contains the given keyword (case-insensitive substring match), ordered newest first.

## Synopsis\{#synopsis}

```bash
zilliz history search
--keyword <string>
```

## Options\{#options}

- **--keyword** (*string*) -

    **[REQUIRED]**

    Specifies the search term. Case-insensitive substring match against the recorded command line.

## Example\{#example}

```bash
# Find every recorded \`cluster create\` invocation
zilliz history search --keyword "cluster create"

# Find any command that mentioned a specific cluster ID
zilliz history search --keyword inxx-1234567890ab
```
