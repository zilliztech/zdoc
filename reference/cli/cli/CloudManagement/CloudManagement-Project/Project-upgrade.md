---
title: "upgrade | Cloud"
slug: /cli/cli/Project-upgrade
sidebar_label: "upgrade"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation upgrades a project's subscription plan. | Cloud"
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

This operation upgrades a project's subscription plan.

## Synopsis\{#synopsis}

```bash
zilliz project upgrade [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    **[REQUIRED]**

    Indicates a project ID, which is similar to `proj-xxxxx`.

- **--plan** (*string*) -

    Indicates a target subscription plan. Possible values: <include lang="en-US">`Serverless`, `Standard`, </include>`Enterprise`.

## Example\{#example}

```bash
zilliz project upgrade --project-id proj-xxxxxxxxxxxx --plan Enterprise
```
