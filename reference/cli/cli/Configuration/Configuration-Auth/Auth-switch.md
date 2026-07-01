---
title: "switch | Cloud"
slug: /cli/cli/Auth-switch
sidebar_key: cli/Auth-switch
sidebar_label: "switch"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation switches to a different organization. | Cloud"
type: docx
token: WVn4dXc9FocqhRxmuwlcFcTynBg
sidebar_position: 4
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - switch
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# switch

This operation switches to a different organization.

**Note:** `zilliz auth switch` is a deprecated alias kept for backwards compatibility. Use the top-level `zilliz switch` command in new scripts.

## Synopsis\{#synopsis}

```bash
zilliz auth switch <ORG_ID>
```

## Options\{#options}

- **ORG_ID** (*string*) -

    Indicates the ID of the organization displayed in the `zilliz status` result after this operation. A choice will be displayed if this is not specified.

    If this option is left unspecified, an interactive selection list is displayed for you to choose from.

## Example\{#example}

```bash
zilliz auth switch
```
