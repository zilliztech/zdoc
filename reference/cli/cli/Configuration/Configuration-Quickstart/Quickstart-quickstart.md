---
title: "quickstart | Cloud"
slug: /cli/cli/Quickstart-quickstart
sidebar_label: "quickstart"
beta: false
added_since: v1.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation walks first-time users through sign-in, organization selection, cluster context, and a short menu of common operations (list clusters, set context, list collections, view billing). When stdout is not a TTY or `--non-interactive` is set, only the cheatsheet is printed. | Cloud"
type: docx
token: Aio6dbDToo45XdxkSX1cp9tKnkl
sidebar_position: 1
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - quickstart
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# quickstart

This operation walks first-time users through sign-in, organization selection, cluster context, and a short menu of common operations (list clusters, set context, list collections, view billing). When stdout is not a TTY or `--non-interactive` is set, only the cheatsheet is printed.

## Synopsis\{#synopsis}

```bash
zilliz quickstart
[--non-interactive]
[--skip-login]
```

## Options\{#options}

- **--non-interactive** (*boolean*) -

    Skips all prompts and prints only the cheatsheet. Useful for CI or for scripting an environment-bootstrap step.

- **--skip-login** (*boolean*) -

    Skips the auth bootstrap step. Use when credentials are already configured (for example, via `zilliz login` or an environment-provided API key).

## Example\{#example}

```bash
# Interactive guided onboarding
zilliz quickstart

# Print the cheatsheet only
zilliz quickstart --non-interactive
```
