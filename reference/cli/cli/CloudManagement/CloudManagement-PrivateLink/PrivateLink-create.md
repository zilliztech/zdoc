---
title: "create | Cloud"
slug: /cli/cli/PrivateLink-create
sidebar_key: cli/PrivateLink-create
sidebar_label: "create"
added_since: v1.4.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a PrivateLink endpoint. | Cloud"
type: docx
token: GBdVd6bJ1o6VhRxgHxLcsFsVn2b
sidebar_position: 2
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates a PrivateLink endpoint.

## Usage\{#usage}

```bash
zilliz privatelink create [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    **[REQUIRED]**

    Project ID.

- **--region-id** (*string*) -

    **[REQUIRED]**

    Cloud region.

- **--endpoint-id** (*string*) -

    **[REQUIRED]**

    VPC endpoint ID (e.g. vpce-xxxx).

- **--gcp-project-id** (*string*) -

    GCP project ID (GCP only).

## Example\{#example}

```bash
zilliz privatelink create --project-id proj-xxxx --region-id aws-us-east-1 --endpoint-id vpce-xxxx
```
