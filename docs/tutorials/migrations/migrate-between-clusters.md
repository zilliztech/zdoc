---
slug: /migrate-between-clusters
beta: FALSE
notebook: FALSE
type: origin
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 3

---

import Admonition from '@theme/Admonition';


# Migrate Between Clusters

Zilliz Cloud supports migrating data between Zilliz Cloud clusters. You can seamlessly transfer data from a serverless cluster to a dedicated cluster or between two dedicated clusters.

## From dedicated cluster to serverless cluster{#from-dedicated-cluster-to-serverless-cluster}

To experience the new Serverless cluster, consider transitioning your business from a dedicated cluster to a serverless cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>Ensure your payment method is set up to access this feature.</p>

</Admonition>

Navigate to the dedicated cluster to migration. Switch to **Migrations** tab. In the **Migrate** drop-down button, select **Migrate to a New Serverless Cluster.**

On the page that opens,

- Select the **Serverless** plan and **Target Project**,

- Enter the **Cluster Name**.

![migrate-from-dedicated-to-serverless](/img/migrate-from-dedicated-to-serverless.png)

After filling out the details, click **Migrate**. Zilliz Cloud will then create a a new serverless cluster with the specified settings, initiating the data migration from the dedicated cluster.

The serverless cluster status will switch from **CREATING** to **RESTORING**, and finally to **RUNNING**. Upon completion, you can connect to the new serverless cluster and access the migrated data. See [Connect to Cluster](./connect-to-cluster) for further details.

## From dedicated to another dedicated cluster{#from-dedicated-to-another-dedicated-cluster}

By migrating between dedicated clusters, you can modify your cluster type, region, and scale down your cluster at ease, without interrupting your business on the original cluster.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>This feature is accessible to users on the Dedicated (Standard) or Dedicated (Enterprise) plans.</p></li>
<li><p>You can make use of the migration between clusters to change the CU settings for your data.</p></li>
</ul>

</Admonition>

1. Navigate to your target cluster. On the **Cluster Details** page, click **Actions** in the upper right corner, and then click **Migrate From**. Select **Dedicated Cluster**.

1. In the dialogue box,

    1. Select your **Source Project**, **Source Cluster**, and **Source Collection**.

    1. Verify the information of the target cluster.

    1. Click **Confirm** to proceed. (Note: Only a running dedicated cluster can be chosen as the data migration source.)

1. In the **Migration Records**, view the new migration record that appears. The status of this record will change from **MIGRATING** to **SUCCESSFUL** once the data migration is complete.

    ![cross-cluster-migration-en](/img/cross-cluster-migration-en.png)

1. After the migration, click **Show Collection** under the **Action** column of this migration record to view the details of the migrated collection.

    ![view-collection-details-en](/img/view-collection-details-en.png)

## Related topics{#related-topics}

- [Search, Query & Get](./search-query-get)

- [Insert, Upsert & Delete](./insert-update-delete)

- [AUTOINDEX Explained](./autoindex-explained) 

