---
title: "generate-auth-materials | Cloud"
slug: /cli/cli/StorageIntegration-generateauthmaterials
sidebar_label: "generate-auth-materials"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation generates authorization materials for a storage integration. Use it to obtain the cloud-side credential material required before finalizing external storage access. | Cloud"
type: docx
token: Wa4Bd7HvNont3WxgFNxcteFqn6g
sidebar_position: 4
keywords: 
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database
  - zilliz
  - zilliz cloud
  - cloud
  - generate-auth-materials
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# generate-auth-materials

This operation generates authorization materials for a storage integration. Use it to obtain the cloud-side credential material required before finalizing external storage access.

## Synopsis\{#synopsis}

```bash
zilliz storage-integration generate-auth-materials --bucket-name <string> [OPTIONS]
```

**OPTIONS:**

- **--bucket-name** (*string*) -

    **[REQUIRED]**

    Specifies the external bucket or container name.

- **--project-id** (*string*) -

    Specifies the project ID.

- **--region-id** (*string*) -

    Specifies the cloud region, such as `aws-us-east-1`.

- **--body** (*path*) -

    Specifies a JSON body file, such as `file://authorization-materials.json`.

## Example\{#example}

```bash
zilliz storage-integration generate-auth-materials --bucket-name my-bucket --region-id aws-us-east-1
```
