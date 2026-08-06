---
title: "Create Global Cluster | BYOC"
slug: /create-global-cluster
sidebar_label: "Create Global Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide explains how to create a global cluster. | BYOC"
type: origin
token: MZ2WwklE5ifX4hkO4ZOcXz0indc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Create Global Cluster

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only on Business Critical (SaaS) and BYOC deployments.

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is available in all AWS regions and in the following Google Cloud regions: gcp-us-central1 and gcp-us-east4. It is not available on Microsoft Azure.

</FeatureNote>

This guide explains how to create a global cluster. 

If you need to enable the global cluster feature for an existing cluster, see [Manage Cluster](./manage-cluster#convert-to-a-global-cluster).

## Before you start\{#before-you-start}

- Ensure you are a **Project Admin**.

- Currently, this feature is available in all AWS regions and in the Google Cloud us-central1 and us-east4 regions. To create a global cluster in Google Cloud regions, [contact us](http://support.zilliz.com).

## Create a global cluster\{#create-a-global-cluster}

- **Via web console**

    <Procedures>

    1. Turn on the switch next to **Global Cluster** in **Cluster Settings**.

    1. Provide a name for the global cluster. 

        ![C33Vw8MCshNOoAbDTbjcegOIndd](https://zdoc-images.s3.us-west-2.amazonaws.com/C33Vw8MCshNOoAbDTbjcegOIndd.png)

    1. Configure the primary cluster.

        ![MkZTwsJhfhpKzUbCKcRcJscdnXe](https://zdoc-images.s3.us-west-2.amazonaws.com/MkZTwsJhfhpKzUbCKcRcJscdnXe.png)

        The following table explains the parameters.

        | **Parameter** | **Description** |
        | --- | --- |
        | Cluster Name | The name of the primary cluster. |
        | Region | The region where the primary cluster is deployed. |
        | Cluster Type | The cluster type of the primary cluster. All secondary clusters use the same cluster type as the primary cluster. |
        | Query CU | Auto-scaling is enabled by default. You can configure the minimum and maximum number of Query CUs for auto-scaling by entering values in the input boxes or dragging the slider. For details about auto-scaling, see [Auto-scaling](./auto-scaling).<br/>You can also disable autoscaling.<br/>The number of Query CUs for secondary clusters follows the primary cluster. |
        | Replica | The number of replicas for the primary cluster. The number of replicas can differ between the primary cluster and each secondary cluster. |

    1. Configure the secondary cluster(s). You can create **up to 5** secondary clusters.

        ![NjNUwjHuKhGRwObLoyQc1FKxnVh](https://zdoc-images.s3.us-west-2.amazonaws.com/NjNUwjHuKhGRwObLoyQc1FKxnVh.png)

        The following table explains the parameters.

        | **Parameter** | **Description** |
        | --- | --- |
        | Cluster Name | The name of the secondary cluster. |
        | Region | The region where the secondary cluster is deployed. |
        | Replica | The number of replicas for the secondary cluster. The number of replicas can differ between the primary cluster and each secondary cluster. |

    1. Click **Create**.

        ![Z9xYwy7dKhQMGob52EzcFpAnnmh](https://zdoc-images.s3.us-west-2.amazonaws.com/Z9xYwy7dKhQMGob52EzcFpAnnmh.png)

    </Procedures>

    After you create a global cluster, Zilliz Cloud:

    1. Provisions a global cluster and both its primary and secondary clusters. All primary and secondary clusters appear in **CREATING** status.

    1. Once the provision of both the primary and secondary clusters completes, the clusters appear in **RUNNING** status and supports data replication.

    You can monitor the data synchronization status and lag on the **Global Topology** tab of the **Global Cluster** page.

    ![CLpZwH1e3hd3F1bIXisc6u7GnDg](https://zdoc-images.s3.us-west-2.amazonaws.com/CLpZwH1e3hd3F1bIXisc6u7GnDg.png)

- **Via RESTful API**

    The following example creates a global cluster with 1 primary cluster deployed in AWS us-west-2 and 1 secondary cluster deployed in AWS eu-west-1. For details about the API, see [Create Global Cluster](/reference/restful/create-global-cluster-v2).

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/create" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "globalClusterName": "my-global-cluster",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "cuType": "Performance-optimized",
        "cuSize": 4,
        "primaryCluster": {
          "clusterName": "primary-cluster",
          "regionId": "aws-us-west-2"
        },
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-eu",
            "regionId": "aws-eu-west-1"
          }
        ]
      }'
    ```

    The following is an example of the output.

    ```json
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "username": "db_admin",
        "password": "********",
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

    When creating a global cluster, you can also configure Query CU autoscaling and set the replica count separately for the primary and secondary clusters. The following is an example.

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/create" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "globalClusterName": "my-global-cluster",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "cuType": "Performance-optimized",
        "autoscaling": {
          "cu": {
            "min": 4,
            "max": 16
          }
        },
        "primaryCluster": {
          "clusterName": "primary-cluster",
          "regionId": "aws-us-west-2",
          "replica": 2
        },
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-eu",
            "regionId": "aws-eu-west-1",
            "replica": 1
          }
        ]
      }
    ```
