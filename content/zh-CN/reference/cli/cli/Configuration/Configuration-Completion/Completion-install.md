---
displayed_sidbar: cliSidebar
title: "install | Cloud"
slug: /cli/cli/Completion-install
sidebar_label: "install"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation installs shell completion. | Cloud"
type: docx
token: N0WHdp8BVoNlmmxa7wvclA8Knfg
sidebar_position: 1
keywords: 
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search
  - zilliz
  - zilliz cloud
  - cloud
  - install
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# install

This operation installs shell completion. 

<Admonition type="info" icon="📘" title="Notes">

<p>You need to manually run the <code>source</code> command after the install completes. </p>
<p>For example, if you install the complete command in zsh, you should run <code>source ~/.zshrc</code> to activate command completion.</p>

</Admonition>

## Synopsis

```bash
zilliz completion install <SHELL>
[--apply]
```

## Options

- **SHELL** (*string*) -

    Indicates the target shell for the installation. The current shell applies if this is not specified. Possible values:

    - `bash`,

    - `zsh`,

    - `fish`.

- **--apply** (*boolean*) -

    Indicates whether to write to the rc file of the specified shell automatically.

## Example

```bash
# Manual copy the comand and paste it into your rc file
zilliz completion install

# Automatically append the command to your rc file
zilliz completion install --apply

# activate the settings
source ~/.<*>rc
```
