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

import Procedures from '@site/src/components/Procedures';

# 外部コレクションの管理（コンソール）

このページでは、Zilliz Cloud Web コンソールから外部コレクションを管理する方法について説明します。

## 外部コレクションの作成\{#create-an-external-collection}

作業を開始する前に、[外部ボリューム](./external-volume)が作成済みであることを確認してください。

<Supademo id="cmokttyiy05dxpimdm3d8vnxv" title=""  />

<Procedures>

1. 対象のデータベースに移動します。Serving クラスター または On-Demand Compute でデータベースを選択できます。

1. **...** をクリックし、**Create コレクション** を選択します。

1. 外部コレクションを設定します。

1. **Create** をクリックします。

</Procedures>

<Admonition type="info" title="Notes">

- オンデマンドコンピューティング用データベースで作成された外部コレクションでは、インデックスの削除はサポートされていません。

- 外部コレクションを作成できるのは、オンデマンドコンピューティング用データベースに限られます。サービング Dedicated クラスターでの外部コレクション作成サポートは、近日公開予定です。

</Admonition>

## データの更新\{#refresh-data}

![ZEAOwzCoThf80KbhYbgcsJgJnhg](https://zdoc-images.s3.us-west-2.amazonaws.com/ZEAOwzCoThf80KbhYbgcsJgJnhg.png)

<Procedures>

1. 対象の外部コレクションに移動します。

1. **Refresh** をクリックします。

1. 情報を確認し、**Refresh** をクリックします。

</Procedures>

## クエリモードの有効化\{#enable-query-mode}

作業を開始する前に、ベクトルインデックスが削除済みであることを確認してください。

![ZF6gw5l8rh3zT9bsgv8c52Y5nNb](https://zdoc-images.s3.us-west-2.amazonaws.com/ZF6gw5l8rh3zT9bsgv8c52Y5nNb.png)

<Procedures>

1. 対象の外部コレクションに移動します。

1. **Query Mode** の横にあるスイッチをオンにします。

1. **Enable** をクリックします。

</Procedures>

## 外部コレクションの削除\{#drop-an-external-collection}

外部コレクションを削除しても、Zilliz Cloud 上のスキーマ、マニフェスト、インデックスのみが削除されます。データ自体はオブジェクトストレージにそのまま保持されます。

<Supademo id="cmokvd5hr06grpimd8ugly112" title=""  />

<Procedures>

1. 対象の外部コレクションに移動します。

1. **Actions** をクリックし、**Drop** を選択します。

1. コレクション名を入力し、**Drop** をクリックします。

</Procedures>
