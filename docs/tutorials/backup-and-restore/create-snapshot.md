---
slug: /create-snapshot
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Create Snapshot

Snapshots are point-of-time backup copies of a managed cluster on Zilliz Cloud. You can use it as a baseline for new clusters or just for data backup.

<Admonition type="info" icon="📘" title="Notes">

Snapshots are supported only for the **Standard** and **Enterprise** tiers. If your cluster runs on the **Serverless** tier, upgrade it first. For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

</Admonition>

## Create snapshot{#create-snapshot}

Snapshots occur asynchronously and the time it takes to take one varies depending on the size of the cluster and the size of the CUs accommodating the cluster. For example, a single-collection cluster holding over 120 million records of 128-dimensional vectors on a 4-CU instance takes approximately 5 minutes to create a snapshot.

You can take a snapshot of your cluster based on the following figure. Your cluster is still in service while Zilliz Cloud is taking the snapshot.

![create-snapshot](/img/create-snapshot.png)

## Adjust snapshot retention period{#adjust-snapshot-retention-period}

You can determine how long Zilliz Cloud keeps your snapshot by setting **Retention Period** in days. Currently, the default retention period is 7 days, with a maximum of 30 days.

<Admonition type="info" icon="📘" title="Notes">

Data transfer used to create the snapshots is separately charged at the rate of **$0.025/GB**. For example, a 20 GB snapshot will incur a one-time data transfer charge of **$0.025 x 20 = $0.5**. Currently, a snapshot can live on Zilliz Cloud for up to 30 days free of charge.

</Admonition>

## Related topics{#related-topics}

- [Schedule Automatic Backups](./schedule-automatic-backups) 

- [View Snapshot Details](./view-snapshot-details) 

- [Restore from Snapshot](./restore-from-snapshot) 

- [Delete Snapshot](./delete-snapshot) 
