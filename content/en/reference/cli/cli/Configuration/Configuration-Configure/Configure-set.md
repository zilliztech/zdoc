---
title: "set | Cloud"
slug: /cli/cli/Configure-set
sidebar_label: "set"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation sets a configuration value. | Cloud"
type: docx
token: Jp9VdKpVoooz9ix1vYMcAun4nwe
sidebar_position: 4
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - set
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# set

This operation sets a configuration value.

<Admonition type="info" icon="📘" title="Notes">

You can also run `zilliz configure` instead, and follow the interactive guidance. Setting `api_key` can be used as an alternative to `zilliz login`.

</Admonition>

## Usage\{#usage}

```bash
zilliz configure set <KEY> <VALUE>
```

**OPTIONS:**

- **KEY** (*string*) -

    **[REQUIRED]**

    Indicates the name of a configuration item. Currently, only `api_key` is applicable.

- **VALUE** (*string*) -

    Indicates the value of the configuration item.

## Example\{#example}

```bash
# set api key
zilliz configure set api_key <YOUR_API_KEY>
```
