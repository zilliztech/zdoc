---
title: "delete | Cloud"
slug: /cli/cli/PrivateLink-delete
sidebar_label: "delete"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes a PrivateLink endpoint. | Cloud"
type: docx
token: JYr4dveljoLs84xSAXJclFSkn8d
sidebar_position: 3
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - delete
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# delete

This operation deletes a PrivateLink endpoint.

## Usage\{#usage}

```bash
zilliz privatelink delete [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    **[REQUIRED]**

    Project ID.

- **--endpoint-id** (*string*) -

    **[REQUIRED]**

    Endpoint ID to delete.

## Example\{#example}

```bash
zilliz privatelink delete --project-id proj-xxxx --endpoint-id vpce-xxxx
```
