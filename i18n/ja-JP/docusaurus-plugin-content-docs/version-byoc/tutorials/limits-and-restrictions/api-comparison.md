---
title: "APIの利用可能性 | BYOC"
slug: /api-comparison
sidebar_label: "APIの利用可能性"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、より良いユーザーエクスペリエンスを提供するために、Milvusとはやや異なる方法で動作します。この記事では、APIに関する2つのプラットフォームの違いを明確にすることを目的としています。 | BYOC"
type: origin
token: DAk8w3GCJiuUTTkms6IcMtnAnMf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - api availability
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database

---

import Admonition from '@theme/Admonition';


# APIの利用可能性

Zilliz Cloudは、より良いユーザーエクスペリエンスを提供するために、Milvusとはやや異なる方法で動作します。この記事では、APIに関する2つのプラットフォームの違いを明確にすることを目的としています。

MilvusからZilliz Cloudへの移行を計画している場合は、レガシーコードに必要な変更を加える必要があります。

## シナリオ固有の権限{#scenario-specific-privileges}

以下の表は、さまざまなサービス層でのAPIの利用可能性を比較しています。[Bring Your Own Cloud（BYOC）について](/docs/byoc/byoc-intro)ソリューションのAPIの利用可能性は、**StandardおよびEnterprise**層と一致しています。

<table>
   <tr>
     <th><p><strong>カテゴリー</strong></p></th>
     <th><p><strong>APIの</strong></p></th>
     <th><p><strong>コンソール</strong></p></th>
     <th><p><strong>フリー</strong></p></th>
     <th><p><strong>サーバーレス</strong></p></th>
     <th><p><strong>専用の</strong></p></th>
   </tr>
   <tr>
     <td rowspan="5"><p>エイリアス</p></td>
     <td><p>AlterAlias()の設定</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias()を作成する</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>ドロップエイリアス()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias()の説明</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>listAliases()メソッド</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>認証プロセス</p></td>
     <td><p>CreateCredential()を作成する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>タグ: deleteCredential()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>listCredUsers()の設定</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>updateCredential()を更新する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>バルクインサート</p></td>
     <td><p>バルク挿入()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>getBulkInsertState()を取得する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>listBulkInsertTasks()リスト</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="16"><p>コレクション</p></td>
     <td><p>getCollectionStatistics()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>クリエイトコレクション()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection()の説明</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>ドロップコレクション()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>AlterCollection(アルターコレクション)</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getLoading Progress()を取得する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getPersistentSgementInfo()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>この関数は、</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>getReplicas()メソッド</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>挿入する</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>これは、</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>リリースコレクション()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>showCollections()を表示する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getLoadState()を取得する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>ルネサンス()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>upsert()より</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>データベース</p></td>
     <td><p>リストデータベース</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>ドロップデータベース</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>データベースの作成</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p>インデックス</p></td>
     <td><p>クリエイトインデックス()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><h1 id="">インデックス</h1></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>ドロップインデックス()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getIndexBuildProgress()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getIndexState()を取得する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="6"><p>マネジメント</p></td>
     <td><p>この関数は</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getCompactionStateWithPlan()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getFlushState()を取得する</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getMetrics()を取得する</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>これは、</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>マニュアルコンパクト()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="7"><p>パーティション</p></td>
     <td><p>CreatePartition()を作成する</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>ドロップパーティション()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>getPartitionStatistics()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><h1 id="">パーティション</h1></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>ロードパーティション()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>リリースパーティション()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>showPartitions()を表示する</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>検索とクエリ</p></td>
     <td><p>検索する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>クエリー()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="12"><p>ロールベースアクセス制御(RBAC)</p></td>
     <td><p>addUserToRole()の設定</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>CreateRole()を作成する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>ドロップロール()</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>タグ: grantRolePrivilege</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>removeUser FromRole()を削除する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>リボーク権限()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
   </tr>
   <tr>
     <td><p>SelectGrantForRole()を選択してください。</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>selectGrantForRoleAndObject()</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>SelectRole()を選択してください。</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>SelectUser()を選択してください。</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>GrantPrivilegeV2()の設定</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>権限を取り消すV 2</p></td>
     <td><p>✔❄</p></td>
     <td><p>✘</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>システム</p></td>
     <td><p>getVersion()を取得する</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
   <tr>
     <td><p>チェックヘルス()</p></td>
     <td><p>✘</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
     <td><p>✔❄</p></td>
   </tr>
</table>
