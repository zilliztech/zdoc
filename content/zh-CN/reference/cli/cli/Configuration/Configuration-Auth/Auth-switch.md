---
displayed_sidbar: cliSidebar
title: "switch | Cloud"
slug: /cli/cli/Auth-switch
sidebar_label: "switch"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation switches to a different organization. | Cloud"
type: docx
token: EQcvdvxQWoicwnxrGGpcThwYnKd
sidebar_position: 4
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - switch
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# switch

This operation switches to a different organization.

## Synopsis

```bash
zilliz auth switch <ORG_ID>
```

## Options

- **ORG_ID** (*string*) -

    Indicates the ID of the organization displayed in the `zilliz status` result after this operation. A choice will be displayed if this is not specified.

    If this option is left unspecified, an interactive selection list is displayed for you to choose from.

## Example

```bash
zilliz auth switch
```
