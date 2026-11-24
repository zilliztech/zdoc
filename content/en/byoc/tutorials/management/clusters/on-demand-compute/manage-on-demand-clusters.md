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

1. Open the target project and select the region that contains your clusters.

1. In the left navigation, expand **On-Demand** and select **Clusters**.

1. Find the cluster in the list and check its status.

</Procedures>

## Check the details of an on-demand cluster\{#check-the-details-of-an-on-demand-cluster}

View the status and configuration of an on-demand cluster.

### Via RESTful API\{#via-restful-api}

```bash
curl --request GET \
     --url "${BASE_URL}/v2/on-demand-compute?projectId=proj-09ee1f4b1151d5dd1edbc5&regionId=aws-us-west-2" \
     --header "Authorization: Bearer ${TOKEN}" \
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

1. Open the [list of on-demand clusters](./manage-on-demand-clusters#via-web-console) for your project and region.

1. Select the name of the cluster you want to inspect.

1. On the **Overview** tab, review the cluster status, connection details, and compute settings.

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

    1. Open the cluster’s [Overview page](./manage-on-demand-clusters#via-web-console).

    1. Open **Actions** and select **Edit**.

        ![Edit in the cluster Actions menu.](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-in-the-cluster-actions-menu.png "Edit in the cluster Actions menu.")

    1. In **Cluster Name**, enter the new name and click **Save**.

        ![Cluster Name and Save in the Edit On-demand Cluster dialog.](https://zdoc-images.s3.us-west-2.amazonaws.com/cluster-name-and-save-in-the-edit-on-demand-cluster-dialog.png "Cluster Name and Save in the Edit On-demand Cluster dialog.")

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

    1. Open the cluster’s [Overview page](./manage-on-demand-clusters#via-web-console).

    1. Open **Actions** and select **Edit**.

        ![Edit in the cluster Actions menu.](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-in-the-cluster-actions-menu.png "Edit in the cluster Actions menu.")

    1. In **Description**, enter the new description and click **Save**.

        ![Description and Save in the Edit On-demand Cluster dialog.](https://zdoc-images.s3.us-west-2.amazonaws.com/description-and-save-in-the-edit-on-demand-cluster-dialog.png "Description and Save in the Edit On-demand Cluster dialog.")

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

    <Procedures>

    1. Open the cluster’s [Overview page](./manage-on-demand-clusters#via-web-console).

    1. Open **Actions** and select **Edit**.

    1. You can modify the following settings of the on-demand cluster:

        - Cluster name

        - Description

        - Query CU

        - Auto Suspend

    1. Click on **Save**.

    </Procedures>

## Configure a keep-warm schedule\{#configure-a-keep-warm-schedule}

A keep-warm schedule keeps an on-demand cluster running during recurring weekly windows. When a keep-warm window starts, Zilliz Cloud resumes the on-demand cluster if it is suspended. During the window, `Auto Suspend` is suppressed. When the window ends, the on-demand cluster follows its existing auto-suspension policy again.

Keep-warm schedule does not turn off `Auto Suspend` permanently and does not actively suspend an on-demand cluster when a keep-warm window ends.

<Admonition type="info" title="Note">

To suspend an on-demand cluster during a keep-warm window, disable or delete the keep-warm schedule first.

</Admonition>

Each on-demand cluster can have one keep-warm schedule. A schedule can contain 1 to 10 weekly rules. Each rule uses the organization's system time zone and includes the days of the week, a start time, and an end time.

### Via RESTful API\{#via-restful-api}

Use the existing on-demand cluster APIs to configure keep-warm schedules. The keep-warm configuration is carried by the `keepWarm` object in the create, describe, and update APIs.

#### Create a keep-warm schedule\{#create-a-keep-warm-schedule}

To configure a keep-warm schedule when creating an on-demand cluster, include `keepWarm` in the create request.

The following example creates an on-demand cluster with a keep-warm schedule for weekdays from `09:00` to `18:00`.

```bash
curl --request POST \
  --url "${BASE_URL}/v2/clusters/createOnDemandCluster" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Content-Type: application/json" \
  -d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "cuSize": 8,
    "clusterName": "my-on-demand-cluster",
    "autoSuspend": "5m",
    "keepWarm": {
      "enabled": true,
      "schedules": [
        {
          "daysOfWeek": [1, 2, 3, 4, 5],
          "startTime": "09:00",
          "endTime": "18:00"
        }
      ]
    }
  }'
```

Example response:

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "prompt": "successfully submitted. Cluster is being created."
  }
}
```

#### View a keep-warm schedule\{#view-a-keep-warm-schedule}

The following example checks the keep-warm schedule of an on-demand cluster.

```bash
curl --request GET \
  --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Accept: application/json"
```

Example response:

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "clusterName": "my-on-demand-cluster",
    "status": "RUNNING",
    "autoSuspend": 300,
    "keepWarmActive": true,
    "keepWarm": {
      "enabled": true,
      "systemTimezone": "Asia/Shanghai",
      "schedules": [
        {
          "daysOfWeek": [1, 2, 3, 4, 5],
          "startTime": "09:00",
          "endTime": "18:00"
        }
      ],
      "nextTransitionAt": "2026-09-15T10:00:00Z",
      "nextTransitionType": "END"
    }
  }
}
```

If no schedule is configured, `keepWarm` is `null` and `keepWarmActive` is `false`.

#### Update a keep-warm schedule\{#update-a-keep-warm-schedule}

To update a keep-warm schedule, send a `PATCH` request with the complete `keepWarm` object. Zilliz Cloud replaces the existing schedule with the submitted schedules.

The following example updates the keep-warm schedule of an existing on-demand cluster.

```bash
curl --request PATCH \
  --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Content-Type: application/json" \
  -d '{
    "keepWarm": {
      "enabled": true,
      "schedules": [
        {
          "daysOfWeek": [1, 2, 3, 4, 5],
          "startTime": "09:00",
          "endTime": "18:00"
        }
      ]
    }
  }'
```

Example response:

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx"
  }
}
```

#### Disable a keep-warm schedule\{#disable-a-keep-warm-schedule}

To disable a keep-warm schedule, send a `PATCH` request with the complete `keepWarm` object and set `enabled` to `false`.

<Admonition type="info" title="Note">

Disabling a schedule keeps all configured rules. If the on-demand cluster is in a keep-warm window, Zilliz Cloud exits keep-warm mode immediately. The schedule does not suspend the on-demand cluster.

</Admonition>

The following example disables an existing keep-warm schedule.

```bash
curl --request PATCH \
  --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Content-Type: application/json" \
  -d '{
    "keepWarm": {
      "enabled": false,
      "schedules": [
        {
          "daysOfWeek": [1, 2, 3, 4, 5],
          "startTime": "09:00",
          "endTime": "18:00"
        }
      ]
    }
  }'
```

Example response:

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx"
  }
}
```

#### Delete a keep-warm schedule\{#delete-a-keep-warm-schedule}

Deleting a keep-warm schedule removes the schedule and all rules. It does not delete the on-demand cluster, data, events, or audit records.

To delete a keep-warm schedule, send a `PATCH` request with an empty `schedules` list.

```bash
curl --request PATCH \
  --url "${BASE_URL}/v2/clusters/onDemandClusters/${CLUSTER_ID}" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "OrgId: org-xxxxxxxxxxxxxxxxxxx" \
  --header "Content-Type: application/json" \
  -d '{
    "keepWarm": {
      "enabled": false,
      "schedules": []
    }
  }'
```

Example response:

```json
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx"
  }
}
```

### Via web console\{#via-web-console}

![EnHUwxZCUhT8hlbvMJRchiAQnfY](https://zdoc-images.s3.us-west-2.amazonaws.com/EnHUwxZCUhT8hlbvMJRchiAQnfY.png)

<Procedures>

1. Open the cluster’s [Overview page](./manage-on-demand-clusters#via-web-console).

1. Open **Actions** and select **Edit Keep-warm**.

1. Turn on **Enable Schedule**.

1. Under **Rules**, select the days for the first rule.

1. Set the **Start Time** and **End Time** for those days.

1. To add another weekly rule, click **+ Rule** and set its days and times.

1. Click **Save**.

</Procedures>

The cluster details page shows the keep-warm schedule status. If a schedule is configured, it also shows the next transition time.

If the on-demand cluster is currently in a keep-warm window, the page shows a secondary **Keep-warm** tag next to the primary cluster status.

![IF04w32RNhEbr7b8OBUcM8n3nnc](https://zdoc-images.s3.us-west-2.amazonaws.com/IF04w32RNhEbr7b8OBUcM8n3nnc.png)

Disabling a schedule keeps all configured rules. If the on-demand cluster is in a keep-warm window, Zilliz Cloud exits keep-warm mode immediately. The schedule does not suspend the on-demand cluster. To disable the schedule, open **Actions**, select **Edit Keep-warm**, turn off **Enable Schedule**, and click **Save**.

![OzydwQkLjhVsoBbckHzciUAbnmc](https://zdoc-images.s3.us-west-2.amazonaws.com/OzydwQkLjhVsoBbckHzciUAbnmc.png)

## Drop an on-demand cluster\{#drop-an-on-demand-cluster}

<Admonition type="danger" title="Danger">

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

1. Open the cluster’s [Overview page](./manage-on-demand-clusters#via-web-console).

1. Open **Actions** and select **Drop**.

1. In the confirmation dialog, enter the cluster name exactly as shown.

1. Click **Drop** to confirm.

</Procedures>

## Related topics\{#related-topics}

- To create an on-demand cluster, see [Create On-Demand Cluster](./on-demand-cluster).

- To connect through a project endpoint, see [Connect for On-Demand Search](./connect-for-on-demand-search).

