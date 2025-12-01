---
title: "VectorDB監査ログリファレンス | Cloud"
slug: /audit-logs-ref
sidebar_label: "VectorDB監査ログリファレンス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudでは、監査ログは以下の構文を持ちます | Cloud"
type: origin
token: Nby4wCqNviuLg3kEZpkcdKtnnnb
sidebar_position: 2
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - 監査
  - ロッグ
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector

---

import Admonition from '@theme/Admonition';


# VectorDB監査ログリファレンス

Zilliz Cloudでは、監査ログは以下の構文を持ちます：

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
     <th><p>タイプ</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><code>date</code></p></td>
     <td><p>文字列（ISO 8601形式）</p></td>
     <td><p>アクションが発生したタイムスタンプ（UTC、例：<code>"2025-01-21T08:38:39.494527Z"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>文字列</p></td>
     <td><p>実行されたアクション（例：<code>"DescribeCollection"</code>）。利用可能なアクション一覧については、<a href="./audit-logs-ref">アクション一覧</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>文字列</p></td>
     <td><p>アクションが発生したクラスターの固有識別子（例：<code>"in01-b5a7e190615xxxf"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>文字列</p></td>
     <td><p>アクションに関係するデータベース名（例：<code>"default"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>文字列</p></td>
     <td><p>アクションが実行されるインターフース（例：<code>"Grpc"</code>、<code>"Restful"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>文字列</p></td>
     <td><p>ログエントリのタイプ（例：<code>"AUDIT"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>オブジェクト（キーと値のペア）</p></td>
     <td><p>アクションに関連する追加パラメータ。これには<code>collection</code>、<code>consistency_level</code>などが含まれます。</p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>整数</p></td>
     <td><p>結果コードまたはステータスコード（例：<code>0</code>は成功、その他のコードはエラーを示す可能性があります）。<code>status</code>が<code>Receive</code>の場合は利用できません。</p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>文字列</p></td>
     <td><p>記録されるアクションのステータス（例：<code>Receive</code>、<code>Success</code>、<code>Failed</code>）。<ul><li><p><code>Receive</code>：アクションはシステムによって受信されましたが、完了していません。</p></li><li><p><code>Success</code>：アクションは問題なく正常に完了しました。</p></li><li><p><code>Failed</code>：アクションに失敗しました。</p></li></ul></p></td>
   </tr>
   <tr>
     <td><p><code>time</code></p></td>
     <td><p>整数（エポック時刻、ミリ秒）</p></td>
     <td><p>1970年からのミリ秒単位のタイムスタンプ（エポック時刻）。</p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>文字列</p></td>
     <td><p>システム間でリクエストを追跡するための固有識別子。これによりログを関連付けることができます。</p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>文字列</p></td>
     <td><p>アクションを実行したユーザー。</p></td>
   </tr>
</table>

## アクション一覧\{#list-of-actions}

以下の表は、監査のために記録される可能性のあるデータプレーンのアクションをまとめたものです。

### 接続\{#connection}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>Connect</p></td>
     <td><p>接続を確立する</p></td>
   </tr>
</table>

### データベース\{#database}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>現在のインスタンス内のすべてのデータベースを表示</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>データベースの詳細を表示</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>データベースを作成</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>データベースを削除</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>データベースのプロパティを変更</p></td>
   </tr>
</table>

### コレクション\{#collection}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>コレクションのロード状態を確認</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>コレクションのロード進行状況を確認</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>コレクションの詳細を表示</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>コレクションを作成</p></td>
   </tr>
   <tr>
     <td><p>HasCollection</p></td>
     <td><p>データベースにコレクションが存在するかどうかを確認</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>コレクションを削除</p></td>
   </tr>
   <tr>
     <td><p>LoadCollection</p></td>
     <td><p>コレクションをロード</p></td>
   </tr>
   <tr>
     <td><p>AlterCollection</p></td>
     <td><p>コレクションのスキーママまたは構成を変更</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>コレクション権限を持つすべてのコレクションを表示</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>コレクション名を変更</p></td>
   </tr>
   <tr>
     <td><p>ReleaseCollection</p></td>
     <td><p>コレクションをリリース</p></td>
   </tr>
   <tr>
     <td><p>GetCollectionStatistics</p></td>
     <td><p>コレクションの統計情報を取得（例：コレクション内のエンティティ数）</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>すべてのエンティティをシールされたセグメントに永続化します。フラッシュ操作後に挿入されたエンティティは新しいセグメントに保存されます。</p></td>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>コレクションフラッシュ操作のステータスを確認</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>コレクションのエイリアスを作成</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>コレクションのエイリアスを説明</p></td>
   </tr>
   <tr>
     <td><p>AlterAlias</p></td>
     <td><p>コレクションに関連付けられたエイリアスを変更</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>コレクションのすべてのエイリアスを表示</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>コレクションのエイリアスを削除</p></td>
   </tr>
   <tr>
     <td><p>GetReplicas</p></td>
     <td><p>コレクションのレプリカを取得</p></td>
   </tr>
</table>

### パション\{#partition}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>パーティションを作成</p></td>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>パーティションが存在するかどうかを確認</p></td>
   </tr>
   <tr>
     <td><p>LoadPartitions</p></td>
     <td><p>1つまたは複数のパーティションをロード</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>コレクション内のすべてのパーティションを表示</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>パーティションを削除</p></td>
   </tr>
   <tr>
     <td><p>ReleasePartitions</p></td>
     <td><p>1つまたは複数のパーティションをリリース</p></td>
   </tr>
   <tr>
     <td><p>GetPartitionStatistics</p></td>
     <td><p>パーティションの統計情報を取得</p></td>
   </tr>
</table>

### インデックス\{#index}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>インデックスを作成</p></td>
   </tr>
   <tr>
     <td><p>DescribeIndex</p></td>
     <td><p>コレクションのインデックス構築の進行状況を表示</p></td>
   </tr>
   <tr>
     <td><p>AlterIndex</p></td>
     <td><p>既存のインデックスの構成またはパラメータを更新</p></td>
   </tr>
   <tr>
     <td><p>GetIndexState</p></td>
     <td><p>既存のインデックスの構成またはパラメータを更新</p></td>
   </tr>
   <tr>
     <td><p>GetIndexStatistics</p></td>
     <td><p>インデックスの現在の状態（例：<code>building</code>、<code>built</code>、または<code>failed</code>）を取得</p></td>
   </tr>
   <tr>
     <td><p>GetIndexBuildProgress</p></td>
     <td><p>メモリ使用量やインデックス化されたエンティティ数など、インデックスに関する詳細な統計情報を取得</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>コレクション内の特定のセグメントの詳細インデックスデータを取得</p></td>
   </tr>
</table>

### エンティティ\{#entity}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>エンティティを挿入</p></td>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>クエリを実行</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>検索を実行</p></td>
   </tr>
   <tr>
     <td><p>HybridSearch</p></td>
     <td><p>ハイブリッド検索を実行</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>エンティティを削除</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>エンティティをアップサート</p></td>
   </tr>
</table>

### RBAC\{#rbac}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>SelectRole</p></td>
     <td><p>現在のインスタンスで利用可能なロールのリストを取得</p></td>
   </tr>
   <tr>
     <td><p>CreateRole</p></td>
     <td><p>ユーザーパ限を管理するための新しいロールを定義</p></td>
   </tr>
   <tr>
     <td><p>DropRole</p></td>
     <td><p>ロールを削除</p></td>
   </tr>
   <tr>
     <td><p>OperateUserRole</p></td>
     <td><p>ユーザーにロールを割り当てたり、ユーザーからロールを削除したりする</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>現在のインスタンス内のすべての権限グループを表示</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeV2</p></td>
     <td><p>権限グループから特定の権限を追加または削除</p></td>
   </tr>
   <tr>
     <td><p>SelectGrant</p></td>
     <td><p>特定のロールまたはユーザーに割り当てられたすべての権限付与のリストを取得</p></td>
   </tr>
   <tr>
     <td><p>CreateCredential</p></td>
     <td><p>システムにアクセスするための新しいクレデンシャル（APIキーまたはトークンなど）を作成</p></td>
   </tr>
   <tr>
     <td><p>UpdateCredential</p></td>
     <td><p>既存のクレデンシャルのプロパティまたは権限を更新</p></td>
   </tr>
   <tr>
     <td><p>DeleteCredential</p></td>
     <td><p>システムからクレデンシャルを削除</p></td>
   </tr>
   <tr>
     <td><p>ListCredUsers</p></td>
     <td><p>特定のクレデンシャルに関連付けられているすべてのユーザーのリストを取得</p></td>
   </tr>
</table>

### その他\{#others}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p>Authorize</p></td>
     <td><p>承認が失敗した場合にのみ記録され、<code>status</code>は<code>Refused</code>として記録されます。</p></td>
   </tr>
</table>