---
title: "Manage Global Cluster | Cloud"
slug: /manage-global-cluster
sidebar_label: "Manage Global Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page explains how to add and delete secondary clusters, convert a global cluster to a regular cluster, and drop a global cluster entirely. | Cloud"
type: origin
token: DW9wwFlgAiwOhBk2PgucY4URnke
sidebar_position: 7
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - global cluster
  - manage
  - convert to regular cluster
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Manage Global Cluster

This page explains how to add and delete secondary clusters, convert a global cluster to a regular cluster, and drop a global cluster entirely.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters in a <strong>Business Critical</strong> project.</p>

</Admonition>

## Before you start\{#before-you-start}

- Ensure you are a **Project Admin**.

- Note that the both the primary and secondary clusters cannot be suspended.

## Add secondary cluster\{#add-secondary-cluster}

To improve regional coverage, you can add additional secondary clusters in different regions to an existing global cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>A global cluster can only have up to 5 secondary clusters.</p>

</Admonition>

Once you add a new secondary cluster, Zilliz Cloud provisions it and begins replicating data from the primary. The new secondary cluster appears in CREATING status and transitions to RUNNING once the initial data sync completes.

The following demo shows how to add one or more secondary clusters.

<Supademo id="cmkat4dkp1h55ke4xyc8i7c9y" title=""  />

## Drop secondary cluster\{#drop-secondary-cluster}

You can drop a secondary cluster when you no longer need coverage in that region or want to reduce costs.

Once you drop a secondary cluster,

- The deleted secondary cluster is removed from the global cluster topology.

- Data replication to that cluster stops immediately.

The following screenshot shows how to drop a secondary cluster.

![KjCvwgeZWhTEHnb1t3Pc1NoXnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/KjCvwgeZWhTEHnb1t3Pc1NoXnCb.png)

## Convert a global cluster to a regular cluster\{#convert-a-global-cluster-to-a-regular-cluster}

If you no longer need multi-region capabilities but want to keep the primary cluster and its data, you can convert a global cluster back to a regular Dedicated cluster. 

To convert a global cluster to a regular cluster, you need to:

<Procedures>

1. [Drop](./manage-global-cluster#drop-secondary-cluster) all secondary clusters.

1. On the **Global Cluster** page, click on **Remove Global Endpoint** from the **Actions** dropdown.

    ![Qg0Mw7gCGh9vlfbMpxockJPVnUg](https://zdoc-images.s3.us-west-2.amazonaws.com/Qg0Mw7gCGh9vlfbMpxockJPVnUg.png)

</Procedures>

Once the global endpoint is removed, any application connected via the global endpoint will be disconnected immediately. Please ensure to update the connection endpoint in your application code. The following table shows what happens after the conversion.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Behavior</strong></p></th>
   </tr>
   <tr>
     <td><p>Global endpoint</p></td>
     <td><p>Deleted immediately. Clients using it are disconnected.</p></td>
   </tr>
   <tr>
     <td><p>Primary cluster</p></td>
     <td><p>Becomes a regular Dedicated cluster. Continues running with all data intact.</p></td>
   </tr>
   <tr>
     <td><p>Data replication</p></td>
     <td><p>Stopped. Data replication metrics are removed.</p></td>
   </tr>
   <tr>
     <td><p>Global cluster metadata</p></td>
     <td><p>Cleared (global cluster ID, topology).</p></td>
   </tr>
   <tr>
     <td><p>Backup policy</p></td>
     <td><p>Remains on the former primary cluster, unchanged.</p></td>
   </tr>
   <tr>
     <td><p>Billing</p></td>
     <td><p>Data transfer charges stop. The remaining cluster is billed as a regular Dedicated cluster.</p></td>
   </tr>
</table>

## Drop global cluster\{#drop-global-cluster}

To drop a global cluster entirely, [drop all secondary clusters](./manage-global-cluster#drop-secondary-cluster) first, then drop the primary cluster. The global cluster is automatically removed when the primary cluster is deleted.

