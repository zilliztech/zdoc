---
title: "Manage On-Demand Cluster | Cloud"
slug: /manage-on-demand-clusters
sidebar_label: "Manage Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide describes how to view, inspect, and drop on-demand clusters in Zilliz Cloud. | Cloud"
type: origin
token: L11Mw0GRTiKALikJaEycwj1wnKg
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Manage On-Demand Cluster

This guide describes how to view, inspect, and drop on-demand clusters in Zilliz Cloud.

On-demand clusters provide compute for on-demand search workloads. They spin up when requests arrive and scale back to zero when idle, based on the auto-suspend timeout configured when the cluster is created.

<Admonition type="info" icon="📘" title="Note">

To manage an on-demand cluster, you need to be a Project Admin in the target project.

</Admonition>

## View all on-demand clusters\{#view-all-on-demand-clusters}

Use this operation to list the on-demand clusters in a project and region.

### Via RESTful API\{#via-restful-api}

```plaintext
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
     --url "${BASE_URL}/v2/clusters/onDemandClusters?projectId=proj-xxxxxxxxxxxxxxx&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

Example response:

```plaintext
{
  "code": 0,
  "data": {
    "count": 2,
    "onDemandClusters": [
      {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "clusterName": "my-on-demand",
        "regionId": "aws-us-west-2",
        "cuSize": 8,
        "status": "SUSPENDED",
        "endpoint": "https://proj-xxxxxxxxxxxxxxx.aws-us-west-2.api.zillizcloud.com",
        "privateLink": "",
        "createdBy": "admin@example.com",
        "createTime": 1745396115000
      }
    ]
  }
}
```

### Via web console\{#via-web-console}

![W3nYwPc0AhxRDWbjEsWceJGVnbh](https://zdoc-images.s3.us-west-2.amazonaws.com/W3nYwPc0AhxRDWbjEsWceJGVnbh.png)

<Procedures>

1. In the Zilliz Cloud console, open the target project.

1. Go to **On-Demand Compute > Clusters**.

1. Review the on-demand cluster list, including cluster name, cluster ID, status, CU size, endpoint, creator, and creation time.

</Procedures>

## Check the details of an on-demand cluster\{#check-the-details-of-an-on-demand-cluster}

Use this operation to inspect one on-demand cluster by cluster ID.

### Via RESTful API\{#via-restful-api}

```plaintext
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
     --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

Example response:

```plaintext
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "clusterName": "my-on-demand",
    "regionId": "aws-us-west-2",
    "cuSize": 8,
    "status": "RUNNING",
    "endpoint": "https://proj-xxxxxxxxxxxxxxx.aws-us-west-2.api.zillizcloud.com",
    "privateLink": "",
    "createdBy": "admin@example.com",
    "createTime": 1745396115000
  }
}
```

### Via web console\{#via-web-console}

![XiWTwTJ3mhgjHBbS5dycYi4bn4c](https://zdoc-images.s3.us-west-2.amazonaws.com/XiWTwTJ3mhgjHBbS5dycYi4bn4c.png)

<Procedures>

1. In the Zilliz Cloud console, open the target project.

1. Go to **On-Demand Compute > Clusters**.

1. Click the target cluster to view its details.

</Procedures>

## Understand cluster status\{#understand-cluster-status}

An on-demand cluster automatically changes status based on request activity.

| Status | Description |
| --- | --- |
| `RUNNING` | The cluster has active compute resources and can serve search or query requests. |
| `SUSPENDED` | The cluster has scaled to zero after the configured idle timeout. It stops incurring compute costs while suspended. |
| `DELETING` | The cluster is being dropped and cannot be used. |

When a request arrives for a suspended on-demand cluster, Zilliz Cloud spins up compute resources for the workload. When no requests are received within the configured `autoSuspend` period, the cluster scales back to zero.

## Drop an on-demand cluster\{#drop-an-on-demand-cluster}

<Admonition type="warning" icon="🚧" title="Warning">

Once you drop an on-demand cluster, it is removed immediately and cannot be recovered. This action cannot be undone.

</Admonition>

### Via RESTful API\{#via-restful-api}

```plaintext
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request DELETE \
     --url "${BASE_URL}/v2/clusters/onDemandClusters/inxx-xxxxxxxxxxxxxxx" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json"
```

Example response:

```plaintext
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "status": "DELETING"
  }
}
```

### Via web console\{#via-web-console}

![H9p9wioiohNX3Ub6evBcWGTBnse](https://zdoc-images.s3.us-west-2.amazonaws.com/H9p9wioiohNX3Ub6evBcWGTBnse.png)

<Procedures>

1. In the Zilliz Cloud console, open the target project.

1. Go to **On-Demand Compute > Clusters**.

1. Select the target on-demand cluster.

1. Drop the cluster and confirm the operation.

</Procedures>

## Related topics\{#related-topics}

- To create an on-demand cluster, see [Create On-Demand Cluster](./on-demand-cluster).

- To connect through a project endpoint, see [Connect for On-Demand Search](./connect-for-on-demand-search).

