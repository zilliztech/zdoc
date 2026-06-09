---
title: "Manage External Collections (Console) | Cloud"
slug: /manage-external-collections-console
sidebar_label: "On Console"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page covers how to manage an external collection via the Zilliz Cloud web console. | Cloud"
type: origin
token: W04nwxHqNiqyrykxMZOcu4ianle
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - external collection
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Manage External Collections (Console)

This page covers how to manage an external collection via the Zilliz Cloud web console.

## Create an external collection\{#create-an-external-collection}

Before you start, ensure you have created an [external volume](./external-volume).

<Supademo id="cmokttyiy05dxpimdm3d8vnxv" title=""  />

<Admonition type="info" icon="📘" title="Notes">

<p>External collections created in an on-demand compute database do not support dropping indexes.</p>

</Admonition>

## Refresh data\{#refresh-data}

![ZEAOwzCoThf80KbhYbgcsJgJnhg](https://zdoc-images.s3.us-west-2.amazonaws.com/ZEAOwzCoThf80KbhYbgcsJgJnhg.png)

## Enable query mode\{#enable-query-mode}

Before you start, ensure you have deleted the vector index.

![ZF6gw5l8rh3zT9bsgv8c52Y5nNb](https://zdoc-images.s3.us-west-2.amazonaws.com/ZF6gw5l8rh3zT9bsgv8c52Y5nNb.png)

## Drop an external collection\{#drop-an-external-collection}

Dropping an external collection will only remove the schema, manifest, and indexes on Zilliz Cloud. Your data remains intact in your object storage.

<Supademo id="cmokvd5hr06grpimd8ugly112" title=""  />

