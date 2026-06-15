---
title: "Required GCP API Services | BYOC"
slug: /required-api-services-gcp
sidebar_label: "Required GCP API Services"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page lists the Google Cloud Platform (GCP) API services required to create GCP resources using the Zilliz Cloud Terraform Provider and provides several ways to enable them. | BYOC"
type: origin
token: WOQHwAlG0ibUgQkM18PcArMWnOc
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Required GCP API Services

This page lists the Google Cloud Platform (GCP) API services required to create GCP resources using the Zilliz Cloud Terraform Provider and provides several ways to enable them.

<Admonition type="info" icon="📘" title="Notes">

Zilliz BYOC is currently available in **General Availability**. For access and implementation details, please contact [Zilliz Cloud sales](https://zilliz.com/contact-sales).

</Admonition>

## Required API services\{#required-api-services}

| API Services | Purpose |
| --- | --- |
| [compute.googleapis.com](http://compute.googleapis.com) | VPC, subnets, and networking resources |
| [container.googleapis.com](http://container.googleapis.com) | GKE cluster management |
| [storage.googleapis.com](http://storage.googleapis.com) | GCS bucket operations |
| [iam.googleapis.com](http://iam.googleapis.com) | Service accounts and IAM roles |
| [servicenetworking.googleapis.com](http://servicenetworking.googleapis.com) | Private Service Connect and VPC peering |
| [cloudresourcemanager.googleapis.com](http://cloudresourcemanager.googleapis.com) | Project-level permissions and IAM |

## Enable required API services\{#enable-required-api-services}

You can enable these API services on the GCP console or using the gcloud CLI by referring to [this document](https://cloud.google.com/endpoints/docs/openapi/enable-api#enabling_an_api) for detailed procedures. To enable the above-listed API services using the gcloud CLI, do as follows:

```shell
gcloud services enable \
  compute.googleapis.com \
  container.googleapis.com \
  storage.googleapis.com \
  iam.googleapis.com \
  servicenetworking.googleapis.com \
  cloudresourcemanager.googleapis.com \
  --project=PROJECT_ID
```

<Admonition type="info" icon="📘" title="Notes">

- Before running the above command, ensure you have sufficient permissions to enable these services. Otherwise, ask a security admin in your GCP project first.

- You must replace `PROJECT_ID` in the above command with your GCP project ID.

</Admonition>

## Verify the results\{#verify-the-results}

You can check whether the above-listed API services are enabled on the GCP console or using the gcloud CLI.

### On the GCP console\{#on-the-gcp-console}

1. Visit the [API & Services Dashboard](https://console.cloud.google.com/apis/dashboard).

1. Select your project.

1. Review enabled APIs in the library.

### Using the gcloud CLI\{#using-the-gcloud-cli}

```bash
gcloud services list --enabled --project=PROJECT_ID
```

<Admonition type="info" icon="📘" title="Notes">

You must replace `PROJECT_ID` in the above command with your GCP project ID.

</Admonition>

