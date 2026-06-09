---
title: "Create Global Cluster | Cloud"
slug: /create-global-cluster
sidebar_label: "Create Global Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide explains how to create a global cluster. | Cloud"
type: origin
token: MZ2WwklE5ifX4hkO4ZOcXz0indc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Create Global Cluster

This guide explains how to create a global cluster. 

If you need to enable the global cluster feature for an existing cluster, see [Manage Cluster](./manage-cluster#convert-to-a-global-cluster).

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters in a <strong>Business Critical</strong> project.</p>

</Admonition>

## Before you start\{#before-you-start}

- Ensure you are a **Project Admin**.

## Create a global cluster\{#create-a-global-cluster}

Turn on the switch next to **Global Cluster** in **Cluster Settings** and provide a name for the global cluster. A global cluster must have **1 primary cluster** and **1 to 5 secondary cluster**. 

The cloud provider, cluster type, number of query CU should be consistent with those of the primary cluster.

Secondary cluster regions in a Global Cluster are limited to the regions supported by your [project](./manage-projects). 

The following demo shows how to create a global cluster via the web console.

<Supademo id="cmkasmmcr1glake4xm2kdnfbt" title=""  />

After you create a global cluster, Zilliz Cloud:

1. Provisions a global cluster and both its primary and secondary clusters. All primary and secondary clusters appear in **CREATING** status.

1. Once the provision of both the primary and secondary clusters completes, the clusters appear in **RUNNING** status and supports data replication.

You can monitor the data synchronization status and lag on the **Global Topology** tab of the **Global Cluster** page.

![CLpZwH1e3hd3F1bIXisc6u7GnDg](https://zdoc-images.s3.us-west-2.amazonaws.com/CLpZwH1e3hd3F1bIXisc6u7GnDg.png)