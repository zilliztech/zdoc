---
title: "Manage On-Demand Cluster | Cloud"
slug: /manage-on-demand-clusters
sidebar_label: "Manage Cluster"
beta: PUBLIC
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

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only with the Enterprise plan or higher.

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is currently available only in AWS us-west-2 and Azure East US regions. To use on-demand clusters in other regions, [contact us](http://zilliz.com/contact-sales).

</FeatureNote>

This guide describes how to view, inspect, and drop on-demand clusters in Zilliz Cloud.

On-demand clusters provide compute for on-demand search workloads. They spin up when requests arrive and scale back to zero when idle, based on the auto-suspend timeout configured when the cluster is created.

To manage an on-demand cluster, you need to be a Project Admin in the target project. For details about the roles and permissions, see [Manage Project Users](./project-users#project-role-and-access-comparison).

## View all on-demand clusters\{#view-all-on-demand-clusters}

Use this operation to list the on-demand clusters in a project and region.

### Via RESTful API\{#via-restful-api}

```bash
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
                "projectId": "proj-xxxxxxxxxxxxxxx",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "clusterName": "Cluster-01",
                "regionId": "aws-us-west-2",
                "cuSize": 8,
                "status": "RUNNING",
                "endpoint": "https://proj-xxxxxxxxxxxxxxx.aws-us-west-2.api.zillizcloud.com",
                "privateLink": "",
                "createdBy": "john.doe@zilliz.com",
                "createTime": "2024-04-21T10:15:15Z",
                "autoSuspend": 60,
                "description": "An on-demand cluster for vector search workloads."
            },
            {
                "projectId": "proj-xxxxxxxxxxxxxxx",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "clusterName": "Cluster-02",
                "regionId": "aws-us-west-2",
                "status": "RUNNING",
                "cuSize": 8,
                "endpoint": "https://proj-xxxxxxxxxxxxxxx.aws-us-west-2.api.zillizcloud.com",
                "privateLink": "",
                "createdBy": "john.doe@zilliz.com",
                "createTime": "2024-04-21T10:15:16Z",
                "autoSuspend": 60,
                "description": "An on-demand cluster for vector search workloads."
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

```bash
curl --request GET \
     --url "https://${BASE_URL}/v2/on-demand-compute?projectId=proj-09ee1f4b1151d5dd1edbc5&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json"
```

Example response:

```plaintext
{
  "code": 0,
  "data": {
    "projectId": "proj-09ee1f4b1151d5dd1edbc5",
    "regionId": "aws-us-west-2",
    "status": "enabled"
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

## Rename an on-demand cluster\{#rename-an-on-demand-cluster}

- **Via RESTful API**

    The following example modifies the cluster name. For details, see [Update On-Demand Cluster](/reference/restful/update-on-demand-cluster-v2).

    ```bash
    curl --request PATCH \
    --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
    --header "Content-Type: application/json" \
    -d '{
        "clusterName": "New Cluster Name"
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

- **Via Web console**

    <Procedures>

    1. Navigate to your target on-demand cluster.

    1. Click on **Actions** and then select **Rename**.

        ![IvU4bhPSfo7u76xC67DcESHpnfg](https://zdoc-images.s3.us-west-2.amazonaws.com/ivu4bhpsfo7u76xc67dceshpnfg.png "IvU4bhPSfo7u76xC67DcESHpnfg")

    1. Enter the new name of the cluster and click on **Save**.

        ![GPBzb78W3ojP0HxalhHc6M4Zn6c](https://zdoc-images.s3.us-west-2.amazonaws.com/gpbzb78w3ojp0hxalhhc6m4zn6c.png "GPBzb78W3ojP0HxalhHc6M4Zn6c")

    </Procedures>

## Edit the description of an on-demand cluster\{#edit-the-description-of-an-on-demand-cluster}

- **Via RESTful API**

    The following example modifies the cluster description. For details, see [Update On-Demand Cluster](/reference/restful/update-on-demand-cluster-v2).

    ```bash
    curl --request PATCH \
    --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
    --header "Content-Type: application/json" \
    -d '{
        "description": ""
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

- **Via Web console**

    <Procedures>

    1. Navigate to your target on-demand cluster.

    1. Hover on the description and click on the **Edit description** icon.

        ![AbaibGQY5oI7hMx81F9cOBOlnAd](https://zdoc-images.s3.us-west-2.amazonaws.com/abaibgqy5oi7hmx81f9cobolnad.png "AbaibGQY5oI7hMx81F9cOBOlnAd")

    1. Enter the new description of the cluster and click on **Save**.

        ![HKlybJYCFo2uMHxmVZ0cBs7Gnid](https://zdoc-images.s3.us-west-2.amazonaws.com/hklybjycfo2umhxmvz0cbs7gnid.png "HKlybJYCFo2uMHxmVZ0cBs7Gnid")

    </Procedures>

## Drop an on-demand cluster\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="Danger">

Once you drop an on-demand cluster, it is removed immediately and cannot be recovered. This action cannot be undone.

</Admonition>

### Via RESTful API\{#via-restful-api}

```bash
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
