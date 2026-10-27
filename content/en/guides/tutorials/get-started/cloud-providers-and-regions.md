---
title: "Cloud Providers & Regions | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "Cloud Providers & Regions"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud is available on AWS, Google Cloud, and Microsoft Azure. Use this page to find a region and check whether it supports your deployment option and required features. | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Cloud Providers & Regions

Zilliz Cloud is available on AWS, Google Cloud, and Microsoft Azure. Use this page to find a region and check whether it supports your deployment option and required features.

## Choose a cloud region\{#choose-a-cloud-region}

When choosing a region, consider the following:

- **Data residency:** Choose a region that meets your data residency and compliance requirements.

- **Application location:** Place your cluster close to the application services that access it to reduce network latency.

- **Availability:** Check that your deployment option and required features are available in the region.

- **Data transfer:** Consider the latency and costs of transferring data across regions or cloud providers.

## Supported regions\{#supported-regions}

The following tables list the supported regions for each cloud provider. Under Zilliz-Managed Cloud, availability is shown separately for always-on compute ([serving clusters](./manage-cluster)) and [on-demand compute](./on-demand-cluster). BYOC availability is listed separately. A check mark (✅) indicates availability in that region.

<Admonition type="info" title="Note">

If your required region is not listed, [submit a region request](https://zilliz.com/all-regions#region-request). 

To deploy Zilliz Cloud in your own cloud environment (BYOC), [contact sales](https://zilliz.com/contact-sales).

</Admonition>

### AWS\{#aws}

<CloudRegions provider="aws" />

### Google Cloud\{#google-cloud}

<CloudRegions provider="gcp" />

### Microsoft Azure\{#microsoft-azure}

<CloudRegions provider="azure" />

## Feature availability by region\{#feature-availability-by-region}

<CloudFeatures matrix="features" />

<Admonition type="info" title="Note">

Regional availability does not guarantee availability for every deployment option or project plan. See each feature’s documentation for configuration and version requirements, and [Deployment and Plan Comparison](./select-zilliz-cloud-service-plans) for plan availability.

</Admonition>

