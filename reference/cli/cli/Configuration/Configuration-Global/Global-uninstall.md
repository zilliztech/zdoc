---
title: "uninstall | Cloud"
slug: /cli/cli/Global-uninstall
sidebar_key: cli/Global-uninstall
sidebar_label: "uninstall"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation removes the CLI binary and the `zz` alias. | Cloud"
type: docx
token: LeH5d568MolZfhxAwoZcmjWTnGc
sidebar_position: 2
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - uninstall
  - cliv14
displayed_sidebar: cliSidebar

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
