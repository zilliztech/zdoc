---
title: "Manage On-Demand Cluster | BYOC"
slug: /manage-on-demand-clusters
sidebar_label: "Manage Cluster"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide describes how to view, inspect, and drop on-demand clusters in Zilliz Cloud. | BYOC"
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

To manage an on-demand cluster, you need to be a Project Admin in the target project. For details about the roles and permissions, see [Manage Platform Users](./manage-platform-users#project-users).

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

```bash
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

```bash
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

## Modify an on-demand cluster\{#modify-an-on-demand-cluster}

You can modify the settings, such as the name, description, and auto-suspend settings of an on-demand cluster.

- **Via RESTful API**

    You can modify the name, description, auto-suspend time, and the number of query CUs of an existing on-demand cluster. For details, see [Update On-Demand Cluster](/reference/restful/update-on-demand-cluster-v2).

    ```bash
    export TOKEN="YOUR_API_KEY"
    export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"
    
    curl --request PATCH \
         --url "https://${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "autoSuspend": "5m",
            "clusterName": "my-on-demand-updated",
            "description": "Updated on-demand cluster description",
            "cuSize": 32
          }'
    ```

    The following is an example output.

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully submitted."
      }
    }
    ```

- **Via web console**

    You can modify the cluster name, description, auto-suspend time, and number of query CUs of an existing on-demand cluster via the web console.

    ![M2XMwoWoih17BRbqhGhcb6i9njg](https://zdoc-images.s3.us-west-2.amazonaws.com/M2XMwoWoih17BRbqhGhcb6i9njg.png)

## Configure a keep-warm schedule\{#configure-a-keep-warm-schedule}

A keep-warm schedule keeps an on-demand cluster running during recurring weekly windows. When a keep-warm window starts, Zilliz Cloud resumes the on-demand cluster if it is suspended. During the window, `Auto Suspend` is suppressed. When the window ends, the on-demand cluster follows its existing auto-suspension policy again.

Keep-warm schedule does not turn off `Auto Suspend` permanently and does not actively suspend an on-demand cluster when a keep-warm window ends.

<Admonition type="info" icon="📘" title="Note">

To suspend an on-demand cluster during a keep-warm window, disable or delete the keep-warm schedule first.

</Admonition>

Each on-demand cluster can have one keep-warm schedule. A schedule can contain 1 to 5 weekly rules. Each rule uses the organization's system time zone and includes the days of the week, a start time, and an end time.

### Via RESTful API\{#via-restful-api}

You can create, update, view, enable, disable, or delete the keep-warm schedule of an on-demand cluster.

#### Create or update a keep-warm schedule\{#create-or-update-a-keep-warm-schedule}

When you create or update a keep-warm schedule, submit the complete list of rules. Zilliz Cloud replaces the existing rules with the submitted rules in a single operation.

The following example creates a keep-warm schedule for weekdays from `09:00` to `18:00`.

```bash

```

Example response:

```bash

```

#### View a keep-warm schedule\{#view-a-keep-warm-schedule}

The following example checks the keep-warm schedule of an on-demand cluster.

```bash

```

Example response:

```json

```

If no schedule is configured, the request succeeds and returns `configured` as `false`.

#### Enable or disable a keep-warm schedule\{#enable-or-disable-a-keep-warm-schedule}

To enable or disable a keep-warm schedule, send a PUT request with the full rule set and the desired `enabled` value.

<Admonition type="info" icon="📘" title="Note">

Disabling a schedule keeps all configured rules. If the on-demand cluster is in a keep-warm window, Zilliz Cloud exits keep-warm mode immediately. The schedule does not suspend the on-demand cluster.

</Admonition>

The following example disables an existing keep-warm schedule.

```bash

```

Example response:

```bash

```

#### Delete a keep-warm schedule\{#delete-a-keep-warm-schedule}

Deleting a keep-warm schedule removes the schedule and all rules. It does not delete the on-demand cluster, data, events, or audit records.

```bash

```

Example response:

```json

```

### Via web console\{#via-web-console}

![EnHUwxZCUhT8hlbvMJRchiAQnfY](https://zdoc-images.s3.us-west-2.amazonaws.com/EnHUwxZCUhT8hlbvMJRchiAQnfY.png)

<Procedures>

1. Navigate to your target on-demand cluster.

1. Open the **Actions** menu and click **Manage Keep-warm Schedule**.

1. Turn on **Enable Keep-warm Schedule**.

1. In **Schedule Rules**, add one or more weekly rules.

1. For each rule, configure the repeat days, start time, and end time.

1. Review the next transition time.

1. Click **Save**.

</Procedures>

The cluster details page shows the keep-warm schedule status as **On**, **Off**, **Not configured**, or **Schedule unavailable**. If a schedule is configured, it also shows the rule count, the system time zone, and the next transition time.

If the on-demand cluster is currently in a keep-warm window, the page shows a secondary **Keep-warm** tag next to the primary cluster status.

![IF04w32RNhEbr7b8OBUcM8n3nnc](https://zdoc-images.s3.us-west-2.amazonaws.com/IF04w32RNhEbr7b8OBUcM8n3nnc.png)

Disabling a schedule keeps all configured rules. If the on-demand cluster is in a keep-warm window, Zilliz Cloud exits keep-warm mode immediately. The schedule does not suspend the on-demand cluster. To disable a keep-warm schedule, turn off **Enable Keep-warm Schedule** and click **Save** as shown below.

![OzydwQkLjhVsoBbckHzciUAbnmc](https://zdoc-images.s3.us-west-2.amazonaws.com/OzydwQkLjhVsoBbckHzciUAbnmc.png)

Deleting a schedule permanently removes all rules. To delete a keep-warm schedule, click **Delete Schedule** and confirm the operation as shown below. 

![SBkEwV2bihQXhDbdTlIcnnYknSd](https://zdoc-images.s3.us-west-2.amazonaws.com/SBkEwV2bihQXhDbdTlIcnnYknSd.png)

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

```bash
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

