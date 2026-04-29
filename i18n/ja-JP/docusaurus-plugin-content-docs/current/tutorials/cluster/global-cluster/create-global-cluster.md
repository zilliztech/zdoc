---
title: "グローバルクラスターの作成 | Cloud"
slug: /create-global-cluster
sidebar_key: create-global-cluster
sidebar_label: "グローバルクラスターの作成"
beta: FALSE
notebook: FALSE
description: "このガイドでは、グローバルクラスターを作成する方法について説明します。 | Cloud"
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

このガイドでは、グローバルクラスターを作成する方法について説明します。

既存のクラスターでグローバルクラスター機能を有効にする必要がある場合は、[クラスターの管理](./manage-cluster#convert-to-a-global-cluster) をご覧ください。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>ビジネスクリティカル</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 開始前に\{#before-you-start}

- **プロジェクト管理者** であることを確認してください。

## グローバルクラスターの作成\{#create-a-global-cluster}

**クラスター設定** で **グローバルクラスター** の横にあるスイッチをオンにし、グローバルクラスターの名前を入力します。グローバルクラスターには、**1 つのプライマリークラスター** と **1 つから 5 つのセカンダリークラスター** が必要です。

クラウドプロバイダー、クラスタイプ、クエリ CU 数は、プライマリークラスターと一致している必要があります。

グローバルクラスター内のセカンダリークラスターのリージョンは、[プロジェクト](./manage-projects) でサポートされているリージョンに限定されます。

以下のデモでは、Web コンソール経由でグローバルクラスターを作成する方法を示しています。

<Supademo id="cmkasmmcr1glake4xm2kdnfbt" title=""  />

グローバルクラスターを作成すると、Zilliz Cloud は以下の処理を行います。

1. グローバルクラスターとそのプライマリークラスターおよびセカンダリークラスターをプロビジョニングします。すべてのプライマリークラスターとセカンダリークラスターは **CREATING** 状態として表示されます。

1. プライマリークラスターとセカンダリークラスターの両方のプロビジョニングが完了すると、クラスターは **RUNNING** 状態になり、データレプリケーションをサポートします。

**グローバルクラスター** ページの **グローバルトポロジー** タブで、データ同期のステータスと遅延を監視できます。

![CLpZwH1e3hd3F1bIXisc6u7GnDg](https://zdoc-images.s3.us-west-2.amazonaws.com/CLpZwH1e3hd3F1bIXisc6u7GnDg.png)