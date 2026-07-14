---
title: "upgrade | Cloud"
slug: /cli/cli/Project-upgrade
sidebar_label: "upgrade"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、プロジェクトのサブスクリプションプランをアップグレードします。 | Cloud"
type: docx
token: QIhWdtFpNotKksx7KmxcTdwXnEh
sidebar_position: 4
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - upgrade
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# upgrade

この操作は、プロジェクトのサブスクリプションプランをアップグレードします。

## Synopsis\{#synopsis}

```bash
zilliz project upgrade [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    **[REQUIRED]**

    `proj-xxxxx` に似たプロジェクト ID を示します。

- **--plan** (*string*) -

    対象のサブスクリプションプランを示します。指定可能な値: <include lang="en-US">`Serverless`, `Standard`, </include>`Enterprise`.

## Example\{#example}

```bash
zilliz project upgrade --project-id proj-xxxxxxxxxxxx --plan Enterprise
```
