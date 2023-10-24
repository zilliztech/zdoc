---
slug: /migrate-beween-clusters
beta: FALSE
notebook: FALSE
sidebar_position: 3
---



# Migrate Between Clusters

Zilliz Cloud supports migrating data between Zilliz Cloud clusters. More specifically, you can migrate data from a serverless cluster to a dedicated cluster or between two dedicated clusters.

## From serverless to dedicated cluster{#from-serverless-to-dedicated-cluster}

:::info Notes

This feature is available once you set up your payment method.

:::

In the **Actions** drop-down button, select **Migrate to Dedicated Cluster.**

On the page that opens,

- Select the subscription plan and **Target Project**,

- Enter the **Cluster Name** and password,

- Specify the **Cloud Provider** and **Cloud Region**, and

- Determine the **CU settings**.

![migrate-to-dedicated](/img/migrate-to-dedicated.png)

After you complete the form and click on **Migrate Cluster**, Zilliz Cloud creates a dedicated cluster based on the specified settings and migrates data from the serverless cluster to the dedicated one.

The dedicated cluster status will switch from **CREATING** to **RESTORING**, and finally to **RUNNING**. Once this is complete, you can connect to the dedicated cluster and manipulate the restored data.

## From dedicated to another dedicated cluster{#from-dedicated-to-another-dedicated-cluster}

:::info Notes

This feature is only available to users subscribing to the Standard or Enterprise plan. 

:::

1. Enter your target cluster. In the upper right corner of the **Cluster Details** page, click Actions. Then click **Migrate From**. Select** Dedicated Cluster**.

1. In the dialogue box, choose your **Source Project**, **Source Cluster**, and **Source Collection**. Check the information of the target cluster. Click **Confirm** to continue. Note that you can only choose a running dedicated cluster as the source of your data migration.

1. In the **Migration Records**, you can see that a new migration record has been generated. When the status of this record changes from **MIGRATING** to **SUCCESSFUL**, your data migration is completed. 
    ![cross-cluster-migration-en](/img/cross-cluster-migration-en.png)

1. Once the data is migrated from the source cluster to the target cluster, you can view the details of migrated collections by clicking **Show Collection** under the action column of this migration record.
    ![view-collection-details-en](/img/view-collection-details-en.png)

