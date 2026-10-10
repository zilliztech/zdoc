---
title: "エンドポイント経由で Milvus から Zilliz Cloud に移行する | Cloud"
slug: /via-endpoint
sidebar_label: "エンドポイント経由"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、インフラストラクチャを自身で管理することなく Milvus ベクトルデータベースを利用したいユーザー向けに、完全マネージドのクラウドホスト型ソリューションとして Milvus を提供しています。このトピックでは、データベースエンドポイント経由で Milvus から移行する方法について説明します。 | Cloud"
type: origin
token: PlX3wo82Di6oWVkg2ercRWCUnvV
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# エンドポイント経由で Milvus から Zilliz Cloud に移行する

Zilliz Cloud は、インフラストラクチャを自身で管理することなく Milvus ベクトルデータベースを利用したいユーザー向けに、完全マネージドのクラウドホスト型ソリューションとして [Milvus](https://milvus.io/) を提供しています。このトピックでは、データベースエンドポイント経由で Milvus から移行する方法について説明します。 

## 事前準備\{#prerequisites}

Milvus から Zilliz Cloud への移行を開始する前に、以下の要件を満たしていることを確認してください。

### Milvus の要件\{#milvus-requirements}

| 要件 | 詳細 |
| --- | --- |
| バージョン互換性 | Milvus 2.3.6 以降 |
| ネットワークアクセス | ソースの Milvus インスタンスがパブリックインターネットからアクセス可能である必要があります。 |
| 認証情報 | 認証が有効になっている場合はユーザー名とパスワード（[Authenticate User Access](https://milvus.io/docs/authenticate.md?tab=docker#Authenticate-User-Access) を参照） |

### Zilliz Cloud の要件\{#zilliz-cloud-requirements}

| 要件 | 詳細 |
| --- | --- |
| ユーザーロール | Organization Owner または Project Admin |
| クラスター容量 | 十分なストレージとコンピューティングリソース（[CU 計算ツール](https://zilliz.com/pricing#calculator) を使用して CU サイズを見積もります） |
| ネットワークアクセス | ネットワーク制限を使用している場合は、[Zilliz Cloud IPs](./zilliz-cloud-ips) を許可リストに追加します。 |

## はじめに\{#getting-started}

以下のデモでは、エンドポイント経由で Milvus からの移行を開始する方法を説明します。

<Supademo id="cmbkiuxw98p13sn1rc65tt6b0" title="Zilliz Cloud - Migrate from Milvus via Endpoint" />

<Admonition type="info" title="Notes">

- ソースコレクションで全文検索がすでに有効になっている場合、Zilliz Cloud は移行後にターゲットコレクションへその Function 設定を保持します。これらの継承された設定は変更できません。

- 移行中に、他の VARCHAR フィールドに対して全文検索を有効にすることもできます。詳細については、[Full Text Search](./full-text-search) を参照してください。

</Admonition>

### インデックス設定\{#index-settings}

最終確認ステップでは、**インデックス settings** を使用して、この移行ジョブがターゲットコレクションのインデックスをどのように処理するかを選択します。

- **Create インデックス after migration** はデフォルトで有効になっています。既存の移行ルールに従ってインデックスを自動的に作成するには、これをオンのままにします。

- インデックスの作成をスキップして、後でインデックスを構築する（たとえば計画メンテナンス時間帯など）には、これをオフにします。

<Admonition type="info" title="Note">

Create インデックス after migration をオフにすると、移行ジョブによってベクトルインデックスもスカラーインデックスも作成されません。移行されたコレクションは Unloaded のままとなり、手動でインデックスを作成してコレクションをロードするまで、検索やクエリを実行できません。

</Admonition>

**Migrate** をクリックする前に、確認情報でインデックス設定を確認します。

## 移行プロセスを監視する\{#monitor-the-migration-process}

一度 **Migrate** をクリックすると、移行ジョブが生成されます。[Jobs](./job-center) ページで移行の進捗を確認できます。ジョブのステータスが **In Progress** から **Successful** に変わると、移行は完了です。

インデックスの作成をスキップした場合、移行が成功するとジョブの詳細に **Indexes skipped** と表示されます。インデックスを作成してコレクションをロードするには、[post-migration steps](./via-endpoint#post-migration) の手順に従ってください。

![RGsvb7oFpo7uzbxjSSFc6owNn0c](https://zdoc-images.s3.us-west-2.amazonaws.com/rgsvb7ofpo7uzbxjssfc6ownn0c.png "RGsvb7oFpo7uzbxjSSFc6owNn0c")

## 移行後\{#post-migration}

移行ジョブが正常に完了したら、ターゲットコレクションを検索とクエリに備えて準備します。

- **自動インデックス作成が有効:** 移行ジョブは、既存の Milvus 移行ルールに従って [AUTOINDEX](./autoindex-explained) を作成します。ジョブの詳細でインデックスの作成が成功したことを確認してください。

- **インデックス作成をスキップ:** 移行ジョブはベクトルインデックスもスカラーインデックスも作成しません。すべてのベクトルフィールドに手動でインデックスを作成し、ワークロードに応じて必要に応じてスカラーインデックスを作成します。REST API の例については、[Create Index (V2)](/reference/restful/create-index-v2) を参照してください。

- **手動でのロードが必要:** インデックスの作成が完了したら、各コレクションを手動でロードし、検索やクエリを実行する前にロードが完了するまで待ちます。このステップは、インデックスが自動で作成されたか手動で作成されたかに関係なく必要です。[Load & Release](./load-release-collections) を参照してください。

<Admonition type="info" title="Notes">

コレクションがロードされたら、ターゲットクラスター内のコレクション数とエンティティ数がデータソースと一致していることを確認してください。不一致が見つかった場合は、エンティティが欠落しているコレクションを削除し、それらを再移行します。

</Admonition>

## 移行ジョブをキャンセルする\{#cancel-migration-job}

移行プロセスで問題が発生した場合は、次の手順でトラブルシューティングを行い、移行を再開できます。

<Procedures>

1. [Jobs](./job-center) ページで、失敗した移行ジョブを特定してキャンセルします。

1. **Actions** 列の **View Details** をクリックして、エラーログにアクセスします。

</Procedures>
