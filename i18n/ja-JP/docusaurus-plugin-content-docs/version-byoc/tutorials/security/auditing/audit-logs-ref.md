---
title: "監査ログの参照 | BYOC"
slug: /audit-logs-ref
sidebar_label: "監査ログの参照"
beta: PRIVATE
notebook: FALSE
description: "Zilliz Cloudでは、監査ログには以下の構文があります | BYOC"
type: origin
token: XPULwZfM9iEVMBk5zmAcmrPcnPm
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - auditing
  - log
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';


# 監査ログの参照

Zilliz Cloudでは、監査ログには以下の構文があります:

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
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><code>date</code></p></td>
     <td><p>文字列(ISO 8601フォーマット)</p></td>
     <td><p>アクションが発生したタイムスタンプ、UTC(例:、 <code>"2025-01-21T08:38:39.494527Z"</code>).</p></td>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>文字列</p></td>
     <td><p>実行されたアクション（例:"DescribeCollection"）。利用可能なアクションのリストについては、「<a href="./audit-logs-ref#list-of-actions">アクションのリスト</a>」を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>文字列</p></td>
     <td><p>アクションが発生したクラスターの一意の識別子(例:「<code>in01-b5a7e190615xxxf</code>」)。</p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>文字列</p></td>
     <td><p>アクションに関与するデータベースの名前(例:"<code>default</code>")。</p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>文字列</p></td>
     <td><p>アクションが実行されるインターフェース(例:"<code>Grpc</code>"、"<code>Restful</code>")。</p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>文字列</p></td>
     <td><p>ログエントリの種類(例:"<code>AUDIT</code>")。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>オブジェクト（キーと値のペア）</p></td>
     <td><p>アクションに関連する追加パラメータ。これには、<code>collection</code>、<code>consistence_level</code>などが含まれます。</p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>Integer型の整数</p></td>
     <td><p>結果コードまたはステータスコード(例:成功の場合は0、その他のコードはエラーを示す場合があります)。<code>status</code> が「Receive」の場合は利用できません。</p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>文字列</p></td>
     <td><p>ログに記録されるアクションのステータス（例: <code>Receive</code>、<code>Success</code>、<code>Failed</code>）。</p><ul><li><p><code>Receive</code>:アクションはシステムによって受信されましたが、完了していません。</p></li><li><p><code>Success</code>:アクションは問題なく正常に完了しました。</p></li><li><p><code>Failed</code>:アクションが失敗しました。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>time</code></p></td>
     <td><p>整数(エポック時間,ミリ秒)</p></td>
     <td><p>1970年以降のミリ秒単位のタイムスタンプ(エポック時間)。</p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>文字列</p></td>
     <td><p>システム間でリクエストを追跡するための一意の識別子。これにより、ログをリンクするのに役立ちます。</p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>文字列</p></td>
     <td><p>アクションを実行したユーザー。可能な値:</p><ul><li><p><code>zcloud_dms</code>:アクションはZilliz Cloudコンソールを介して実行されました。</p></li><li><p><code>zcloud_apikey_admin</code>:アクションはRESTful APIを介して実行されました。注: APIキーを介して実行されたアクションは、特定のユーザーを識別せずに- <code>zcloud_apikey_admin</code>としてログに記録されます。個々のAPIキーのログに対するサポートは、後のリリースで追加されます。</p></li></ul></td>
   </tr>
</table>

## アクションのリスト{#list-of-actions}

次の表は、監査のためにログに記録できるデータプレーン上のアクションをまとめたものです。

### コネクション{#connection}

<table>
   <tr>
     <th><p>アクション</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>Connect</p></td>
     <td><p>接続を確立する</p></td>
   </tr>
</table>

### データベース{#database}

<table>
   <tr>
     <th><p>アクション</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>現在のインスタンスのすべてのデータベースを表示する</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>データベースの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>データベースを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>データベースを削除</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>データベースのプロパティを変更する</p></td>
   </tr>
</table>

### コレクション{#collection}

<table>
   <tr>
     <th><p>アクション</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>コレクションのロード状態を確認する</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>コレクションの読み込み状況を確認する</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>コレクションの詳細を見る</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>コレクションを作成する</p></td>
   </tr>
   <tr>
     <td><p>HasCollection</p></td>
     <td><p>データベースにコレクションが存在するかどうかを確認してください</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>コレクションを削除する</p></td>
   </tr>
   <tr>
     <td><p>LoadCollection</p></td>
     <td><p>コレクションをロードする</p></td>
   </tr>
   <tr>
     <td><p>AlterCollection</p></td>
     <td><p>コレクションのスキーマまたは構成を変更する</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>コレクション権限を持つすべてのコレクションを表示する</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>コレクションの名前を変更する</p></td>
   </tr>
   <tr>
     <td><p>ReleaseCollection</p></td>
     <td><p>コレクションをリリースする</p></td>
   </tr>
   <tr>
     <td><p>GetCollectionStatistics</p></td>
     <td><p>コレクションの統計情報を取得する（例:コレクション内のエンティティの数）</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>コレクション内のすべてのエンティティをシールされたセグメントに保持します。フラッシュ操作の後に挿入されたエンティティは、新しいセグメントに保存されます。</p></td>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>コレクションフラッシュ操作の状態を確認する</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>コレクションのエイリアスを作成する</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>コレクションのエイリアスを記述する</p></td>
   </tr>
   <tr>
     <td><p>AlterAlias</p></td>
     <td><p>コレクションに関連付けられたエイリアスを変更する</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>コレクションのすべてのエイリアスを表示する</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>コレクションのエイリアスを削除する</p></td>
   </tr>
   <tr>
     <td><p>GetReplicas</p></td>
     <td><p>コレクションのレプリカを取得する</p></td>
   </tr>
</table>

### パーティション{#partition}

<table>
   <tr>
     <th><p>アクション</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>パーティションを作成する</p></td>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>パーティションが存在するかどうかを確認する</p></td>
   </tr>
   <tr>
     <td><p>LoadPartitions</p></td>
     <td><p>1つ以上のパーティションをロードする</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>コレクション内のすべてのパーティションを見る</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>パーティションを削除する</p></td>
   </tr>
   <tr>
     <td><p>ReleasePartitions</p></td>
     <td><p>1つ以上のパーティションを解放する</p></td>
   </tr>
   <tr>
     <td><p>GetPartitionStatistics</p></td>
     <td><p>パーティションの統計情報を取得する</p></td>
   </tr>
</table>

### インデックス{#index}

<table>
   <tr>
     <th><p>アクション</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>インデックスを作成する</p></td>
   </tr>
   <tr>
     <td><p>DescribeIndex</p></td>
     <td><p>コレクションのインデックス構築の進捗状況を表示する</p></td>
   </tr>
   <tr>
     <td><p>AlterIndex</p></td>
     <td><p>既存のインデックスの設定またはパラメータを更新します</p></td>
   </tr>
   <tr>
     <td><p>GetIndexState</p></td>
     <td><p>既存のインデックスの設定またはパラメータを更新します</p></td>
   </tr>
   <tr>
     <td><p>GetIndexStatistics</p></td>
     <td><p>インデックスの現在の状態を取得します(例: <code>building</code>, <code>built</code>, <code>failed</code>)</p></td>
   </tr>
   <tr>
     <td><p>GetIndexBuildProgress</p></td>
     <td><p>メモリ使用量やインデックスされたエンティティの数など、インデックスに関する詳細な統計情報を取得します</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>コレクション内の特定のセグメントの詳細なインデックスデータを取得する</p></td>
   </tr>
</table>

### エンティティ{#entity}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>エンティティを挿入する</p></td>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>クエリを実行する</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>検索を実行する</p></td>
   </tr>
   <tr>
     <td><p>HybridSearch</p></td>
     <td><p>ハイブリッド検索を実行する</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>エンティティを削除する</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>エンティティを更新と挿入する</p></td>
   </tr>
</table>

### RBAC{#rbac}

<table>
   <tr>
     <th><p>アクション</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>SelectRole</p></td>
     <td><p>現在のインスタンスで利用可能なロールのリストを取得します</p></td>
   </tr>
   <tr>
     <td><p>CreateRole</p></td>
     <td><p>ユーザー権限を管理するための新しい役割を定義する</p></td>
   </tr>
   <tr>
     <td><p>DropRole</p></td>
     <td><p>役割を削除する</p></td>
   </tr>
   <tr>
     <td><p>OperateUserRole</p></td>
     <td><p>ユーザーに役割を割り当てるか、ユーザーから役割を削除します</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>現在のインスタンスのすべての特権グループを表示する</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeV2</p></td>
     <td><p>特権グループから特定の特権を追加または削除する</p></td>
   </tr>
   <tr>
     <td><p>SelectGrant</p></td>
     <td><p>特定の役割またはユーザーに割り当てられたすべての特権付与のリストを取得します</p></td>
   </tr>
   <tr>
     <td><p>CreateCredential</p></td>
     <td><p>システムにアクセスするための新しい資格情報(APIキーやトークンなど)を作成してください</p></td>
   </tr>
   <tr>
     <td><p>UpdateCredential</p></td>
     <td><p>既存の資格情報のプロパティまたは権限を更新する</p></td>
   </tr>
   <tr>
     <td><p>DeleteCredential</p></td>
     <td><p>システムから資格情報を削除する</p></td>
   </tr>
   <tr>
     <td><p>ListCredUsers</p></td>
     <td><p>特定の資格情報に関連するすべてのユーザーのリストを取得します</p></td>
   </tr>
</table>

### その他{#others}

<table>
   <tr>
     <th><p>アクション</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p>Authorize</p></td>
     <td><p>承認に失敗した場合にのみログに記録され、ステータスは<code>Refused</code>されました。</p></td>
   </tr>
</table>

