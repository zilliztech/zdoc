---
title: "Manage External Collections (Console) | Cloud"
slug: /manage-external-collections-console
sidebar_label: "Manage External Collections (Console)"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page covers how to manage an external collection via the Zilliz Cloud web console. | Cloud"
type: origin
token: W04nwxHqNiqyrykxMZOcu4ianle
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Manage External Collections (Console)

This page covers how to manage an external collection via the Zilliz Cloud web console.

## Create an external collection\{#create-an-external-collection}

Before you start, ensure you have created an [external volume](./external-volume).

<Supademo id="cmokttyiy05dxpimdm3d8vnxv" title=""  />

<Procedures>

1. Navigate to your target database. You can either select a database in Serving Clusters or in On-Demand Compute.

1. Click on **...** and select **Create Collection**.

1. Configure your external collection.

1. Click on **Create**.

</Procedures>

<Admonition type="info" title="Notes">

- External collections created in an on-demand compute database do not support dropping indexes.

- You can create an external collection only in an on-demand compute database. Support for creating external collections in serving Dedicated clusters is coming soon.

<NextChannel action="include">

- Creating an external collection from a collection on another serving cluster (the `milvus://` source) is currently available through SDKs and the RESTful API only — the console does not support this source type.

</NextChannel>

</Admonition>

## Refresh data\{#refresh-data}

![ZEAOwzCoThf80KbhYbgcsJgJnhg](https://zdoc-images.s3.us-west-2.amazonaws.com/ZEAOwzCoThf80KbhYbgcsJgJnhg.png)

<Procedures>

1. Navigate to your target external collection.

1. Click on **Refresh**.

1. Read the information and click on **Refresh**.

</Procedures>

## Enable query mode\{#enable-query-mode}

Before you start, ensure you have deleted the vector index.

![ZF6gw5l8rh3zT9bsgv8c52Y5nNb](https://zdoc-images.s3.us-west-2.amazonaws.com/ZF6gw5l8rh3zT9bsgv8c52Y5nNb.png)

<Procedures>

1. Navigate to your target external collection.

1. Turn on the switch next to **Query Mode**.

1. Click on **Enable**.

</Procedures>

## Drop an external collection\{#drop-an-external-collection}

Dropping an external collection will only remove the schema, manifest, and indexes on Zilliz Cloud. Your data remains intact in your object storage.

<Supademo id="cmokvd5hr06grpimd8ugly112" title=""  />

<Procedures>

1. Navigate to your target external collection.

1. Click on **Actions** and then select **Drop**.

1. Enter the collection name and click on **Drop**.

</Procedures>