---
slug: /migrate-between-clusters
beta: FALSE
notebook: FALSE
token: MTqjwwUKhiyns4kGV7Lc7PRlnwb
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Migrate Between Clusters

Zilliz Cloud supports migrating data between Zilliz Cloud clusters. You can seamlessly transfer data from a serverless cluster to a dedicated cluster or between two dedicated clusters.

## From serverless to dedicated cluster{#from-serverless-to-dedicated-cluster}

To gain enhanced control over resources and performance beyond what a serverless cluster offers, consider transitioning your business from a serverless cluster to a dedicated cluster.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Ensure your payment method is set up to access this feature.</p></li>
<li><p>You can make use of the migration between clusters to change the CU settings for your data.</p></li>
</ul>

</Admonition>

In the __Actions__ drop-down button, select __Migrate to Dedicated Cluster.__

On the page that opens,

- Select the subscription plan and __Target Project__,

- Enter the __Cluster Name__ and password,

- Specify the __Cloud Provider__ and __Cloud Region__, and

- Determine the __CU settings__.

![migrate-to-dedicated](/img/migrate-to-dedicated.png)

After filling out the details, click __Migrate Cluster__. Zilliz Cloud will then create a dedicated cluster with the specified settings, initiating the data migration from the serverless cluster.

The dedicated cluster status will switch from __CREATING__ to __RESTORING__, and finally to __RUNNING__. Upon completion, you can connect to the dedicated cluster and access the migrated data. See [Connect to Cluster](./connect-to-cluster) for further details.

## From dedicated to another dedicated cluster{#from-dedicated-to-another-dedicated-cluster}

By migrating between dedicated clusters, you can modify your cluster type, region, and scale down your cluster at ease, without interrupting your business on the original cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is accessible to users on the Standard or Enterprise plans.</p>

</Admonition>

1. Navigate to your target cluster. On the __Cluster Details__ page, click __Actions__ in the upper right corner, and then click __Migrate From__. Select __Dedicated Cluster__.

1. In the dialogue box,

    1. Select your __Source Project__, __Source Cluster__, and __Source Collection__.

    1. Verify the information of the target cluster.

    1. Click __Confirm__ to proceed. (Note: Only a running dedicated cluster can be chosen as the data migration source.)

1. In the __Migration Records__, view the new migration record that appears. The status of this record will change from __MIGRATING__ to __SUCCESSFUL__ once the data migration is complete.

    ![cross-cluster-migration-en](/img/cross-cluster-migration-en.png)

1. After the migration, click __Show Collection__ under the __Action__ column of this migration record to view the details of the migrated collection.

    ![view-collection-details-en](/img/view-collection-details-en.png)

## Related topics{#related-topics}

- [Search, Query & Get](./search-query-get)

- [Insert, Upsert & Delete](./insert-update-delete)

- [AUTOINDEX Explained](./autoindex-explained) 

