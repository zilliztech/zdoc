---
title: "グローバルクラスターの作成 | Cloud"
slug: /create-global-cluster
sidebar_key: create-global-cluster
sidebar_label: "グローバルクラスターを作成"
beta: FALSE
notebook: FALSE
description: "このガイドでは、グローバルクラスターの作成方法について説明します。 | Cloud"
type: origin
token: MZ2WwklE5ifX4hkO4ZOcXz0indc
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - milvus
  - グローバルクラスター
  - ディザスタリカバリ
  - 高可用性
  - マルチリージョン

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# グローバルクラスターの作成

このガイドでは、グローバルクラスターの作成方法について説明します。

既存のクラスターでグローバルクラスター機能を有効化する必要がある場合は、[クラスターの管理](./manage-cluster#convert-to-a-global-cluster) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクトの <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 開始前に\{#before-you-start}

- **プロジェクト管理者** であることを確認してください。

## グローバルクラスターの作成\{#create-a-global-cluster}

**クラスター設定** で **グローバルクラスター** の横にあるスイッチをオンにし、グローバルクラスターの名前を入力します。グローバルクラスターには **1 つのプライマリークラスター** と **1 ～ 5 つのセカンダリークラスター** が必要です。

クラウドプロバイダー、クラスタータイプ、クエリ CU 数は、プライマリークラスターと一致している必要があります。

グローバルクラスター のセカンダリークラスターのリージョンは、[プロジェクト](./manage-projects) でサポートされているリージョンに制限されます。

以下のデモでは、Web コンソールからグローバルクラスターを作成する方法を示しています。

<Supademo id="cmkasmmcr1glake4xm2kdnfbt" title=""  />

グローバルクラスターを作成すると、Zilliz Cloud は以下を実行します。

1. グローバルクラスターとそのプライマリークラスターおよびセカンダリークラスターの両方をプロビジョニングします。すべてのプライマリークラスターとセカンダリークラスターは **CREATING** ステータスで表示されます。

1. プライマリークラスターとセカンダリークラスターの両方のプロビジョニングが完了すると、クラスターは **RUNNING** ステータスで表示され、データレプリケーションをサポートします。

データ同期ステータスと遅延は、**グローバルクラスター** ページの **グローバルトポロジー** タブで監視できます。
