---
title: "list-services | Cloud"
slug: /cli/cli/PrivateLink-listservices
sidebar_label: "list-services"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists available PrivateLink endpoint services. | Cloud"
type: docx
token: WIbvdNJNIoOG3Rx4gfncUuD4nBd
sidebar_position: 5
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - list-services
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list-services

This operation lists available PrivateLink endpoint services.

## Usage\{#usage}

```bash
zilliz privatelink list-services [OPTIONS]
```

**OPTIONS:**

- **--region-id** (*string*) -

    Filter by cloud region.

## Example\{#example}

```bash
zilliz privatelink list-services
zilliz privatelink list-services --region-id aws-us-east-1
```
