---
title: "外部コレクションの管理（コンソール） | BYOC"
slug: /manage-external-collections-console
sidebar_label: "外部コレクションの管理（コンソール）"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud Web コンソールから外部コレクションを管理する方法について説明します。 | BYOC"
type: origin
token: W04nwxHqNiqyrykxMZOcu4ianle
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# 外部コレクションの管理（コンソール）

このページでは、Zilliz Cloud Web コンソールから外部コレクションを管理する方法について説明します。

## 外部コレクションの作成\{#create-an-external-collection}

作業を開始する前に、[外部ボリューム](./external-volume)が作成済みであることを確認してください。

<Supademo id="cmokttyiy05dxpimdm3d8vnxv" title=""  />

<Admonition type="info" icon="📘" title="Notes">

- オンデマンドコンピューティングデータベースで作成された外部コレクションでは、インデックスの削除はサポートされていません。

- 外部コレクションを作成できるのは、オンデマンドコンピューティングデータベースのみです。サービングDedicatedクラスターでの外部コレクション作成サポートは近日公開予定です。

</Admonition>

## データの更新\{#refresh-data}

![ZEAOwzCoThf80KbhYbgcsJgJnhg](https://zdoc-images.s3.us-west-2.amazonaws.com/ZEAOwzCoThf80KbhYbgcsJgJnhg.png)

## クエリモードの有効化\{#enable-query-mode}

作業を開始する前に、ベクトルインデックスが削除済みであることを確認してください。

![ZF6gw5l8rh3zT9bsgv8c52Y5nNb](https://zdoc-images.s3.us-west-2.amazonaws.com/ZF6gw5l8rh3zT9bsgv8c52Y5nNb.png)

## 外部コレクションの削除\{#drop-an-external-collection}

外部コレクションを削除しても、Zilliz Cloud 上のスキーマ、マニフェスト、インデックスのみが削除されます。データ自体はオブジェクトストレージにそのまま保持されます。

<Supademo id="cmokvd5hr06grpimd8ugly112" title=""  />

