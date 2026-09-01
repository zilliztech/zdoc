---
title: "VectorDB 監査ログリファレンス | BYOC"
slug: /audit-logs-ref
sidebar_label: "VectorDB 監査ログリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud における監査ログの構文は次のとおりです | BYOC"
type: origin
token: Nby4wCqNviuLg3kEZpkcdKtnnnb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB 監査ログリファレンス

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

Zilliz Cloud における監査ログの構文は次のとおりです。

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
     <td><p>アクションが発生したタイムスタンプ (UTC、例: <code>&quot;2025-01-21T08:38:39.494527Z&quot;</code>)。</p></td>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>String</p></td>
     <td><p>実行されたアクション (例: <code>&quot;DescribeCollection&quot;</code>)。利用可能なアクションの一覧については、<a href="./audit-logs-ref">アクションの一覧</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションが発生したクラスターの一意の識別子 (例: <code>&quot;in01-b5a7e190615xxxf&quot;</code>)。</p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションに関連するデータベース名 (例: <code>&quot;default&quot;</code>)。</p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>string</p></td>
     <td><p>アクションの実行に使用されたインターフェース (例: <code>&quot;Grpc&quot;</code>、<code>&quot;Restful&quot;</code>)。</p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>String</p></td>
     <td><p>ログエントリの種類 (例: <code>&quot;AUDIT&quot;</code>)。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>オブジェクト (キーと値のペア)</p></td>
     <td><p>アクションに関連する追加パラメーターです。<code>collection</code> や <code>consistency_level</code> などが含まれます。</p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>Integer</p></td>
     <td><p>結果コードまたはステータスコード (例: 成功時は <code>0</code>、それ以外のコードはエラーを示す場合があります)。<code>status</code> が <code>Receive</code> の場合は取得できません。</p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>String</p></td>
     <td><p>記録対象のアクションのステータス (例: <code>Receive</code>、<code>Success</code>、<code>Failed</code>)。</p><ul><li><p><code>Receive</code>: アクションはシステムによって受信されましたが、まだ完了していません。</p></li><li><p><code>Success</code>: アクションが正常に完了しました。</p></li><li><p><code>Failed</code>: アクションが失敗しました。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>time</code></p></td>
     <td><p>Integer (エポック時間、ミリ秒)</p></td>
     <td><p>1970年からの経過時間をミリ秒単位で表したタイムスタンプ (エポック時間) です。</p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>String</p></td>
     <td><p>システム間でリクエストを追跡するための一意の識別子です。複数のログを関連付けるために使用されます。</p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>String</p></td>
     <td><p>アクションを実行したユーザーです。</p></td>
   </tr>
</table>

## アクションの一覧\{#list-of-actions}

以下の表に、監査ログとして記録可能なデータプレーンのアクションをまとめます。

### 接続\{#connection}

| `action` | 説明 |
| --- | --- |
| Connect | 接続を確立します |

### データベース\{#database}

| `action` | 説明 |
| --- | --- |
| ListDatabases | 現在のインスタンス内のすべてのデータベースを表示します |
| DescribeDatabase | データベースの詳細を表示します |
| CreateDatabase | データベースを作成します |
| DropDatabase | データベースを削除します |
| AlterDatabase | データベースのプロパティを変更します |

### コレクション\{#collection}

| `action` | 説明 |
| --- | --- |
| GetLoadState | コレクションのロード状態を確認します |
| GetLoadingProgress | コレクションのロード進捗を確認します |
| DescribeCollection | コレクションの詳細を表示します |
| CreateCollection | コレクションを作成します |
| HasCollection | データベース内にコレクションが存在するか確認します |
| DropCollection | コレクションを削除します |
| LoadCollection | コレクションをロードします |
| AlterCollection | コレクションのスキーマまたは設定を変更します |
| ShowCollections | コレクション権限を持つすべてのコレクションを表示します |
| RenameCollection | コレクションの名前を変更します |
| ReleaseCollection | コレクションを解放します |
| GetCollectionStatistics | コレクションの統計情報を取得します (例: コレクション内のエンティティ数) |
| Flush | コレクション内のすべてのエンティティをシールドセグメントに永続化します。フラッシュ操作後に挿入されたエンティティは、新しいセグメントに保存されます。 |
| GetFlushState | コレクションのフラッシュ操作の状態を確認します |
| CreateAlias | コレクションのエイリアスを作成します |
| DescribeAlias | コレクションのエイリアスの詳細を表示します |
| AlterAlias | コレクションに関連付けられたエイリアスを変更します |
| ListAliases | コレクションのすべてのエイリアスを表示します |
| DropAlias | コレクションのエイリアスを削除します |
| GetReplicas | コレクションのレプリカを取得します |

### パーティション\{#partition}

| `action` | 説明 |
| --- | --- |
| CreatePartition | パーティションを作成します |
| HasPartition | パーティションが存在するか確認します |
| LoadPartitions | 1つ以上のパーティションをロードします |
| ShowPartitions | コレクション内のすべてのパーティションを表示します |
| DropPartition | パーティションを削除します |
| ReleasePartitions | 1つ以上のパーティションを解放します |
| GetPartitionStatistics | パーティションの統計情報を取得します |

### インデックス\{#index}

| `action` | 説明 |
| --- | --- |
| CreateIndex | インデックスを作成します |
| DescribeIndex | コレクションのインデックス構築状況を表示します |
| AlterIndex | 既存のインデックスの設定またはパラメーターを更新します |
| GetIndexState | 既存のインデックスの設定またはパラメーターを更新します |
| GetIndexStatistics | インデックスの現在の状態を取得します (例: `building`、`built`、または `failed`) |
| GetIndexBuildProgress | メモリ使用量やインデックス済みエンティティ数など、インデックスに関する詳細な統計情報を取得します |
| DropIndex | コレクション内の特定のセグメントの詳細なインデックスデータを取得します |

### エンティティ\{#entity}

| `action` | 説明 |
| --- | --- |
| Insert | エンティティを挿入します |
| Query | クエリを実行します |
| Search | 検索を実行します |
| HybridSearch | ハイブリッド検索を実行します |
| Delete | エンティティを削除します |
| Upsert | エンティティをアップサートします |

### RBAC\{#rbac}

| `action` | 説明 |
| --- | --- |
| SelectRole | 現在のインスタンスで利用可能なロールの一覧を取得します |
| CreateRole | ユーザー権限を管理するための新しいロールを定義します |
| DropRole | ロールを削除します |
| OperateUserRole | ユーザーへのロールの割り当て、またはユーザーからのロールの削除を行います |
| ListPrivilegeGroups | 現在のインスタンス内のすべての権限グループを表示します |
| OperatePrivilegeV2 | 権限グループに対して特定の権限を追加または削除します |
| SelectGrant | 特定のロールまたはユーザーに付与されたすべての権限の一覧を取得します |
| CreateCredential | システムアクセス用の新しい資格情報 (API キーやトークンなど) を作成します |
| UpdateCredential | 既存の資格情報のプロパティまたは権限を更新します |
| DeleteCredential | システムから資格情報を削除します |
| ListCredUsers | 特定の資格情報に関連付けられたすべてのユーザーの一覧を取得します |

### その他\{#others}

| `action` | 説明 |
| --- | --- |
| Authorize | 認可に失敗した場合にのみログに記録され、`status` は `Refused` として記録されます。 |
