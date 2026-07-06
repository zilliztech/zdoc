---
title: "validate | Cloud"
slug: /cli/cli/StorageIntegration-validate
sidebar_label: "validate"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation validates an external storage integration configuration before or after creating the integration. | Cloud"
type: docx
token: UCq8dJomCoUqZixRiXsczdtqnfg
sidebar_position: 6
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - validate
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# validate

This operation validates an external storage integration configuration before or after creating the integration.

## Synopsis\{#synopsis}

```bash
zilliz storage-integration validate --bucket-name <string> [OPTIONS]
```

**OPTIONS:**

- **--bucket-name** (*string*) -

    **[REQUIRED]**

    Specifies the external bucket or container name to validate.

- **--project-id** (*string*) -

    Specifies the project ID.

- **--region-id** (*string*) -

    Specifies the cloud region, such as `aws-us-east-1`.

- **--role-arn** (*string*) -

    Specifies the AWS IAM role ARN.

- **--external-id** (*string*) -

    Specifies the AWS external ID. This value is redacted from local command history.

- **--account-name** (*string*) -

    Specifies the Azure storage account name.

- **--client-id** (*string*) -

    Specifies the Azure client ID.

- **--tenant-id** (*string*) -

    Specifies the Azure tenant ID.

- **--gcp-project-id** (*string*) -

    Specifies the GCP project ID.

- **--service-account-email** (*string*) -

    Specifies the GCP service account email.

- **--body** (*path*) -

    Specifies a JSON body file, such as `file://integration.json`, when the flat flags are not sufficient.

## Example\{#example}

```bash
zilliz storage-integration validate --bucket-name my-bucket --region-id aws-us-east-1 --role-arn arn:aws:iam::123456789012:role/my-role --external-id ext-1
```
