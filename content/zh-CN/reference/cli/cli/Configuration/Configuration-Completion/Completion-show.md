---
displayed_sidbar: cliSidebar
title: "show | Cloud"
slug: /cli/cli/Completion-show
sidebar_label: "show"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation shows the completion script for manual installation. You can copy the command from the output and run it in your shell environment. | Cloud"
type: docx
token: URetdWlVeo3A6Ox5Z3JccMt3nGd
sidebar_position: 2
keywords: 
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - cloud
  - show
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# show

This operation shows the completion script for manual installation. You can copy the command from the output and run it in your shell environment.

## Synopsis

```bash
zilliz completion show <SHELL>
```

## Options

- **SHELL** (*string*) -

    **[REQUIRED]**

    Indicates the name of the shell you are using. Possible values:

    - `bash`,

    - `zsh`,

    - `fish`.

## Example

```bash
# check the completion command in .zshrc
zilliz completion show zsh
```

