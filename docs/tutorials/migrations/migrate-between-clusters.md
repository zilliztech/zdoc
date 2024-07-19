---
slug: /migrate-between-clusters
beta: FALSE
notebook: FALSE
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - clusters

---

import Admonition from '@theme/Admonition';


# Cross-Cluster Migrations

Zilliz Cloud allows you to seamlessly transfer data from a serverless cluster to a dedicated cluster or between two Dedicated clusters.

By migrating between clusters, you can modify your cluster type, region, and scale down your cluster at ease, without interrupting your business on the original cluster.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Ensure your <a href="./payment-billing">payment</a><a href="./payment-billing"> method</a> is set up to access this feature.</p></li>
<li><p>Migration between two Dedicated clusters will incur charges. For more details, refer to <a href="./understand-cost#migration-costs">Understand Cost</a>.</p></li>
</ul>

</Admonition>

## From serverless to dedicated cluster{#from-serverless-to-dedicated-cluster}

Dedicated clusters offer a dedicated environment and resources, enabling processing larger datasets with improved performance. Dedicated clusters also provide additional advanced features such as backup and restore, IP address access control, and private networking. Consider transitioning your business from a serverless cluster to a dedicated cluster for these added benefits.

1. Navigate to the **Migrations** tab of a serverless cluster. On the **Cross-Cluster Data Migration** card, choose **Migrate** > **To a New Dedicated Cluster**.

1. In the dialogue box,

    1. Configure the new dedicated cluster by setting the project, cluster name, cloud provider settings, and CU settings.

    1. Verify the information of the new cluster.

    1. Click **Migrate** to proceed.

1. A migration job will be generated. You can view the migration progress on the [Jobs](./job-center) page. When the job status changes from **IN PROGRESS** to **SUCCESSFUL**, the data migration is complete.

1. Click **...** under the **Actions** column of this migration job to view the details of the migrated collection.

## From dedicated to another dedicated cluster{#from-dedicated-to-another-dedicated-cluster}

On Zilliz Cloud, you can either migrate your dedicated cluster to a new or existing dedicated cluster. 

By migrating to a new dedicated clusters, you can modify your cluster type, region, and scale down your cluster at ease, without interrupting your business on the original cluster. 

By migrating to an existing dedicated cluster, you can effectively combine cluster resources.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>This feature is only accessible to users on the Dedicated (Standard) or Dedicated (Enterprise) plans.</li>
</ul>

</Admonition>

### From a dedicated cluster to a new one{#from-a-dedicated-cluster-to-a-new-one}

You can make use of the migration between clusters to change the CU settings for your data.

1. Navigate to the **Migrations** tab of a dedicated cluster. On the **Cross-Cluster Data Migration** card, choose **Migrate** > **To a New Dedicated Cluster**.

1. In the dialogue box,

    1. Configure the new cluster by setting the project, cluster name, cloud provider settings, and CU settings.

    1. Verify the information of the new cluster.

    1. Click **Migrate** to proceed.

1. A migration job will be generated. You can view the migration progress on the [Jobs](./job-center) page. When the job status changes from **IN PROGRESS** to **SUCCESSFUL**, the data migration is complete.

    ![cross-cluster-migration-en](/img/cross-cluster-migration-en.png)

1. Click **...** under the **Actions** column of this migration job to view the details of the migrated collection.

    ![view-collection-details-en](/img/view-collection-details-en.png)

### Between two existing dedicated cluster{#between-two-existing-dedicated-cluster}

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>Before migrating between two existing dedicated clusters, please ensure the two clusters are compatible with the same Milvus version.</li>
</ul>

</Admonition>

1. Navigate to the **Migrations** tab of a dedicated cluster. On the **Cross-Cluster Data Migration** card, choose **Migrate** > **To an Existing Dedicated Cluster**.

1. In the dialogue box,

    1. Select the source collections in the current cluster.

    1. Select your **Target Project** and **Target Cluster**.

    1. Verify the information of the target cluster.

    1. Click **Migrate** to proceed.

1. A migration job will be generated. You can view the migration progress on the [Jobs](./job-center) page. When the job status changes from **IN PROGRESS** to **SUCCESSFUL**, the data migration is complete.

1. Click **...** under the **Actions** column of this migration job to view the details of the migrated collection.

    ![view-collection-details-en](/img/view-collection-details-en.png)

## Related topics{#related-topics}

- [Search, Query & Get](./search-query-get)

- [Insert, Upsert & Delete](./insert-update-delete)

- [AUTOINDEX Explained](./autoindex-explained) 

