---
title: "version | Cloud"
slug: /cli/cli/Global-version
sidebar_label: "version"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "This operation shows the version of the installed Zilliz CLI. | Cloud"
type: docx
token: MzJHdc3iSoGlKsx4D6TcoY5anOf
sidebar_position: 1
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - version
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# version

This operation shows the version of the installed Zilliz CLI.

## Description\{#description}

Shows the installed Zilliz CLI version. The example also shows how to request JSON output with the global output option.

## Synopsis\{#synopsis}

```bash
zilliz version
```

## Options\{#options}

This command has no command-specific options.

## Example\{#example}

```bash
zilliz version

# Example output
# zilliz 1.4.2

# The output format is a global CLI option. To get JSON output:
zilliz version -o json

# Example output
# {
#   "version": "1.4.2"
# }

# If a newer CLI is available, upgrade guidance is written to stderr:
# Tips: A new version of zilliz (1.4.2) is available. Run `zilliz upgrade` to update.
```

## Shell completion\{#shell-completion}

Shell completion is configured automatically on first run and again after each upgrade. The CLI detects installed shells such as Bash, Zsh, Fish, Elvish, and PowerShell, registers completion for both `zilliz` and `zz`, and migrates setups created by the removed `completion install` command.