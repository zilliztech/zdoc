---
title: "login | Cloud"
slug: /cli/cli/Auth-login
sidebar_label: "login"
beta: false
added_since: v0.1.x
last_modified: v1.4.x
deprecate_since: false
notebook: false
description: "This operation authenticates the CLI with Zilliz Cloud and saves the login state for later commands. Use browser login for interactive local use, API-key login for scripts or headless environments, and `--cn` with `--api-key` when logging in to the Zilliz Cloud China site. | Cloud"
type: docx
token: GaWqdekPvokCUtxBjRTcpNxInXg
sidebar_position: 1
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - login
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# login

This operation authenticates the CLI with Zilliz Cloud and saves the login state for later commands. Use browser login for interactive local use, API-key login for scripts or headless environments, and `--cn` with `--api-key` when logging in to the Zilliz Cloud China site.

## Description\{#description}

Authenticates the CLI with Zilliz Cloud and saves the login state for later commands. Use browser login for interactive local use and API-key login for scripts or headless environments.

## Synopsis\{#synopsis}

```bash
zilliz login
[--api-key <value>]
[--no-browser]
[--cn]
```

## Options\{#options}

- **--api-key** (*string*) -

    Authenticates with an API key instead of browser OAuth. If provided without a value, prompts interactively.

- **--no-browser** (*boolean*) -

    Uses the device-code flow without opening a browser.

- **--cn** (*boolean*) -

    Authenticates to the Zilliz Cloud China site. The China site uses API-key login, so combine `--cn` with `--api-key`.

## Example\{#example}

```bash
# Browser OAuth login
zilliz login

# Login with API key
zilliz login --api-key sk-xxxxxxxxxxxx

# Login to the Zilliz Cloud China site
zilliz login --cn --api-key sk-xxxxxxxxxxxx
```
