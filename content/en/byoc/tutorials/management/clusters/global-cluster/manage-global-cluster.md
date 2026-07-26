---
title: "Manage Global Cluster | BYOC"
slug: /manage-global-cluster
sidebar_label: "Manage Global Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page explains how to add and delete secondary clusters, convert a global cluster to a regular cluster, and drop a global cluster entirely. | BYOC"
type: origin
token: DW9wwFlgAiwOhBk2PgucY4URnke
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Manage Global Cluster

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only on Business Critical (SaaS) and BYOC deployments.

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is available in all AWS regions and in the following Google Cloud regions: gcp-us-central1 and gcp-us-east4. It is not available on Microsoft Azure.

</FeatureNote>

This page explains how to add and delete secondary clusters, convert a global cluster to a regular cluster, and drop a global cluster entirely.

## Before you start\{#before-you-start}

- Ensure you are a **Project Admin**.

- Note that the both the primary and secondary clusters cannot be suspended.

## Add secondary cluster\{#add-secondary-cluster}

To improve regional coverage, you can add additional secondary clusters in different regions to an existing global cluster.

<Admonition type="info" icon="📘" title="Notes">

A global cluster can only have up to 5 secondary clusters.

</Admonition>

Once you add a new secondary cluster, Zilliz Cloud provisions it and begins replicating data from the primary. The new secondary cluster appears in CREATING status and transitions to RUNNING once the initial data sync completes.

- **Via web console**

    The following demo shows how to add one or more secondary clusters.

    <Supademo id="cmkat4dkp1h55ke4xyc8i7c9y" title=""  />

- **Via RESTful API**

    The following example adds a new secondary cluster named `secondary-cluster-ap` deployed in AWS ap-southeast-1. For details about the API, see [Add Secondary Clusters](/reference/restful/add-secondary-clusters-v2).

    ```bash
    curl --request POST \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/secondaryClusters" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw '{
        "secondaryClusters": [
          {
            "clusterName": "secondary-cluster-ap",
            "regionId": "aws-ap-southeast-1"
          }
        ]
      }'
    ```

    The following is an example output.

    ```bash
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxxxxxxxxxx"
      }
    }
    ```

## Drop secondary cluster\{#drop-secondary-cluster}

You can drop a secondary cluster when you no longer need coverage in that region or want to reduce costs.

Once you drop a secondary cluster,

- The deleted secondary cluster is removed from the global cluster topology.

- Data replication to that cluster stops immediately.

You can drop a secondary cluster either via the web console or RESTful API.

- **Via web console**

    The following screenshot shows how to drop a secondary cluster.

    ![KjCvwgeZWhTEHnb1t3Pc1NoXnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/KjCvwgeZWhTEHnb1t3Pc1NoXnCb.png)

- **Via RESTful API**

    The following example removes a secondary cluster. For details about the API, see [Delete Global Member Cluster](/reference/restful/delete-global-member-cluster-v2).

    ```bash
    curl --request DELETE \
      --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/clusters/in01-xxxxxxxxxxxxxxx" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "Accept: application/json"
    ```

    The following is an example output.

    ```bash
    {
      "code": 0,
      "data": {
        "globalClusterId": "glo-xxxxxxxxxxxxxxxx",
        "clusterId": "in01-xxxxxxxxxxxxxxx",
        "prompt": "The cluster has been deleted. If you consider this action to be an error, you have the option to restore the deleted cluster from the recycle bin within a 30-day period. Kindly note, this recovery feature does not apply to free clusters."
      }
    }
    ```

## Convert a global cluster to a regular cluster\{#convert-a-global-cluster-to-a-regular-cluster}

If you no longer need multi-region capabilities but want to keep the primary cluster and its data, you can convert a global cluster back to a regular Dedicated cluster. 

To convert a global cluster to a regular cluster, you need to:

<Procedures>

1. [Drop](./manage-global-cluster#drop-secondary-cluster) all secondary clusters.

1. On the **Global Cluster** page, click on **Remove Global Endpoint** from the **Actions** dropdown.

    ![Qg0Mw7gCGh9vlfbMpxockJPVnUg](https://zdoc-images.s3.us-west-2.amazonaws.com/Qg0Mw7gCGh9vlfbMpxockJPVnUg.png)

</Procedures>

You can also remove the global endpoint via RESTful API. The following is an example. For details, see [Remove Global Endpoint](/reference/restful/remove-global-endpoint-v2).

```bash
curl --request POST \
  --url "https://api.cloud.zilliz.com/v2/globalClusters/glo-xxxxxxxxxxxxxxxx/removeGlobalEndpoint" \
  --header "Authorization: Bearer ${API_KEY}" \
  --header "Accept: application/json"
```

Once the global endpoint is removed, any application connected via the global endpoint will be disconnected immediately. Please ensure to update the connection endpoint in your application code. The following table shows what happens after the conversion.

| **Item** | **Behavior** |
| --- | --- |
| Global endpoint | Deleted immediately. Clients using it are disconnected. |
| Primary cluster | Becomes a regular Dedicated cluster. Continues running with all data intact. |
| Data replication | Stopped. Data replication metrics are removed. |
| Global cluster metadata | Cleared (global cluster ID, topology). |
| Backup policy | Remains on the former primary cluster, unchanged. |
| Billing | [Data transfer](./data-transfer-cost) charges stop. The remaining cluster is billed as a regular [Dedicated cluster](./dedicated-cluster-cost). |

## Drop global cluster\{#drop-global-cluster}

To drop a global cluster entirely, [drop all secondary clusters](./manage-global-cluster#drop-secondary-cluster) first, then drop the primary cluster. The global cluster is automatically removed when the primary cluster is deleted.

