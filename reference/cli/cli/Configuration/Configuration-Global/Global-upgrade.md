---
title: "upgrade | Cloud"
slug: /cli/cli/Global-upgrade
sidebar_key: cli/Global-upgrade
sidebar_label: "upgrade"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation self-updates the CLI by checking the latest GitHub release and delegating to the official installer script for the host platform. | Cloud"
type: docx
token: ZCnedaDvloSUhwxvycSc4gwhnbf
sidebar_position: 3
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - upgrade
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# upgrade

This operation self-updates the CLI by checking the latest GitHub release and delegating to the official installer script for the host platform.

## Description\{#description}

Checks for the latest Zilliz CLI release and runs the official installer when an upgrade is available. Use `--check` to inspect availability without installing.

## Synopsis\{#synopsis}

```bash
zilliz upgrade
[--check]
[--yes]
[--force]
```

## Options\{#options}

- **--check** (*boolean*) -

    Report only whether a newer version is available. Does not run the installer.

- **--yes** (*boolean*) -

    Skip the confirmation prompt.

- **--force** (*boolean*) -

    Re-run the installer even when already on the latest version.

## Example\{#example}

```bash
# Check for updates without installing
zilliz upgrade --check

# Upgrade with confirmation prompt
zilliz upgrade

# Upgrade without prompt
zilliz upgrade --yes

# Force re-install
zilliz upgrade --force --yes
```
