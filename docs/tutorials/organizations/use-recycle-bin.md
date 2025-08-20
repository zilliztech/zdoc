---
title: "Use Recycle Bin | Cloud"
slug: /use-recycle-bin
sidebar_label: "Use Recycle Bin"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud's Recycle Bin feature safeguards your data by keeping a record of all Serverless and Dedicated clusters that have been dropped, whether intentionally or as a result of trial expiration or service suspension. If you have changed your mind or dropped a cluster by mistake, the recycle bin offers a 30-day grace period for cluster restoration. | Cloud"
type: origin
token: JQvjwCDxhiMcj0kpaWicqXsTn1e
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - recycle bin
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source

---

import Admonition from '@theme/Admonition';


# Use Recycle Bin

Zilliz Cloud's Recycle Bin feature safeguards your data by keeping a record of all Serverless and Dedicated clusters that have been dropped, whether intentionally or as a result of trial expiration or service suspension. If you have changed your mind or dropped a cluster by mistake, the recycle bin offers a 30-day grace period for cluster restoration.

To use recycle bin, you must be an **Organization Owner**.

## Prerequisites{#prerequisites}

To restore a cluster in the recycle bin, you need to [add a payment method](/docs/payment-billing).

## Restore a dropped cluster in the recycle bin{#restore-a-dropped-cluster-in-the-recycle-bin}

1. Navigate to the organization the dropped cluster belongs to.

1. Access the **Recycle Bin** via the left navigation menu or the top navigation icon.

1. Locate the cluster to restore. From the **Actions** dropdown, select **Restore Cluster**.

1. Configure the restored cluster.

    1. You can restore the cluster to a different project under this organization, but not in a different cloud region.

    1. You can rename the cluster and reset its size and password for connection.

    <Admonition type="info" icon="📘" title="Notes">

    <p>The load status of the collections in the cluster will be retained.</p>

    </Admonition>

1. Click **Restore**. Zilliz Cloud will start creating the cluster with the specified attributes and restore your data to the created cluster.

1. A new restoration job will be generated. You can check the cluster restoration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the restoration is complete.

![use-recycle-bin](/img/use-recycle-bin.png)

