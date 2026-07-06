---
title: "add-whitelist | Cloud"
slug: /cli/cli/PrivateLink-addwhitelist
sidebar_label: "add-whitelist"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds region to PrivateLink endpoint whitelist. | Cloud"
type: docx
token: Tz35d2fXsogFeWxJblIcS7n2nYc
sidebar_position: 1
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - add-whitelist
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# add-whitelist

This operation adds region to PrivateLink endpoint whitelist.

## Usage\{#usage}

```bash
zilliz privatelink add-whitelist [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    **[REQUIRED]**

    Project ID.

- **--region-id** (*string*) -

    **[REQUIRED]**

    Cloud region to whitelist.

## Example\{#example}

```bash
zilliz privatelink add-whitelist --project-id proj-xxxx --region-id aws-us-east-1
```
