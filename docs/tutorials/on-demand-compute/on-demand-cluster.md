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

# Cluster

A cluster is a set of compute resources that runs your vector database workloads. Zilliz Cloud offers two types: **serving clusters**, which run continuously for production workloads requiring always-on, low-latency access, and **on-demand clusters**, which spin up only when requests arrive and scale to zero when idle.  

This topic describes how to create an **on-demand** cluster.

<Admonition type="info" icon="📘" title="Note">

<p>This feature is only available to <strong>Enterprise</strong> projects.</p>
<p>Currently, you can only create an on-demand cluster in AWS us-west-2. For other regions, <a href="http://zilliz.com/contact-sales">contact us</a>.</p>

</Admonition>

## Limitations\{#limitations}

- To manage an on-demand cluster, you need to be a **Project Admin**.

- You can only create up to 20 on-demand clusters in each project.

- An on-demand cluster can query up to 3 TB of raw data for every 8 CUs. Queries that exceed this limit will return an error.

## Create an on-demand cluster\{#create-an-on-demand-cluster}

- **Via RESTful API**

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
         --url "${BASE_URL}/v2/clusters/createOnDemandCluster" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "projectId": "proj-xxxxxxxxxxxxxxx",
            "regionId": "aws-us-west-2",
            "clusterName": "my-on-demand",
            "cuSize": 8,
            "autoSuspend": 120,
            "description": "A cluster for vector search workloads."
          }'
         
    # {
    #   "code": 0,
    #   "data": {
    #     "clusterId": "inxx-xxxxxxxxxxxxxxx",
    #     "regionId": "aws-us-west-2",
    #     "projectId": "proj-xxxxxxxxxxxxxxx"
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
         <td><p>The number of query CUs to allocate. The cluster automatically scales between zero and this value based on workload — it spins up to the specified CU size when requests arrive and scales back to zero when idle. </p><p>The minimum is 8 CU, the maximum is 256 CU, and sizes increase in increments of 8 (for example, 8, 16, and 24). Clusters with more than 8 CU require a payment method.</p><p>Setting this to 8 enables searches across data up to 3 TB. To increase the data volume, increase the CU size.</p><p>This value is fixed after creation and cannot be changed.</p></td>
       </tr>
       <tr>
         <td><p><code>clusterName</code></p></td>
         <td><p>Name of the cluster to create.</p></td>
       </tr>
       <tr>
         <td><p><code>autoSuspend</code></p></td>
         <td><p>Idle timeout before the cluster auto-suspends. When no requests are received within this period, the cluster suspends to stop incurring compute costs.  </p><ul><li><p>Value type: Integer</p></li><li><p>Unit: Seconds</p></li><li><p>Minimum: 60</p></li><li><p>Default: 60</p></li></ul></td>
       </tr>
       <tr>
         <td><p><code>description</code></p></td>
         <td><p>Description of the on-demand cluster to create, up to 255 characters.</p></td>
       </tr>
    </table>

- **Via web console**

    The following demo shows how to create an on-demand cluster on the web console.

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

## View all on-demand clusters\{#view-all-on-demand-clusters}

- **Via RESTful API**

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

- **Via web console**

    ![WPOBwHulYhQPRIbgpjJcrAfXnVc](https://zdoc-images.s3.us-west-2.amazonaws.com/WPOBwHulYhQPRIbgpjJcrAfXnVc.png)

## Check the details of an on-demand cluster\{#check-the-details-of-an-on-demand-cluster}

- **Via RESTful API**

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

- **Via web console**

    ![NDpWwXSknh7FMibTGjNcwg8Vnjf](https://zdoc-images.s3.us-west-2.amazonaws.com/NDpWwXSknh7FMibTGjNcwg8Vnjf.png)

## Drop an on-demand cluster\{#drop-an-on-demand-cluster}

<Admonition type="danger" icon="🚧" title="Warning">

<p>Once you drop a cluster, it is removed immediately and cannot be recovered. This action cannot be undone.</p>

</Admonition>

- **Via RESTful API**

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

- **Via web console**

    ![Vu38wTpLDhmRqYbmYFVcbjK5nVx](https://zdoc-images.s3.us-west-2.amazonaws.com/Vu38wTpLDhmRqYbmYFVcbjK5nVx.png)

    