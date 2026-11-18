---
title: "Manage Snapshots (Console) | Cloud"
slug: /manage-snapshots-console
sidebar_label: "Manage Snapshots (Console)"
beta: ON REQUEST
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "Instead of managing snapshots programmatically using SDKs, you can also manage them in the Zilliz Cloud console. In this guide, you will learn how to create a snapshot, restore it to a new collection, drop it, and configure snapshot policies for Zilliz Cloud to create snapshots on a schedule. | Cloud"
type: origin
token: PSK1wxf6Qi2EENkCjc2cyNBSn0g
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Manage Snapshots (Console)

Instead of managing snapshots programmatically using SDKs, you can also manage them in the Zilliz Cloud console. In this guide, you will learn how to create a snapshot, restore it to a new collection, drop it, and configure snapshot policies for Zilliz Cloud to create snapshots on a schedule.

<Admonition type="info" title="Note">

This feature is available only for Dedicated clusters.

</Admonition>

## Create a snapshot\{#create-a-snapshot}

In this demo, you are going to create a snapshot of the collection named **medium_articles** in a dedicated cluster named **Dedicated-02**.

<Supademo id="cmwlhd6h70406qmp5nxi8f8p5" title=""  />

<Procedures>

1. Click **Serving Clusters** in the left navigation tree.

1. Click the name of the target collection in the cluster tree.

1. Click the **Snapshots** tab.

1. Click **+ Snapshot** to create a snapshot of this collection

1. In the prompted **Create snapshot** dialog, set the name and optional description for the snapshot to create.

1. Click **Create**.

</Procedures>

## Restore a snapshot\{#restore-a-snapshot}

With a listed snapshot, you can restore it to a new collection.

<Supademo id="cmwlhrk0n0001qmbeoz4dmv8n" title=""  />

<Procedures>

1. Locate the target snapshot in the **Snapshots** tab.

1. Click **...** In **Actions**, and click **Restore** from the drop-down list.

1. In the prompted **Restore snapshot** dialog, 

    1. Set the target database.

    1. Set the new collection name.

1. Click **Restore**.

1. Monitor the restoration progress until its status changes to **Successful**.

</Procedures>

## Drop a snapshot\{#drop-a-snapshot}

You can drop a snapshot you no longer need.

<Supademo id="cmwli4yvy001bqmbe279hp4w6" title=""  />

<Procedures>

1. Locate the target snapshot in the **Snapshots** tab.

1. Click **...** In **Actions** and click **Delete** from the drop-down list.

1. In the prompted **Delete snapshot** dialog,

    1. Copy the target snapshot's name

    1. Paste it in the textbox below.

1. Click **Delete**.

</Procedures>

## Configure schedule policies\{#configure-schedule-policies}

As an alternative, you can configure schedule policies for Zilliz Cloud to create snapshots for your collections.

<Supademo id="cmwlihgrl004gqmbehn5lg209" title=""  />

<Procedures>

1. Click the **Snapshots** tab in the target collection.

1. Switch on **Snapshot policy**.

1. In the prompted **Snapshot Policy Settings** dialog,

    1. Set the time zone for the current policy

    1. Choose between the **Basic** and **Advanced** modes.

        - In **Basic** mode, you can set the frequency, weekdays, and time at which Zilliz Cloud creates snapshots periodically.

        - Alternatively, you can use a cron expression, such as `0 9 * * 1-5`,  in **Advanced** mode to indicate the interval. For details, refer to [Understand Cron Expressions](./cron-expression).

1. Click **Delete**.

</Procedures>