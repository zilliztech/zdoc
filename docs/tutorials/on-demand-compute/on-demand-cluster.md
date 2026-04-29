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
description: "A cluster is a set of compute resources that runs your vector database workloads. Zilliz Cloud offers two types serving clusters, which run continuously for production workloads requiring always-on, low-latency access, and on-demand clusters, which spin up only when requests arrive and scale to zero when idle.  For details, see Compute: Realtime Serving & On-demand Compute. | Cloud"
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


import Procedures from '@site/src/components/Procedures';

# Cluster

A cluster is a set of compute resources that runs your vector database workloads. Zilliz Cloud offers two types: **serving clusters**, which run continuously for production workloads requiring always-on, low-latency access, and **on-demand clusters**, which spin up only when requests arrive and scale to zero when idle.  For details, see Compute: Realtime Serving & On-demand Compute.

This topic describes how to create an **on-demand** cluster.

<Admonition type="info" icon="📘" title="**Note**">

<p>This feature is only available to <strong>Enterprise</strong> projects.</p>
<p>Currently, you can only create an on-demand cluster in AWS us-west-2. For other regions, <a href="http://zilliz.com/contact-sales">contact us</a>.</p>

</Admonition>

## Create an on-demand cluster\{#create-an-on-demand-cluster}

- **Via RESTful API**

    ```bash
    export BASE_URL = "https://api.cloud.zilliz.com"
    
    curl --request POST \
         --url "https://${BASE_URL}/v2/clusters/createOnDemandCluster" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "projectId": "proj-09ee1f4b1151d5dd1edbc5",
            "regionId": "aws-us-west-2",
            "clusterName": "my-on-demand",
            "cuSize": 8,
            "autoSuspend": "5m"
          }'
         
    # {
    #   "code": 0,
    #   "data": {
    #     "clusterId": "in07-7d6ac8697204a6a",
    #     "regionId": "aws-us-west-2",
    #     "projectId": "proj-09ee1f4b1151d5dd1edbc5"
    #   }
    # }
    ```

    The following table describes the parameters.

    <table>
       <tr>
         <th><p><strong>Parameter</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p><code>projectId</code></p></td>
         <td><p>ID of the project where the on-demand cluster will be created.</p></td>
       </tr>
       <tr>
         <td><p><code>regionId</code></p></td>
         <td><p>Region where the cluster is deployed. Must match the project’s region.</p></td>
       </tr>
       <tr>
         <td><p><code>cuSize</code></p></td>
         <td><p>The number of query CUs to allocate. The cluster automatically scales between zero and this value based on workload — it spins up to the specified CU size when requests arrive and scales back to zero when idle. </p><p>The minimum is 8 CU, the maximum is 256 CU, and sizes increase in increments of 8 (for example, 8, 16, and 24). Clusters with more than 8 CU require a payment method.</p><p>This value is fixed after creation and cannot be changed.</p></td>
       </tr>
       <tr>
         <td><p><code>clusterName</code></p></td>
         <td><p>Name of the cluster to create.</p></td>
       </tr>
       <tr>
         <td><p><code>autoSuspend</code></p></td>
         <td><p>Idle timeout before the cluster auto-suspends. When no requests are received within this period, the cluster suspends to stop incurring compute costs.  </p><ul><li><p>Examples: <code>"60s"</code>, <code>"5m"</code>, <code>"1h"</code></p></li><li><p>Minimum: <code>"60s"</code></p></li><li><p>Default: <code>"1m"</code></p></li></ul></td>
       </tr>
    </table>

- **Via web console**

    The following demo shows how to create an on-demand cluster on the web console.

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
             <td><p>Query CU</p></td>
             <td><p>The number of query CUs to allocate. The cluster automatically scales between zero and this value based on workload — it spins up to the specified CU size when requests arrive and scales back to zero when idle. </p><p>The minimum is 8 CU, the maximum is 256 CU, and sizes increase in increments of 8 (for example, 8, 16, and 24). Clusters with more than 8 CU require a payment method.</p><p>This value is fixed after creation and cannot be changed.</p></td>
           </tr>
           <tr>
             <td><p>Auto suspend</p></td>
             <td><p>The idle time (in seconds) before the cluster auto-suspends. Default is 1 minute. When no requests are received within this period, the cluster suspends to stop incurring compute costs.</p></td>
           </tr>
        </table>

    1. Click on **Create**.

    </Procedures>

## View all on-demand clusters\{#view-all-on-demand-clusters}

- **Via RESTful API**

    You can list all on-demand clusters as follows:

    ```bash
    export BASE_URL = "https://api.cloud.zilliz.com"
    
    curl --request GET \
         --url "https://{BASE_URL}/v2/clusters/onDemandClusters?projectId=</equation>{PROJECT_ID}&regionId=aws-us-west-2" \
         --header "Authorization: Bearer ${API_KEY}" \
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
            "cu": 8,
            "replicas": 0,
            "readyReplicas": 0,
            "status": "SUSPENDED",
            "endpoint": "https://proj-09ee1f4b1151d5dd1edbc5.aws-us-west-2.vectordb-uat3.zillizcloud.com",
            "privateLink": "",
            "createdBy": "jack.tsai@zilliz.com",
            "createTime": 1745396115000
          }
        ]
      }
    }
    ```

- **Via web console**

    ![XjDVwGxhUhCexCb9QvDc92Npneb](https://zdoc-images.s3.us-west-2.amazonaws.com/XjDVwGxhUhCexCb9QvDc92Npneb.png)

## Check the details of an on-demand cluster\{#check-the-details-of-an-on-demand-cluster}

- **Via RESTful API**

    You can describe an on-demand cluster as follows:

    ```bash
    export BASE_URL = "https://api.cloud.zilliz.com"
    
    curl --request GET \
         --url "https://${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json"
    ```

    The following is an example output.

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "in07-7d6ac8697204a6a",
        "clusterName": "xxx",
        "regionId": "aws-us-west-2",
        "cu": 8,
        "replicas": 2,
        "readyReplicas": 2,
        "status": "RUNNING",
        "endpoint": "https://proj-09ee1f4b1151d5dd1edbc5.aws-us-west-2.vectordb-uat3.zillizcloud.com",
        "privateLink": "",
        "createdBy": "jack.tsai@zilliz.com",
        "createTime": 1745396115000
      }
    }
    ```

- **Via web console**

    ![R9ZRwkxl6hQlgqbceEockOT3njc](https://zdoc-images.s3.us-west-2.amazonaws.com/R9ZRwkxl6hQlgqbceEockOT3njc.png)

## Drop an on-demand cluster\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="**Warning**">

<p>Once you drop a cluster, it is removed immediately and cannot be recovered. This action cannot be undone.</p>

</Admonition>

- **Via RESTful API**

    You can drop an on-demand cluster as follows:

    ```bash
    export BASE_URL = "https://api.cloud.zilliz.com"
    
    curl --request DELETE \
         --url "https://${BASE_URL}/v2/clusters/onDemandClusters/in07-7d6ac8697204a6a" \
         --header "Authorization: Bearer ${API_KEY}" \
         --header "Accept: application/json"
    ```

    The following is an example output.

    ```bash
    {
      "code": 0,
      "data": {
        "clusterId": "in07-7d6ac8697204a6a",
        "status": "DELETING"
      }
    }
    ```

- **Via web console**

    ![YBMtwjKzPhGICcb6U8McD14cnjh](https://zdoc-images.s3.us-west-2.amazonaws.com/YBMtwjKzPhGICcb6U8McD14cnjh.png)

    