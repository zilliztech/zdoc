---
slug: /migrate-beween-clusters
beta: FALSE
notebook: FALSE
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Migrate Between Clusters

Zilliz Cloud supports migrating data between Zilliz Cloud clusters. You can seamlessly transfer data from a serverless cluster to a dedicated cluster or between two dedicated clusters.

## From serverless to dedicated cluster{#from-serverless-to-dedicated-cluster}

<Admonition type="info" icon="📘" title="Notes">

Ensure your payment method is set up to access this feature.

</Admonition>

In the **Actions** drop-down button, select **Migrate to Dedicated Cluster.**

On the page that opens,

- Select the subscription plan and **Target Project**,

- Enter the **Cluster Name** and password,

- Specify the **Cloud Provider** and **Cloud Region**, and

- Determine the **CU settings**.

![migrate-to-dedicated](/img/migrate-to-dedicated.png)

After filling out the details, click **Migrate Cluster**. Zilliz Cloud will then create a dedicated cluster with the specified settings, initiating the data migration from the serverless cluster.

The dedicated cluster status will switch from **CREATING** to **RESTORING**, and finally to **RUNNING**. Upon completion, you can connect to the dedicated cluster and access the migrated data. See [Connect to Cluster](./connect-to-cluster) for further details.

## From dedicated to another dedicated cluster{#from-dedicated-to-another-dedicated-cluster}

<Admonition type="info" icon="📘" title="Notes">

This feature is accessible to users on the Standard or Enterprise plans.

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

- [Search, Query, and Get](./search-query-and-get)

- [Insert Entities](./insert-entities)

- [AUTOINDEX Explained](./autoindex-explained)
