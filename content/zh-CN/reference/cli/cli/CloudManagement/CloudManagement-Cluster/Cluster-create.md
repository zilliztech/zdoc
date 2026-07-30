---
displayed_sidbar: cliSidebar
title: "create | Cloud"
slug: /cli/cli/Cluster-create
sidebar_label: "create"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a new cluster. | Cloud"
type: docx
token: KNCGdB4VfolyidxJBWOcuUGin3c
sidebar_position: 1
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

This operation creates a new cluster.

## Description

Zilliz Cloud provides various cluster deployment options to accommodate the distinct business needs. 

- **Free**: provides a starting point for learning and personal projects with limitations on storage, vCU consumption, and the number of collections.

- **Serverless**: provides a shared environment that automatically scales to match your workload - no need to provision resources. This option delivers excellent cost efficiency and elasticity for unpredictable or spiky traffic.

- **Dedicated**: provides isolated, reserved environments for production workloads that demand consistent and predictable performance. This option is ideal for sustained high-throughput and latency-sensitive applications.

Regarding dedicated clusters, Zilliz Cloud offers the following cluster types: **Performance-optimized, Capacity-optimized**, and **Tiered-storage.**

### Performance-optimized cluster

- Tailored for scenarios emphasizing low latency and high throughput.

- Ideal for real-time applications like generative AI, recommendation systems, chatbots, and more.

### Capacity-optimized cluster

- Crafted for handling vast datasets, boasting five times the data capacity of its Performance-optimized counterpart, albeit with subdued search performance.

- Ideal for large-scale unstructured data search, copyright detection, and identity verification.

### Tiered-storage cluster

- Best for ultra-large-scale, cost-sensitive workloads with clear hot and cold data patterns.

- Ideal for applications that need to store massive volumes of data at a low cost. The capacity of a Tiered-storage cluster is 4 times that of a Capacity-optimized cluster.

Running this command without any options triggers a set of interactive prompts.

<Admonition type="info" icon="📘" title="Notes">

<p>Tiered-storage clusters are unavailable in BYOC projects.</p>

</Admonition>

## Synopsis

```bash
zilliz cluster create
--name <value>
--type <serverless | free | dedicated>
[--project-id <value>]
[--region <value>]
[--cu-type <Performance-optimized | Capacity-optimized | Tiered-storage>]
[--cu-size <value>]
[--plan <Free | Serverless | Standard | Enterprise>]
[--output <value>]
```

## Options

- **--name** (*string*) -

    **[REQUIRED]**

    Indicates the cluster display name. 

    The value is an alphanumeric string of no more than **255** characters that starts with a letter.

- **--type** (*string*) -

    **[REQUIRED]**

    Indicates the cluster type. 

    Possible values:

    - `serverless`,

    - `free`,  and

    - `dedicated`.

- **--project-id** (*string*) -

    Indicates the project to create the cluster in.

- **--region** (*string*) -

    Indicates a cloud region.

    Possible values:

    - `aws-us-east-1`

    - `aws-us-east-2`

    - `aws-us-west-2`

    - `aws-ca-central-1`

    - `aws-eu-central-1`

    - `aws-eu-west-1`

    - `aws-ap-northeast-1`

    - `aws-ap-southeast-1`

    - `aws-ap-southeast-2`

    - `gcp-us-west1`

    - `gcp-us-east4`

    - `gcp-us-central1`

    - `gcp-asia-southeast1`

    - `az-eastus`

    - `az-eastus2`

    - `az-centralus`

    - `az-germanywestcentral`

    - `az-northeurope`

    - `az-centralindia`

    <Admonition type="info" icon="📘" title="Notes">

    <p>For available regions in your BYOC project, consult with your organization owner.</p>

    </Admonition>

- **--cu-type** (*string*) -

    Indicates the compute unit type (dedicated only). 

    Possible Values: 

    - `Performance-optimized`,

    - `Capacity-optimized`,

    - `Tiered-storage`.

- **--cu-size** (*integer*) -

    Indicates the number of compute units (dedicated only).

    A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage. The concept of CU only applies to **Dedicated** clusters.

    - For a **Dedicated** cluster in a **Standard** project, the product of its CU size and the number of replicas must be less than or equal to 32.

    - For a **Dedicated** cluster in an **Enterprise** project, the product of its CU size and the number of replicas must be less than or equal to 1,024.

- **--plan** (*string*) -

    Indicates the subscription plan (dedicated only). 

    Possible values: 

    - `Free`,

    - `Serverless`,

    - `Standard`,

    - `Enterprise`.

- **--output, -o** (*string*) -

    Output format. 

    Possible values: 

    - `json`,

    - `table`,

    - `text`.

## Example

```bash
zilliz cluster create --name my-cluster \
--type serverless \
--region aws-us-west-2
```
