---
title: "外部コレクションの管理（コンソール） | Cloud"
slug: /manage-external-collections-console
sidebar_label: "コンソール上"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud Web コンソールを使用して外部コレクションを管理する方法について説明します。 | Cloud"
type: origin
token: W04nwxHqNiqyrykxMZOcu4ianle
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 外部コレクションの管理（コンソール）

このページでは、Zilliz Cloud Web コンソールを使用して外部コレクションを管理する方法について説明します。

## 外部コレクションを作成する\{#create-an-external-collection}

開始する前に、[外部ボリューム](./external-volume) を作成済みであることを確認してください。

<Supademo id="cmokttyiy05dxpimdm3d8vnxv" title=""  />

<Admonition type="info" icon="📘" title="注意">

オンデマンドコンピュートデータベースで作成された外部コレクションでは、インデックスの削除はサポートされていません。

</Admonition>

## データを更新する\{#refresh-data}

![ZEAOwzCoThf80KbhYbgcsJgJnhg](https://zdoc-images.s3.us-west-2.amazonaws.com/ZEAOwzCoThf80KbhYbgcsJgJnhg.png)

## クエリモードを有効にする\{#enable-query-mode}

開始する前に、ベクトルインデックスを削除済みであることを確認してください。

![ZF6gw5l8rh3zT9bsgv8c52Y5nNb](https://zdoc-images.s3.us-west-2.amazonaws.com/ZF6gw5l8rh3zT9bsgv8c52Y5nNb.png)

## 外部コレクションを削除する\{#drop-an-external-collection}

外部コレクションを削除すると、Zilliz Cloud 上のスキーマ、マニフェスト、インデックスのみが削除されます。データ自体はオブジェクトストレージ内にそのまま保持されます。

<Supademo id="cmokvd5hr06grpimd8ugly112" title=""  />

