---
title: "uninstall | Cloud"
slug: /cli/cli/Global-uninstall
sidebar_label: "uninstall"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation removes the CLI binary and the `zz` alias. | Cloud"
type: docx
token: LeH5d568MolZfhxAwoZcmjWTnGc
sidebar_position: 2
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - uninstall
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# uninstall

This operation removes the CLI binary and the `zz` alias.

## Description\{#description}

Removes the installed Zilliz CLI binary and the `zz` alias. Use `--purge` when you also want to delete the local Zilliz CLI configuration directory.

## Synopsis\{#synopsis}

```bash
zilliz uninstall
[--purge]
[--yes]
```

## Options\{#options}

- **--purge** (*boolean*) -

    Also remove `~/.zilliz/` (credentials, config).

- **--yes** (*boolean*) -

    Skip the confirmation prompt.

## Example\{#example}

```bash
# Uninstall with confirmation
zilliz uninstall

# You can also use the zz alias
zz uninstall

# Uninstall without confirmation
zilliz uninstall --yes

# Uninstall and remove all config
zilliz uninstall --purge --yes
```
