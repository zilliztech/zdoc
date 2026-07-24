---
title: "Create Global Cluster | Cloud"
slug: /create-global-cluster
sidebar_label: "Create Global Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide explains how to create a global cluster. | Cloud"
type: origin
token: MZ2WwklE5ifX4hkO4ZOcXz0indc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

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

    Turn on the switch next to **Global Cluster** in **Cluster Settings** and provide a name for the global cluster. A global cluster must have **1 primary cluster** and **1 to 5 secondary cluster**. 

    The cloud provider, cluster type, number of query CU should be consistent with those of the primary cluster.

    Secondary cluster regions in a Global Cluster are limited to the regions supported by your [project](./manage-projects). 

    The following demo shows how to create a global cluster via the web console.

    <Supademo id="cmkasmmcr1glake4xm2kdnfbt" title=""  />

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
