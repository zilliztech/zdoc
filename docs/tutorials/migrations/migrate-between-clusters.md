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

Zilliz Cloud allows you to seamlessly transfer data between two Dedicated clusters.

By migrating between dedicated clusters, you can modify your cluster type, region, and scale down your cluster at ease, without interrupting your business on the original cluster.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>This feature is accessible to users on the Dedicated (Standard) or Dedicated (Enterprise) plans.</p></li>
<li><p>You can make use of the migration between clusters to change the CU settings for your data.</p></li>
</ul>

</Admonition>

1. On the **Migrations** tab of the cluster page, choose **Migrate** > **Migrate from a Dedicated Cluster**.

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

