---
title: "Cluster | Cloud"
slug: /on-demand-cluster
sidebar_key: on-demand-cluster
sidebar_label: "Cluster"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "A cluster is a set of compute resources that runs your vector database workloads. Zilliz Cloud offers two types serving clusters, which run continuously for production workloads requiring always-on, low-latency access, and on-demand clusters, which spin up only when requests arrive and scale to zero when idle. | Cloud"
type: origin
token: XFoiwC15Jiu5LAkUeuVcvbconDR
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - on-demand compute
  - cluster

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# On-Demand Cluster

An on-demand cluster provides compute resources for on-demand search and query workloads. It spins up when requests arrive and scales back to zero when idle, so it is a good fit for batch search, validation, exploration, and workloads that do not require always-on serving.

## Prerequisites

Before you create an on-demand cluster, ensure that:

- You are a **Project Admin** in the target project. For details about the roles and permissions, see [Manage Project Users](./project-users).
- You have the project ID where the on-demand cluster will be created.
- You have an API key with permission to manage resources in the project.
- The project is in the same region as the on-demand cluster. Currently, the supported region is `aws-us-west-2` and `az-eastus`.

## Limitations

| Limit | Description |
| ----- | ----------- |
| Project type | On-demand clusters are available only to Enterprise projects. |
| Region | Currently, on-demand clusters can be created only in `aws-us-west-2` and `az-eastus`. |
| Permission | To manage an on-demand cluster, you need to be a Project Admin. |
| Cluster count | Each project can have up to 20 on-demand clusters. |
| Data volume | An on-demand cluster can query up to 3 TB of raw data for every 8 CUs. Queries that exceed this limit return an error. |

## Create an on-demand cluster

You can create an on-demand cluster from the Zilliz Cloud console or by calling the RESTful API.

### Via RESTful API\{#via-restful-api}

The following example creates an on-demand cluster. For details, refer to [Create On-Demand Cluster (V2)](/reference/restful/create-on-demand-cluster-v2).

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
| --------- | ----------- |
| `projectId` | ID of the project where the on-demand cluster will be created. |
| `regionId` | Region where the on-demand cluster is deployed. The region must match the project's region. Currently, use `aws-us-west-2` or `az-eastus`. |
| `clusterName` | Name of the on-demand cluster to create. |
| `cuSize` | Number of query CUs to allocate. The cluster automatically scales between zero and this value based on workload. The minimum is 8 CUs, the maximum is 256 CUs, and values increase in increments of 8. This value is fixed after creation and cannot be changed. |
| `autoSuspend` |Idle timeout, in seconds, before the cluster auto-suspends. When no requests are received within this period, the cluster suspends to stop incurring compute costs. The minimum value is 60 seconds, and the default is 60 seconds. |
| `description` (optional) | Description of the on-demand cluster to create, up to 255 characters. |

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

1. Click on **On-Demand Compute > Clusters**.

1. Click on **+ Cluster**.

1. Configure cluster settings.

    The following table explains the parameters.

    <table>
        <tr>
          <th><p><strong>Parameter</strong></p></th>
          <th><p><strong>Description</strong></p></th>
        </tr>
        <tr>
          <td><p>Cluster Name</p></td>
          <td><p>The name of the cluster to create.</p></td>
        </tr>
        <tr>
          <td><p>Cluster Description</p></td>
          <td><p>Description of the on-demand cluster to create, up to 255 characters.</p></td>
        </tr>
        <tr>
          <td><p>Query CU</p></td>
          <td><p>The number of query CUs to allocate. The cluster automatically scales between zero and this value based on workload — it spins up to the specified CU size when requests arrive and scales back to zero when idle. </p><p>The minimum is 8 CU, the maximum is 256 CU, and sizes increase in increments of 8 (for example, 8, 16, and 24). Clusters with more than 8 CU require a payment method.</p><p>Setting this to 8 enables searches across data up to 3 TB. To increase the data volume, increase the CU size.</p><p>This value is fixed after creation and cannot be changed.</p></td>
        </tr>
        <tr>
          <td><p>Auto suspend</p></td>
          <td><p>The idle time (in seconds) before the cluster auto-suspends. Default is 1 minute. When no requests are received within this period, the cluster suspends to stop incurring compute costs.</p></td>
        </tr>
    </table>

1. Click on **Create**.

</Procedures>

## Update on-demand cluster\{#update-on-demand-cluster}

You can update the name, description, and autoSuspend settings of an on-demand cluster.

### Via RESTful API\{#via-restful-api}

The following example updates an on-demand cluster. For details, refer to [Update On-Demand Cluster (V2)](/reference/restful/update-on-demand-cluster-v2).

```bash
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"

curl --request PATCH \
--url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
--header "Content-Type: application/json" \
-d '{
    "clusterName": "New Cluster Name",
    "description": "This is the new description of the cluster.",
    "autoSuspend": "5m"
}'
```

The following is an example output.

```json
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
    }
}
```

### Via web console\{#via-web-console}

You can modify the cluster name, description, and auto-suspend time of an existing on-demand cluster via the web console.

![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

## View all on-demand clusters\{#view-all-on-demand-clusters}

### Via RESTful API\{#via-restful-api}

You can list all on-demand clusters as follows:

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
      --url "{BASE_URL}/v2/clusters/onDemandClusters?projectId={PROJECT_ID}&regionId=aws-us-west-2" \
      --header "Authorization: Bearer ${TOKEN}" \
      --header "Accept: application/json"
```

The following is an example output.

```bash
{
  "code": 0,
  "data": {
    "count": 2,
    "onDemandClusters": [
      {
        "clusterId": "in07-7d6ac8697204a6a",
        "clusterName": "xxx",
        "regionId": "aws-us-west-2",
        "cuSize": 8,
        "status": "SUSPENDED",
        "endpoint": "https://proj-09ee1f4b1151d5dd1edbc5.aws-us-west-2.vectordb-uat3.zillizcloud.com",
        "privateLink": "",
        "createdBy": "admin@zilliz.com",
        "createTime": 1745396115000
      }
    ]
  }
}
```

### Via web console\{via-web-console}

![WPOBwHulYhQPRIbgpjJcrAfXnVc](https://zdoc-images.s3.us-west-2.amazonaws.com/WPOBwHulYhQPRIbgpjJcrAfXnVc.png)

## Check the details of an on-demand cluster\{#check-the-details-of-an-on-demand-cluster}

### Via RESTful API\{#via-restful-api}

You can describe an on-demand cluster as follows:

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
      --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
      --header "Authorization: Bearer ${TOKEN}" \
      --header "Accept: application/json"
```

The following is an example output.

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "clusterName": "xxx",
    "regionId": "aws-us-west-2",
    "cuSize": 8,
    "status": "RUNNING",
    "endpoint": "https://proj-xxxxxxxxxxxxxxx.aws-us-west-2.vectordb-uat3.zillizcloud.com",
    "privateLink": "",
    "createdBy": "admin@zilliz.com",
    "createTime": 1745396115000
  }
}
```

### Via web console\{via-web-console}

![NDpWwXSknh7FMibTGjNcwg8Vnjf](https://zdoc-images.s3.us-west-2.amazonaws.com/NDpWwXSknh7FMibTGjNcwg8Vnjf.png)

## Drop an on-demand cluster\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="Warning">

<p>Once you drop a cluster, it is removed immediately and cannot be recovered. This action cannot be undone.</p>

</Admonition>

### Via RESTful API\{#via-restful-api}

You can drop an on-demand cluster as follows:

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request DELETE \
      --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
      --header "Authorization: Bearer ${TOKEN}" \
      --header "Accept: application/json"
```

The following is an example output.

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "status": "DELETING"
  }
}
```

### Via web console\{via-web-console}

![Vu38wTpLDhmRqYbmYFVcbjK5nVx](https://zdoc-images.s3.us-west-2.amazonaws.com/Vu38wTpLDhmRqYbmYFVcbjK5nVx.png)

    