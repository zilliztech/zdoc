---
title: "apply | Cloud"
slug: /cli/cli/Volume-apply
sidebar_key: cli/Volume-apply
sidebar_label: "apply"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation applys (attach) a volume to a project. | Cloud"
type: docx
token: VJ8cdV2uuoYAuMxrJAjcMmRknke
sidebar_position: 4
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - apply
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# apply

This operation applys (attach) a volume to a project.

## Usage\{#usage}

```bash
zilliz volume apply [OPTIONS]
```

**OPTIONS:**

- **--name** (*string*) -

    **[REQUIRED]**

    Volume name.

- **--project-id** (*string*) -

    Project ID to attach the volume to.

## Example\{#example}

```bash
zilliz volume apply --name my-volume --project-id proj-xxxx
```
