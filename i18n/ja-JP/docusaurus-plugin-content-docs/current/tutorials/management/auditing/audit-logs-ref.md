---
title: "VectorDB 監査ログ リファレンス | Cloud"
slug: /audit-logs-ref
sidebar_label: "VectorDB 監査ログ リファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、監査ログは以下の構文を持ちます | Cloud"
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

Zilliz Cloud では、監査ログは以下の構文を持ちます。

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
     <td><p>String (ISO 8601 形式)</p></td>
     <td><p>アクションが発生した UTC のタイムスタンプです（例: <code>"2025-01-21T08:38:39.494527Z"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>String</p></td>
     <td><p>実行されたアクションです（例: <code>"DescribeCollection"</code>）。利用可能なアクションの一覧については、<a href="./audit-logs-ref">アクション一覧</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションが発生した cluster の一意識別子です（例: <code>"in01-b5a7e190615xxxf"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションに関係する database の名前です（例: <code>"default"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>string</p></td>
     <td><p>アクションが実行されるインターフェースです（例: <code>"Grpc"</code>、<code>"Restful"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>String</p></td>
     <td><p>ログエントリの種類です（例: <code>"AUDIT"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>Object (キーと値のペア)</p></td>
     <td><p>アクションに関連する追加パラメータです。これには <code>collection</code>、<code>consistency_level</code> などが含まれる場合があります。</p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>Integer</p></td>
     <td><p>結果コードまたはステータスコードです（例: 成功時は <code>0</code>、それ以外のコードはエラーを示す場合があります）。<code>status</code> が <code>Receive</code> の場合は利用できません。</p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>String</p></td>
     <td><p>記録対象のアクションのステータスです（例: <code>Receive</code>、<code>Success</code>、<code>Failed</code>）。</p><ul><li><p><code>Receive</code>: アクションはシステムに受信されましたが、まだ完了していません。</p></li><li><p><code>Success</code>: アクションは問題なく正常に完了しました。</p></li><li><p><code>Failed</code>: アクションは失敗しました。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>time</code></p></td>
     <td><p>Integer (エポック時間、ミリ秒)</p></td>
     <td><p>1970 年からのミリ秒単位のタイムスタンプです（エポック時間）。</p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>String</p></td>
     <td><p>システム間でリクエストを追跡するための一意識別子です。これによりログ同士を関連付けることができます。</p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションを実行したユーザーです。</p></td>
   </tr>
</table>

## アクション一覧\{#list-of-actions}

以下の表は、監査用にログ記録できるデータプレーン上のアクションをまとめたものです。

### 接続\{#connection}

| `action` | 説明 |
| --- | --- |
| Connect | 接続を確立する |

### Database\{#database}

| `action` | 説明 |
| --- | --- |
| ListDatabases | 現在のインスタンス内のすべての database を表示する |
| DescribeDatabase | database の詳細を表示する |
| CreateDatabase | database を作成する |
| DropDatabase | database を削除する |
| AlterDatabase | database のプロパティを変更する |

### Collection\{#collection}

| `action` | 説明 |
| --- | --- |
| GetLoadState | collection のロード状態を確認する |
| GetLoadingProgress | collection のロード進捗を確認する |
| DescribeCollection | collection の詳細を表示する |
| CreateCollection | collection を作成する |
| HasCollection | database 内に collection が存在するか確認する |
| DropCollection | collection を削除する |
| LoadCollection | collection をロードする |
| AlterCollection | collection のスキーマまたは構成を変更する |
| ShowCollections | collection 権限を持つすべての collection を表示する |
| RenameCollection | collection の名前を変更する |
| ReleaseCollection | collection を解放する |
| GetCollectionStatistics | collection の統計情報を取得する（例: collection 内のエンティティ数） |
| Flush | collection 内のすべてのエンティティを sealed segment に永続化します。flush 操作後に挿入されたエンティティは新しい segment に保存されます。 |
| GetFlushState | collection の flush 操作の状態を確認する |
| CreateAlias | collection の alias を作成する |
| DescribeAlias | collection の alias を表示する |
| AlterAlias | collection に関連付けられた alias を変更する |
| ListAliases | collection のすべての alias を表示する |
| DropAlias | collection の alias を削除する |
| GetReplicas | collection の replica を取得する |

### Partition\{#partition}

| `action` | 説明 |
| --- | --- |
| CreatePartition | partition を作成する |
| HasPartition | partition が存在するかどうかを確認する |
| LoadPartitions | 1 つ以上の partition をロードする |
| ShowPartitions | collection 内のすべての partition を表示する |
| DropPartition | partition を削除する |
| ReleasePartitions | 1 つ以上の partition を解放する |
| GetPartitionStatistics | partition の統計情報を取得する |

### Index\{#index}

| `action` | 説明 |
| --- | --- |
| CreateIndex | index を作成する |
| DescribeIndex | collection の index 構築の進捗を表示する |
| AlterIndex | 既存の index の構成またはパラメータを更新する |
| GetIndexState | 既存の index の構成またはパラメータを更新する |
| GetIndexStatistics | index の現在の状態を取得する（例: `building`、`built`、`failed`） |
| GetIndexBuildProgress | メモリ使用量やインデックス化済みエンティティ数など、index の詳細な統計情報を取得する |
| DropIndex | collection 内の特定の segment に対する詳細な index データを取得する |

### Entity\{#entity}

| `action` | 説明 |
| --- | --- |
| Insert | エンティティを挿入する |
| Query | クエリを実行する |
| Search | 検索を実行する |
| HybridSearch | ハイブリッド検索を実行する |
| Delete | エンティティを削除する |
| Upsert | エンティティを upsert する |

### RBAC\{#rbac}

| `action` | 説明 |
| --- | --- |
| SelectRole | 現在のインスタンスで利用可能なロールの一覧を取得する |
| CreateRole | ユーザー権限を管理するための新しいロールを定義する |
| DropRole | ロールを削除する |
| OperateUserRole | ユーザーにロールを割り当てる、またはユーザーからロールを削除する |
| ListPrivilegeGroups | 現在のインスタンス内のすべての権限グループを表示する |
| OperatePrivilegeV2 | 権限グループに特定の権限を追加または削除する |
| SelectGrant | 特定のロールまたはユーザーに割り当てられたすべての権限付与の一覧を取得する |
| CreateCredential | システムにアクセスするための新しい認証情報（例: API key やトークン）を作成する |
| UpdateCredential | 既存の認証情報のプロパティまたは権限を更新する |
| DeleteCredential | システムから認証情報を削除する |
| ListCredUsers | 特定の認証情報に関連付けられたすべてのユーザーの一覧を取得する |

### その他\{#others}

| `action` | 説明 |
| --- | --- |
| Authorize | 認可に失敗した場合にのみ記録され、`status` は `Refused` として記録されます。 |

