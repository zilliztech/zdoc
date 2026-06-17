---
title: "バックアップファイルからの復元 | BYOC"
slug: /restore-from-backup-files
sidebar_key: restore-from-backup-files
sidebar_label: "バックアップファイルから復元"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の復元機能を使用すると、誤ったデータの消失、破損、またはシステム障害の場合にバックアップファイルからデータを復旧でき、ビジネスの継続性を確保します。インシデントからの復旧、意図しない変更の巻き戻し、または最小限の中断でテスト用にクラスターをクローン作成するための信頼性の高い方法です。 | BYOC"
type: origin
token: Dd6jwYIGiiz6HWkEPJqcpMA3n6g
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - バックアップ
  - 復元

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# バックアップファイルからの復元

Zilliz Cloud の復元機能を使用すると、誤ったデータの消失、破損、またはシステム障害が発生した場合にバックアップファイルからデータを復元し、ビジネスの継続性を確保できます。これは、インシデントからの復旧、意図しない変更の巻き戻し、または最小限の中断でテスト用にクラスターをクローン作成するための信頼性の高い方法です。

このガイドでは、バックアップファイルからクラスターの完全または部分的な復元を行う方法について説明します。

## 制限\{#limits}

- **アクセス制御**: プロジェクト管理者、組織オーナー、またはバックアップ権限を持つカスタムロールである必要があります。

## クラスター全体の復元\{#restore-a-full-cluster}

すべてのデータベースとコレクションを含むクラスター全体を、**新しい**クラスターに復元できます。これは、テストまたは復旧のための環境のクローン作成に役立ちます。クラスター全体を復元するには、バックアップファイルがクラスターバックアップである必要があります。

復元中に、次の項目も設定できます。

- RBAC 設定を含めるかどうかを選択します。

- 復元後に作成される新しいクラスターの Milvus バージョンを選択します。

    - 過去 30 日以内に作成されたバックアップファイルで、元のクラスターが利用可能な最新の Milvus GA バージョンより前の GA バージョンを使用していた場合、復元後のクラスターで使用する Milvus バージョンを選択できます。デフォルトでは、Zilliz Cloud は最新の GA Milvus バージョンに復元します。

    - 30 日より前に作成されたバックアップファイル、またはすでに最新の Milvus GA バージョンを使用しているバックアップファイルでは、ターゲット Milvus バージョンを変更できません。

    たとえば、利用可能な最新の Milvus GA バージョンが 2.6.x であるとします。

    - 過去 30 日以内に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元しますが、2.5.x に復元するよう選択できます。

    - 30 日より前に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元し、ターゲット Milvus バージョンは変更できません。

    - 2.6.x のバックアップファイルから復元する場合、Zilliz Cloud は新しいクラスターを 2.6.x に復元し、ターゲット Milvus バージョンは変更できません。

- CMEK による保存時暗号化を有効にするかどうかを選択します。詳細については、[カスタマー管理暗号化キー](./cmek)を参照してください。

復元後、**新しいパスワード**が `db_admin` ユーザーに生成されます。このパスワードを使用して、復元されたクラスターに接続してください。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールでクラスター全体を復元する方法を示しています。

<Supademo id="cmcsruzjd0gyo9st8kcjye30i" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、既存のバックアップファイルから `Dedicated-01-backup` という名前の新しいクラスターにクラスター全体を復元します。RESTful API の詳細については、[クラスターバックアップの復元](/reference/restful/restore-cluster-backup-v2) を参照してください。

```bash
export API_KEY="YOUR_API_KEY"
export BASE_URL="https://api.cloud.zilliz.com"
export CLUSTER_ID="your-cluster-id"

curl --request POST \
     --url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCluster" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-type: application/json" \
     --data-raw '{
        "targetProjectId": "proj-20e13e974c7d659a83xxxx",
        "clusterName": "Dedicated-01-backup",
        "cuSize": 1,
        "collectionStatus": "KEEP",
        "restoreVersionPolicy": "ORIGINAL"
      }'
```

次の表は、各パラメーターについて説明しています。

<table>
   <tr>
     <th><p><strong>パラメーター</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>targetProjectId</code></p></td>
     <td><p>復元後のクラスターを作成するターゲットプロジェクトの ID。</p></td>
   </tr>
   <tr>
     <td><p><code>clusterName</code></p></td>
     <td><p>復元後のクラスター名。</p></td>
   </tr>
   <tr>
     <td><p><code>cuSize</code></p></td>
     <td><p>復元後のクラスターのクエリ CU サイズ。</p></td>
   </tr>
   <tr>
     <td><p><code>collectionStatus</code></p></td>
     <td><p>復元後にコレクションのロード状態を保持するかどうか。使用可能なオプションは次のとおりです。</p><ul><li><p><code>KEEP</code>: 元のコレクション状態を保持します。</p></li><li><p><code>RELEASE</code>: すべてのコレクションを解放します。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>restoreVersionPolicy</code></p></td>
     <td><p>復元後のクラスターで使用する互換 Milvus バージョン。使用可能なオプションは次のとおりです。</p><ul><li><p><code>ORIGINAL</code>: クラスターを元の互換 Milvus バージョンに復元します。</p></li><li><p><code>LATEST</code>: 利用可能な最新の GA Milvus バージョンに復元します。</p></li></ul></td>
   </tr>
</table>

復元ジョブが生成され、進捗状況は [プロジェクトジョブセンター](./job-center) で確認できます。

```bash
{
  "code": 0,
  "data": {
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "username": "db_admin",
    "password": "xxxxxxxxx",
    "jobId": "job-xxxxxxxxxxxxxx"
  }
}
```

## クラスタの一部を復元する\{#restore-a-partial-cluster}

特定のデータベースとコレクションのみを**既存のクラスタ**に復元することも選択できます。

### ウェブコンソール経由\{#via-web-console}

以下のデモでは、Zilliz Cloud ウェブコンソールでクラスタ内の特定のデータベースとコレクションを復元する方法を示しています。

<Supademo id="cmcss7xi00h8c9st8qsqnutnn" title=""  />

### RESTful API経由\{#via-restful-api}

以下の例では、バックアップファイルからコレクションを既存のクラスタ `in01-3e5ad8adc38xxxx` に復元します。RESTful API の詳細については、[コレクションバックアップの復元](/reference/restful/restore-collection-backup-v2) を参照してください。

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/restoreCollection" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
-d '{
    "destClusterId": "in01-xxxxxxxxxxxxxx",
    "dbCollections": [
        {
            "collections": [
                {
                    "collectionName": "medium_articles",
                    "destCollectionName": "restore_medium_articles",
                    "destCollectionStatus": "LOADED"
                }
            ]
        }
    ]
}'
```

復元ジョブが生成され、進捗状況は [プロジェクトジョブセンター](./job-center) で確認できます。

```bash
{
  "code": 0,
  "data": {
    "jobId": "job-04bf9335838dzkeydpxxxx"
  }
}
```

## FAQ\{#faq}

**復元されたクラスターはどの Milvus バージョンで実行されますか？**

デフォルトでは、クラスター全体の復元により、Zilliz Cloud がサポートする最新の GA メジャーバージョンでターゲットクラスターが作成されます。

- 過去 30 日以内に作成されたバックアップファイルで、元のクラスターが利用可能な最新の Milvus GA バージョンより前の GA バージョンを使用していた場合、復元後のクラスターで使用する Milvus バージョンを選択できます。デフォルトでは、Zilliz Cloud は最新の GA Milvus バージョンに復元します。

- 30 日より前に作成されたバックアップファイル、またはすでに最新の Milvus GA バージョンを使用しているバックアップファイルでは、ターゲット Milvus バージョンを変更できません。

たとえば、利用可能な最新の Milvus GA バージョンが 2.6.x であるとします。

- 過去 30 日以内に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元しますが、2.5.x に復元するよう選択できます。

- 30 日より前に作成された 2.5.x のバックアップファイルから復元する場合、Zilliz Cloud はデフォルトで新しいクラスターを 2.6.x に復元し、ターゲット Milvus バージョンは変更できません。

- 2.6.x のバックアップファイルから復元する場合、Zilliz Cloud は新しいクラスターを 2.6.x に復元し、ターゲット Milvus バージョンは変更できません。
