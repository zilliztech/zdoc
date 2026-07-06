---
title: "add-regions | Cloud"
slug: /cli/cli/Project-addregions
sidebar_label: "add-regions"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation binds additional regions to an existing project. | Cloud"
type: docx
token: JP80dUdphoM5N9xsTFTccZeRnhp
sidebar_position: 5
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - add-regions
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# add-regions

This operation binds additional regions to an existing project.

## Description\{#description}

Binds additional regions to an existing Zilliz Cloud project. Repeat `--region` to add multiple regions in one command.

## Synopsis\{#synopsis}

```bash
zilliz project add-regions
--project-id <value>
--region <value>
[--api-key <value>]
```

## Options\{#options}

- **--project-id** (*string*) -

    Specifies the project ID to bind additional regions to.

- **--region** (*array*) -

    **[REQUIRED]**

    Region IDs to add (repeatable, e.g. **--region aws-us-east-1 --region gcp-us-west1**).

- **--api-key** (*string*) -

    Specifies an API key for this command. This value overrides the environment or configured API key.

## Example\{#example}

```bash
zilliz project add-regions --project-id proj-xxxx --region aws-us-east-1
zilliz project add-regions --project-id proj-xxxx --region aws-us-east-1 --region gcp-us-west1
```
