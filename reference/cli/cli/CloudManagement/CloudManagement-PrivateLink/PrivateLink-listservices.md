---
title: "list-services | Cloud"
slug: /cli/cli/PrivateLink-listservices
sidebar_key: cli/PrivateLink-listservices
sidebar_label: "list-services"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists available PrivateLink endpoint services. | Cloud"
type: docx
token: WIbvdNJNIoOG3Rx4gfncUuD4nBd
sidebar_position: 5
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - list-services
  - cliv14
displayed_sidebar: cliSidebar

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
