---
title: "delete | Cloud"
slug: /cli/cli/OnDemandCluster-delete
sidebar_key: cli/OnDemandCluster-delete
sidebar_label: "delete"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation deletes an on-demand cluster. | Cloud"
type: docx
token: HPKQd2dsfoBpcBx84yXc5IhenrM
sidebar_position: 2
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# delete

This operation deletes an on-demand cluster.

## Usage\{#usage}

```bash
zilliz on-demand-cluster delete [OPTIONS]
```

**OPTIONS:**

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    On-demand cluster ID to delete.

## Example\{#example}

```bash
zilliz on-demand-cluster delete --cluster-id in-xxxxxxxxxxxx
```
