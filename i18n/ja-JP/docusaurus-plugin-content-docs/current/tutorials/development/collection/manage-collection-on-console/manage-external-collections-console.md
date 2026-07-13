---
title: "External Collections の管理（Console）| Cloud"
slug: /manage-external-collections-console
sidebar_label: "Console 上"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud web console を使用して external collection を管理する方法について説明します。| Cloud"
type: origin
token: W04nwxHqNiqyrykxMZOcu4ianle
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# External Collections の管理（Console）

このページでは、Zilliz Cloud web console を使用して external collection を管理する方法について説明します。

## external collection を作成する\{#create-an-external-collection}

開始する前に、[external volume](./external-volume) を作成済みであることを確認してください。

<Supademo id="cmokttyiy05dxpimdm3d8vnxv" title=""  />

<Admonition type="info" icon="📘" title="注記">

オンデマンド compute database で作成された external collections は、index の削除をサポートしていません。

</Admonition>

## データを更新する\{#refresh-data}

![ZEAOwzCoThf80KbhYbgcsJgJnhg](https://zdoc-images.s3.us-west-2.amazonaws.com/ZEAOwzCoThf80KbhYbgcsJgJnhg.png)

## query mode を有効にする\{#enable-query-mode}

開始する前に、vector index を削除済みであることを確認してください。

![ZF6gw5l8rh3zT9bsgv8c52Y5nNb](https://zdoc-images.s3.us-west-2.amazonaws.com/ZF6gw5l8rh3zT9bsgv8c52Y5nNb.png)

## external collection を削除する\{#drop-an-external-collection}

external collection を削除しても、Zilliz Cloud 上の schema、manifest、index のみが削除されます。データは object storage 内にそのまま残ります。

<Supademo id="cmokvd5hr06grpimd8ugly112" title=""  />

