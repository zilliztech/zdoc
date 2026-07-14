---
title: "エンドポイント経由で Milvus から Zilliz Cloud に移行 | Cloud"
slug: /via-endpoint
sidebar_label: "エンドポイント経由"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、Milvus ベクトルデータベースを自分でインフラ管理することなく利用したいユーザー向けに、フルマネージドなクラウドホスト型ソリューションとして Milvus を提供します。このトピックでは、データベースのエンドポイントを介して Milvus から移行する方法を説明します。 | Cloud"
type: origin
token: PlX3wo82Di6oWVkg2ercRWCUnvV
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# エンドポイント経由で Milvus から Zilliz Cloud に移行

Zilliz Cloud は、[Milvus](https://milvus.io/) を、Milvus ベクトルデータベースを自分でインフラ管理することなく利用したいユーザー向けのフルマネージドなクラウドホスト型ソリューションとして提供します。このトピックでは、データベースのエンドポイントを介して Milvus から移行する方法を説明します。 

## 前提条件\{#prerequisites}

Milvus から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Milvus の要件\{#milvus-requirements}

| 要件 | 詳細 |
| --- | --- |
| バージョン互換性 | Milvus 2.3.6 以降 |
| ネットワークアクセス | ソース Milvus インスタンスがパブリックインターネットからアクセス可能であること |
| 認証資格情報 | 認証が有効な場合はユーザー名とパスワード（[Authenticate User Access](https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access) を参照） |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージおよびコンピュートリソース（CU サイズの見積もりには [CU calculator](https://zilliz.com/pricing#calculator) を使用） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、許可リストに [Zilliz Cloud IPs](./zilliz-cloud-ips) を追加 |

## はじめに\{#getting-started}

以下のデモでは、エンドポイント経由で Milvus からの移行を開始する方法を説明します。

<Supademo id="cmbkiuxw98p13sn1rc65tt6b0" title="Zilliz Cloud - Migrate from Milvus via Endpoint" />

<Admonition type="info" icon="📘" title="注意">

- ソースコレクションですでに全文検索が有効になっている場合、Zilliz Cloud は移行後のターゲットコレクションにその Function 設定を保持します。これらの継承された設定は変更できません。

- 移行中に他の VARCHAR フィールドに対して全文検索を有効にすることもできます。詳細は、[Full Text Search](./full-text-search) を参照してください。

</Admonition>

## 移行プロセスを監視する\{#monitor-the-migration-process}

**Migrate** をクリックすると、移行ジョブが生成されます。移行の進行状況は [Jobs](./job-center) ページで確認できます。ジョブステータスが **In Progress** から **Successful** に切り替わると、移行は完了です。

![RGsvb7oFpo7uzbxjSSFc6owNn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/rgsvb7ofpo7uzbxjssfc6ownn0c.png "RGsvb7oFpo7uzbxjSSFc6owNn0c")

## 移行後\{#post-migration}

移行ジョブの完了後は、以下の点に注意してください。

- **インデックスの作成**: 移行プロセスでは、移行されたコレクションに対して [AUTOINDEX](./autoindex-explained) が自動的に作成されます。

- **手動でのロードが必要**: 自動的にインデックスが作成されても、移行されたコレクションはすぐには検索またはクエリ操作に利用できません。検索およびクエリ機能を有効にするには、Zilliz Cloud でコレクションを手動でロードする必要があります。詳細は、[Load & Release](./load-release-collections) を参照してください。

<Admonition type="info" icon="📘" title="注意">

コレクションがロードされたら、ターゲットクラスター内のコレクション数およびエンティティ数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが不足しているコレクションを削除し、再度移行してください。

</Admonition>

## 移行ジョブをキャンセルする\{#cancel-migration-job}

移行プロセスで問題が発生した場合は、以下の手順でトラブルシューティングを行い、移行を再開できます。

<Procedures>

1. [Jobs](./job-center) ページで、失敗した移行ジョブを特定してキャンセルします。

1. **Actions** 列の **View Details** をクリックして、エラーログにアクセスします。

</Procedures>
