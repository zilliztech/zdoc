---
displayed_sidbar: cliSidebar
title: "upgrade | Cloud"
slug: /cli/cli/Project-upgrade
sidebar_label: "upgrade"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation upgrades a project's subscription plan. | Cloud"
type: docx
token: LZksdPD7Ao7HdwxYr4Lc3IHlngg
sidebar_position: 4
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - upgrade
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# upgrade

This operation upgrades a project's subscription plan.

## Synopsis

```bash
zilliz project upgrade [OPTIONS]
```

**OPTIONS:**

- **--project-id** (*string*) -

    **[REQUIRED]**

    Indicates a project ID, which is similar to `proj-xxxxx`.

- **--plan** (*string*) -

    Indicates a target subscription plan. Possible values: <include lang="en-US">`Serverless`, `Standard`, </include>`Enterprise`.

## Example

```bash
zilliz project upgrade --project-id proj-xxxxxxxxxxxx --plan Enterprise
```
