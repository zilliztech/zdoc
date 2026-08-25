---
title: "Create On-Demand Cluster | BYOC"
slug: /on-demand-cluster
sidebar_label: "Create Cluster"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "An on-demand cluster provides compute resources for on-demand search and query workloads. It spins up when requests arrive and scales back to zero when idle, so it is a good fit for batch search, validation, exploration, and workloads that do not require always-on serving. | BYOC"
type: origin
token: RoxawNJhki1vXXkFsEEc7laMnxe
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Create On-Demand Cluster

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only with the Enterprise plan or higher.

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is currently available only in AWS us-west-2 and Azure East US regions. To use on-demand clusters in other regions, [contact us](http://zilliz.com/contact-sales).

</FeatureNote>

An on-demand cluster provides compute resources for on-demand search and query workloads. It spins up when requests arrive and scales back to zero when idle, so it is a good fit for batch search, validation, exploration, and workloads that do not require always-on serving.

## Prerequisites\{#prerequisites}

Before you create an on-demand cluster, ensure that:

- You are a **Project Admin** in the target project. For details about the roles and permissions, see [Manage Platform Roles](./manage-platform-roles#predefined-project-roles).

- You have the project ID where the on-demand cluster will be created.

- You have an API key with permission to manage resources in the project.

- The project is in the same region as the on-demand cluster. Currently, the supported region is `aws-us-west-2`.

## Limitations\{#limitations}

| Limit | Description |
| --- | --- |
| Project type | On-demand clusters are available only to Enterprise projects. |
| Region | Currently, on-demand clusters can be created only in AWS us-west-2. |
| Permission | To manage an on-demand cluster, you need to be a Project Admin. |
| Cluster count | Each project can have up to 20 on-demand clusters. |
| Data volume | An on-demand cluster can query up to 3 TB of raw data for every 8 CUs. Queries that exceed this limit return an error. |

## Create an on-demand cluster\{#create-an-on-demand-cluster}

You can create an on-demand cluster from the Zilliz Cloud console or by calling the RESTful API.

### Via RESTful API\{#via-restful-api}

The following example creates an on-demand cluster. For details, see [Create On-Demand Cluster](https://docs-test.cloud-uat3.zilliz.com/reference/restful/create-on-demand-cluster-v2).

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/createOnDemandCluster" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "clusterName": "my-on-demand",
    "cuSize": 8,
    "autoSuspend": 60,
    "description": "A cluster for vector search workloads."
}'
```

The following table explains the parameters.

| Parameter | Description |
| --- | --- |
| `projectId` | ID of the project where the on-demand cluster will be created. |
| `regionId` | Region where the on-demand cluster is deployed. The region must match the project's region. Currently, use `aws-us-west-2`. |
| `clusterName` | Name of the on-demand cluster to create. |
| `cuSize` | Number of query CUs to allocate. The cluster automatically scales between zero and this value based on workload. The minimum is 8 CUs, the maximum is 256 CUs, and values increase in increments of 8. This value is fixed after creation and cannot be changed. |
| `autoSuspend` | Idle timeout, in seconds, before the cluster auto-suspends. When no requests are received within this period, the cluster suspends to stop incurring compute costs. The minimum value is 60 seconds, and the default is 60 seconds. |
| `description`(optional) | Description of the on-demand cluster to create, up to 255 characters. |

The following is an example output.

```json
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully submitted. The on-demand cluster is being created. Use the Describe On-Demand Cluster API to check its creation progress and status. Once the cluster status is RUNNING, use your API key to access the on-demand cluster."
    }
}
```

### Via web console\{#via-web-console}

<Supademo id="cmo9gv84436szl2dy975hyhsh" title=""  />

<Procedures>

1. In the Zilliz Cloud console, open the target project.

1. Go to **On-Demand Compute > Clusters**.

1. Click **+ Cluster**.

1. Configure the cluster settings.

    | Parameter | Description |
    | --- | --- |
    | Cluster Name | Name of the on-demand cluster to create. |
    | Cluster Description | Description of the on-demand cluster to create, up to 255 characters. |
    | Query CU | Number of query CUs to allocate. The cluster automatically scales between zero and this value. The minimum is 8 CUs, the maximum is 256 CUs, and values increase in increments of 8. This value is fixed after creation and cannot be changed. |
    | Auto suspend | Idle time, in seconds, before the cluster auto-suspends. The default is 1 minute. |

1. Click **Create**.

</Procedures>

## Next steps\{#next-steps}

After the cluster is created, use the cluster ID when connecting to a project endpoint for on-demand search. For details, see [Connect for On-Demand Search](./connect-for-on-demand-search).

To list, inspect, or drop on-demand clusters, see [Manage On-Demand Cluster](./manage-on-demand-clusters).