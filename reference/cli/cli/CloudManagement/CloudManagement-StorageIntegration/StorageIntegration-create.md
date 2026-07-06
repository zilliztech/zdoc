---
title: "create | Cloud"
slug: /cli/cli/StorageIntegration-create
sidebar_label: "create"
beta: false
added_since: v1.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an external storage integration. Use it to register bucket credentials for AWS, Azure, or GCP so Zilliz Cloud can access external data sources. | Cloud"
type: docx
token: YCXuddx10oBOujxOcLscTAg0nKc
sidebar_position: 1
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

This operation creates an external storage integration. Use it to register bucket credentials for AWS, Azure, or GCP so Zilliz Cloud can access external data sources.

## Synopsis\{#synopsis}

```bash
zilliz storage-integration create --name <string> --bucket-name <string> [OPTIONS]
```

**OPTIONS:**

- **--name** (*string*) -

    **[REQUIRED]**

    Specifies the storage integration name.

- **--bucket-name** (*string*) -

    **[REQUIRED]**

    Specifies the external bucket or container name.

- **--project-id** (*string*) -

    Specifies the owning project ID.

- **--description** (*string*) -

    Specifies a human-readable description for the integration.

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
# AWS

zilliz storage-integration create --name s3-int --bucket-name my-bucket --region-id aws-us-east-1 --role-arn arn:aws:iam::123456789012:role/my-role --external-id ext-1

# Azure

zilliz storage-integration create --name az-int --bucket-name my-container --region-id azure-eastus --account-name myacct --client-id <client> --tenant-id <tenant>

# GCP

zilliz storage-integration create --name gcs-int --bucket-name my-bucket --region-id gcp-us-central1 --gcp-project-id my-proj --service-account-email sa@my-proj.iam.gserviceaccount.com

# Raw body escape hatch

zilliz storage-integration create --body file://integration.json
```
