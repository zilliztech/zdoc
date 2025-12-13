---
title: "Required GCP API Services | BYOC"
slug: /required-api-services-gcp
sidebar_label: "Required GCP API Services"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page lists the Google Cloud Platform (GCP) API services required to create GCP resources using the Zilliz Cloud Terraform Provider and provides several ways to enable them. | BYOC"
type: origin
token: WOQHwAlG0ibUgQkM18PcArMWnOc
sidebar_position: 6
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF

---

import Admonition from '@theme/Admonition';


# Required GCP API Services

This page lists the Google Cloud Platform (GCP) API services required to create GCP resources using the Zilliz Cloud Terraform Provider and provides several ways to enable them.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## Required API services\{#required-api-services}

<table>
   <tr>
     <th><p>API Services</p></th>
     <th><p>Purpose</p></th>
   </tr>
   <tr>
     <td><p><a href="http://compute.googleapis.com">compute.googleapis.com</a></p></td>
     <td><p>VPC, subnets, and networking resources</p></td>
   </tr>
   <tr>
     <td><p><a href="http://container.googleapis.com">container.googleapis.com</a></p></td>
     <td><p>GKE cluster management</p></td>
   </tr>
   <tr>
     <td><p><a href="http://storage.googleapis.com">storage.googleapis.com</a></p></td>
     <td><p>GCS bucket operations</p></td>
   </tr>
   <tr>
     <td><p><a href="http://iam.googleapis.com">iam.googleapis.com</a></p></td>
     <td><p>Service accounts and IAM roles</p></td>
   </tr>
   <tr>
     <td><p><a href="http://servicenetworking.googleapis.com">servicenetworking.googleapis.com</a></p></td>
     <td><p>Private Service Connect and VPC peering</p></td>
   </tr>
   <tr>
     <td><p><a href="http://cloudresourcemanager.googleapis.com">cloudresourcemanager.googleapis.com</a></p></td>
     <td><p>Project-level permissions and IAM</p></td>
   </tr>
</table>

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

<ul>
<li><p>Before running the above command, ensure you have sufficient permissions to enable these services. Otherwise, ask a security admin in your GCP project first.</p></li>
<li><p>You must replace <code>PROJECT_ID</code> in the above command with your GCP project ID.</p></li>
</ul>

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

<p>You must replace <code>PROJECT_ID</code> in the above command with your GCP project ID.</p>

</Admonition>

