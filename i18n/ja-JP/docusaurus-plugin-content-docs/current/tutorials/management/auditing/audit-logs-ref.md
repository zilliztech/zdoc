---
title: "VectorDB 監査ログ リファレンス | Cloud"
slug: /audit-logs-ref
sidebar_label: "VectorDB 監査ログ リファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、監査ログの構文は以下の通りです | Cloud"
type: origin
token: Nby4wCqNviuLg3kEZpkcdKtnnnb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB 監査ログ リファレンス

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上、および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

Zilliz Cloud では、監査ログの構文は以下の通りです。

```json
{
    "date": "<timestamp>",
    "action": "<action_type>",
    "cluster_id": "<unique_cluster_identifier>",
    "database": "<database_name>",
    "interface": "<interface_type>",
    "log_type": "<log_type>",
    "params": {
        "<key1>": "<value1>",
        "<key2>": "<value2>",
      ...
    },
    "result": <result_code>,
    "status": "<action_status>",
    "time": <timestamp>,
    "trace_id": "<unique_trace_identifier>",
    "user": "<user_identifier>"
}
```

<table>
   <tr>
     <th><p>フィールド</p></th>
     <th><p>型</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>date</code></p></td>
     <td><p>String（ISO 8601 形式）</p></td>
     <td><p>アクションが発生した UTC のタイムスタンプです（例：<code>&quot;2025-01-21T08:38:39.494527Z&quot;</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>String</p></td>
     <td><p>実行されたアクションです（例：<code>&quot;DescribeCollection&quot;</code>）。利用可能なアクションの一覧については、<a href="./audit-logs-ref">アクション一覧</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションが発生したクラスターの一意の識別子です（例：<code>&quot;in01-b5a7e190615xxxf&quot;</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションの対象となるデータベースの名前です（例：<code>&quot;default&quot;</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>string</p></td>
     <td><p>アクションが実行されるインターフェースです（例：<code>&quot;Grpc&quot;</code>、<code>&quot;Restful&quot;</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>String</p></td>
     <td><p>ログエントリの種類です（例：<code>&quot;AUDIT&quot;</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>Object（キーと値のペア）</p></td>
     <td><p>アクションに関連する追加のパラメータです。<code>collection</code>、<code>consistency_level</code> などを含めることができます。</p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>Integer</p></td>
     <td><p>結果コードまたはステータスコードです（例：成功の場合は <code>0</code>、それ以外のコードはエラーを示す場合があります）。<code>status</code> が <code>Receive</code> の場合は利用できません。</p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>String</p></td>
     <td><p>ログに記録されるアクションのステータスです（例：<code>Receive</code>、<code>Success</code>、<code>Failed</code>）。</p><ul><li><p><code>Receive</code>: アクションはシステムに受信されましたが、完了していません。</p></li><li><p><code>Success</code>: アクションは問題なく正常に完了しました。</p></li><li><p><code>Failed</code>: アクションは失敗しました。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>time</code></p></td>
     <td><p>Integer（エポック時間、ミリ秒）</p></td>
     <td><p>1970 年以降のミリ秒単位のタイムスタンプです（エポック時間）。</p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>String</p></td>
     <td><p>システム間でリクエストを追跡するための一意の識別子です。ログ同士を関連付けるのに役立ちます。</p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションを実行したユーザーです。</p></td>
   </tr>
</table>

## アクション一覧\{#list-of-actions}

以下の表は、監査用にログに記録できるデータプレーン上のアクションをまとめたものです。

### 接続\{#connection}

| `action` | 説明 |
| --- | --- |
| Connect | 接続を確立します。 |

### データベース\{#database}

| `action` | 説明 |
| --- | --- |
| ListDatabases | 現在のインスタンス内のすべてのデータベースを表示します。 |
| DescribeDatabase | データベースの詳細を表示します。 |
| CreateDatabase | データベースを作成します。 |
| DropDatabase | データベースを削除します。 |
| AlterDatabase | データベースのプロパティを変更します。 |

### コレクション\{#collection}

| `action` | 説明 |
| --- | --- |
| GetLoadState | コレクションのロードステータスを確認します。 |
| GetLoadingProgress | コレクションのロード進行状況を確認します。 |
| DescribeCollection | コレクションの詳細を表示します。 |
| CreateCollection | コレクションを作成します。 |
| HasCollection | データベース内にコレクションが存在するかどうかを確認します。 |
| DropCollection | コレクションを削除します。 |
| LoadCollection | コレクションをロードします。 |
| AlterCollection | コレクションのスキーマまたは構成を変更します。 |
| ShowCollections | コレクション権限を持つすべてのコレクションを表示します。 |
| RenameCollection | コレクションの名前を変更します。 |
| ReleaseCollection | コレクションをリリースします。 |
| GetCollectionStatistics | コレクションの統計情報（例：コレクション内のエンティティ数）を取得します。 |
| Flush | コレクション内のすべてのエンティティを sealed segment に永続化します。flush 操作後に挿入されたエンティティは、新しい segment に保存されます。 |
| GetFlushState | コレクションの flush 操作のステータスを確認します。 |
| CreateAlias | コレクションのエイリアスを作成します。 |
| DescribeAlias | コレクションのエイリアスを表示します。 |
| AlterAlias | コレクションに関連付けられたエイリアスを変更します。 |
| ListAliases | コレクションのすべてのエイリアスを表示します。 |
| DropAlias | コレクションのエイリアスを削除します。 |
| GetReplicas | コレクションのレプリカを取得します。 |

### パーティション\{#partition}

| `action` | 説明 |
| --- | --- |
| CreatePartition | パーティションを作成します。 |
| HasPartition | パーティションが存在するかどうかを確認します。 |
| LoadPartitions | 1 つ以上のパーティションをロードします。 |
| ShowPartitions | コレクション内のすべてのパーティションを表示します。 |
| DropPartition | パーティションを削除します。 |
| ReleasePartitions | 1 つ以上のパーティションをリリースします。 |
| GetPartitionStatistics | パーティションの統計情報を取得します。 |

### インデックス\{#index}

| `action` | 説明 |
| --- | --- |
| CreateIndex | インデックスを作成します。 |
| DescribeIndex | コレクションのインデックス構築の進捗を表示します。 |
| AlterIndex | 既存のインデックスの構成またはパラメータを更新します。 |
| GetIndexState | 既存のインデックスの構成またはパラメータを更新します。 |
| GetIndexStatistics | インデックスの現在の状態を取得します（例：`building`、`built`、`failed`）。 |
| GetIndexBuildProgress | メモリ使用量やインデックス化されたエンティティ数など、インデックスの詳細な統計情報を取得します。 |
| DropIndex | コレクション内の特定の segment に対する詳細なインデックスデータを取得します。 |

### エンティティ\{#entity}

| `action` | 説明 |
| --- | --- |
| Insert | エンティティを挿入します。 |
| Query | クエリを実行します。 |
| Search | 検索を実行します。 |
| HybridSearch | ハイブリッド検索を実行します。 |
| Delete | エンティティを削除します。 |
| Upsert | エンティティをアップサートします。 |

### RBAC\{#rbac}

| `action` | 説明 |
| --- | --- |
| SelectRole | 現在のインスタンスで利用可能なロールの一覧を取得します。 |
| CreateRole | ユーザー権限を管理するための新しいロールを定義します。 |
| DropRole | ロールを削除します。 |
| OperateUserRole | ユーザーにロールを割り当てる、またはユーザーからロールを削除します。 |
| ListPrivilegeGroups | 現在のインスタンス内のすべての権限グループを表示します。 |
| OperatePrivilegeV2 | 権限グループに対して特定の権限を追加または削除します。 |
| SelectGrant | 特定のロールまたはユーザーに割り当てられたすべての権限付与の一覧を取得します。 |
| CreateCredential | システムにアクセスするための新しい認証情報（例：API key またはトークン）を作成します。 |
| UpdateCredential | 既存の認証情報のプロパティまたは権限を更新します。 |
| DeleteCredential | システムから認証情報を削除します。 |
| ListCredUsers | 特定の認証情報に関連付けられたすべてのユーザーの一覧を取得します。 |

### その他\{#others}

| `action` | 説明 |
| --- | --- |
| Authorize | 認可に失敗した場合にのみ記録され、`status` は `Refused` として記録されます。 |

